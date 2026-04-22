import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { ProposalInput } from '@/lib/ai/types';

type StoreModule = typeof import('@/lib/proposals/store');

/**
 * The store writes under `${process.cwd()}/data/proposals`. We swap cwd to a
 * fresh temp dir for each test so nothing leaks into the real data folder,
 * then reload the module so its `ROOT` constant picks up the new cwd.
 */
function loadStoreInTempDir(): { store: StoreModule; cwd: string; cleanup: () => void } {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'pf-store-'));
  const originalCwd = process.cwd();
  process.chdir(tmpRoot);
  jest.resetModules();
  const store = require('@/lib/proposals/store') as StoreModule;
  return {
    store,
    cwd: tmpRoot,
    cleanup: () => {
      process.chdir(originalCwd);
      rmSync(tmpRoot, { recursive: true, force: true });
    },
  };
}

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

describe('proposals/store: useCase and userOwner round-trip', () => {
  it('persists useCase=legacy and userOwner=pk through saveProposal + getProposalMeta', () => {
    const { store, cleanup } = loadStoreInTempDir();
    try {
      const id = store.newProposalId();
      const input = baseInput({ useCase: 'legacy', userOwner: 'pk' });
      const fakePdf = Buffer.from('%PDF-fake');

      store.saveProposal(id, fakePdf, {
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
      });

      const meta = store.getProposalMeta(id);
      expect(meta).toBeDefined();
      expect(meta!.input.useCase).toBe('legacy');
      expect(meta!.input.userOwner).toBe('pk');
      expect(meta!.input.projectTitle).toBe(input.projectTitle);
      expect(store.proposalExists(id)).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('persists other useCase values (linkedin) and alternate userOwner (aj)', () => {
    const { store, cleanup } = loadStoreInTempDir();
    try {
      const id = store.newProposalId();
      const input = baseInput({ useCase: 'linkedin', userOwner: 'aj' });
      const fakePdf = Buffer.from('%PDF-fake');

      store.saveProposal(id, fakePdf, {
        id,
        projectTitle: input.projectTitle,
        clientName: input.clientName,
        clientIndustry: input.clientIndustry,
        createdAt: new Date().toISOString(),
        status: 'generated',
        version: '1.0',
        aiProvider: 'test',
        sizeBytes: fakePdf.length,
        input,
      });

      const meta = store.getProposalMeta(id);
      expect(meta!.input.useCase).toBe('linkedin');
      expect(meta!.input.userOwner).toBe('aj');
    } finally {
      cleanup();
    }
  });
});
