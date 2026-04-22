/**
 * Tier 0 Step 4 — proposals.store.ts now backs onto Postgres (proposals schema).
 * Tests use a dedicated test DB (proposal_forge_test) with Prisma migrations
 * applied via Jest globalSetup. PDF bytes still live on disk, so each test runs
 * inside a temp cwd to keep data/proposals/ clean.
 */

import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { ProposalInput } from '@/lib/ai/types';
import { prisma } from '@/lib/db/client';
import {
  deleteProposal,
  getProposalMeta,
  getProposalPdf,
  listProposals,
  newProposalId,
  proposalDir,
  proposalExists,
  proposalSize,
  saveProposal,
} from '@/lib/proposals/store';

function baseInput(overrides: Partial<ProposalInput> = {}): ProposalInput {
  return {
    useCase: 'legacy',
    userOwner: 'pk',
    projectTitle: 'AI Transformation for Test Co',
    clientName: 'Test Co',
    clientIndustry: 'FinTech',
    projectPrompt: 'Deep integration across ops, risk, and customer service.',
    budgetMin: 150000,
    budgetMax: 250000,
    currency: 'USD',
    timelineWeeks: 20,
    teamSizePreference: 6,
    preferredTechnologies: [],
    compliance: [],
    methodology: 'Agile',
    pricingModel: 'Fixed Price',
    includeCaseStudies: true,
    includeTeamBios: true,
    proposalVersion: '1.0',
    ...overrides,
  };
}

const originalCwd = process.cwd();
let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = mkdtempSync(join(tmpdir(), 'pf-store-'));
  process.chdir(tmpRoot);
  await prisma.proposal.deleteMany({});
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(tmpRoot, { recursive: true, force: true });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('proposals/store (Postgres)', () => {
  it('saveProposal persists row + PDF; getProposalMeta reads it back', async () => {
    const id = newProposalId();
    const input = baseInput({ useCase: 'legacy', userOwner: 'pk' });
    const fakePdf = Buffer.from('%PDF-fake');

    await saveProposal(id, fakePdf, {
      id,
      projectTitle: input.projectTitle,
      clientName: input.clientName,
      clientIndustry: input.clientIndustry,
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: input.proposalVersion ?? '1.0',
      aiProvider: 'test',
      sizeBytes: fakePdf.length,
      input,
      enrichedCompanyId: null,
      draftStatus: 'generated',
      sections: { executive: 'stub' },
    });

    const meta = await getProposalMeta(id);
    expect(meta).toBeDefined();
    expect(meta!.input.useCase).toBe('legacy');
    expect(meta!.input.userOwner).toBe('pk');
    expect(meta!.projectTitle).toBe(input.projectTitle);
    expect(meta!.draftStatus).toBe('generated');
    expect(meta!.sections).toEqual({ executive: 'stub' });

    const onDisk = getProposalPdf(id);
    expect(onDisk?.equals(fakePdf)).toBe(true);
    expect(existsSync(join(proposalDir(id), 'proposal.pdf'))).toBe(true);

    expect(await proposalExists(id)).toBe(true);
    expect(proposalSize(id)).toBe(fakePdf.length);
  });

  it('enrichedCompanyId round-trips when supplied', async () => {
    const id = newProposalId();
    const enrichedId = '11111111-2222-3333-4444-555555555555';
    const input = baseInput({ useCase: 'legacy' });
    await saveProposal(id, Buffer.from('%PDF'), {
      id,
      projectTitle: input.projectTitle,
      clientName: input.clientName,
      clientIndustry: input.clientIndustry,
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: '1.0',
      aiProvider: 'test',
      sizeBytes: 4,
      input,
      enrichedCompanyId: enrichedId,
      draftStatus: 'generated',
      sections: {},
    });
    const meta = await getProposalMeta(id);
    expect(meta!.enrichedCompanyId).toBe(enrichedId);
  });

  it('listProposals returns newest-first summaries', async () => {
    const older = newProposalId();
    const newer = newProposalId();
    const input = baseInput();

    await saveProposal(older, Buffer.from('%PDF'), {
      id: older,
      projectTitle: 'Older',
      clientName: 'A',
      clientIndustry: 'FinTech',
      createdAt: new Date(Date.now() - 60_000).toISOString(),
      status: 'generated',
      version: '1.0',
      aiProvider: 'test',
      sizeBytes: 4,
      input,
    });
    await saveProposal(newer, Buffer.from('%PDF'), {
      id: newer,
      projectTitle: 'Newer',
      clientName: 'B',
      clientIndustry: 'Healthcare',
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: '1.0',
      aiProvider: 'test',
      sizeBytes: 4,
      input,
    });

    const all = await listProposals();
    expect(all.map((p) => p.projectTitle)).toEqual(['Newer', 'Older']);
  });

  it('deleteProposal removes the row AND the PDF directory', async () => {
    const id = newProposalId();
    await saveProposal(id, Buffer.from('%PDF'), {
      id,
      projectTitle: 't',
      clientName: 'c',
      clientIndustry: 'i',
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: '1.0',
      aiProvider: 'test',
      sizeBytes: 4,
      input: baseInput(),
    });
    expect(existsSync(proposalDir(id))).toBe(true);
    const removed = await deleteProposal(id);
    expect(removed).toBe(true);
    expect(await proposalExists(id)).toBe(false);
    expect(existsSync(proposalDir(id))).toBe(false);
    expect(await deleteProposal(id)).toBe(false); // idempotent on missing id
  });

  it('saveProposal with a duplicate id upserts instead of failing', async () => {
    const id = newProposalId();
    const input = baseInput();
    await saveProposal(id, Buffer.from('%PDF-v1'), {
      id,
      projectTitle: 'First',
      clientName: 'c',
      clientIndustry: 'i',
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: '1.0',
      aiProvider: 'test',
      sizeBytes: 7,
      input,
    });
    await saveProposal(id, Buffer.from('%PDF-v2-longer'), {
      id,
      projectTitle: 'Second',
      clientName: 'c',
      clientIndustry: 'i',
      createdAt: new Date().toISOString(),
      status: 'generated',
      version: '1.1',
      aiProvider: 'test',
      sizeBytes: 14,
      input: { ...input, proposalVersion: '1.1' },
    });

    const meta = await getProposalMeta(id);
    expect(meta!.projectTitle).toBe('Second');
    expect(meta!.version).toBe('1.1');
    expect(meta!.sizeBytes).toBe(14);
  });
});
