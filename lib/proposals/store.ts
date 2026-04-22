/**
 * Proposal storage — Tier 0 Step 4.
 *
 * Metadata + `sections` live in Postgres (proposals.proposals). The generated
 * PDF binary stays on disk at data/proposals/<id>/proposal.pdf so the iframe
 * preview + download routes keep working without streaming bytes through the
 * DB.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { ProposalInput } from '@/lib/ai/types';
import { prisma } from '@/lib/db/client';

function rootDir(): string {
  return join(process.cwd(), 'data', 'proposals');
}

// ─── Types (unchanged public surface) ────────────────────────────────────────

export interface ProposalMetadata {
  id: string;
  projectTitle: string;
  clientName: string;
  clientIndustry: string;
  createdAt: string; // ISO
  status: 'generated' | 'draft';
  version: string;
  aiProvider: string;
  sizeBytes: number;
  input: ProposalInput;
  /// Optional fields introduced in Step 4 so callers can store richer state
  /// without breaking existing consumers.
  enrichedCompanyId?: string | null;
  draftStatus?: 'generated' | 'in_review' | 'approved' | 'sent';
  sections?: Record<string, unknown>;
}

export interface ProposalSummary {
  id: string;
  projectTitle: string;
  clientName: string;
  clientIndustry: string;
  createdAt: string;
  sizeBytes: number;
  status: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureRoot(): void {
  mkdirSync(rootDir(), { recursive: true });
}

export function newProposalId(): string {
  // UUID so it parses as Postgres UUID and matches the Prisma @db.Uuid column.
  return randomUUID();
}

export function proposalDir(id: string): string {
  return join(rootDir(), id);
}

function pdfPath(id: string): string {
  return join(proposalDir(id), 'proposal.pdf');
}

function normalizeDraftStatus(
  status: ProposalMetadata['draftStatus'],
): 'generated' | 'in_review' | 'approved' | 'sent' {
  return status ?? 'generated';
}

// ─── Core CRUD ───────────────────────────────────────────────────────────────

export async function saveProposal(
  id: string,
  pdf: Buffer,
  meta: ProposalMetadata,
): Promise<void> {
  ensureRoot();
  const dir = proposalDir(id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(pdfPath(id), pdf);

  const createdAt = meta.createdAt ? new Date(meta.createdAt) : new Date();

  await prisma.proposal.upsert({
    where: { id },
    create: {
      id,
      enrichedCompanyId: meta.enrichedCompanyId ?? null,
      useCase: meta.input.useCase ?? 'small',
      userOwner: meta.input.userOwner ?? 'pk',
      draftStatus: normalizeDraftStatus(meta.draftStatus),
      sections: (meta.sections as object | null) ?? {},
      projectTitle: meta.projectTitle,
      clientName: meta.clientName,
      clientIndustry: meta.clientIndustry,
      status: meta.status,
      version: meta.version,
      aiProvider: meta.aiProvider,
      sizeBytes: meta.sizeBytes,
      input: meta.input as unknown as object,
      createdAt,
    },
    update: {
      enrichedCompanyId: meta.enrichedCompanyId ?? null,
      useCase: meta.input.useCase ?? 'small',
      userOwner: meta.input.userOwner ?? 'pk',
      draftStatus: normalizeDraftStatus(meta.draftStatus),
      sections: (meta.sections as object | null) ?? {},
      projectTitle: meta.projectTitle,
      clientName: meta.clientName,
      clientIndustry: meta.clientIndustry,
      status: meta.status,
      version: meta.version,
      aiProvider: meta.aiProvider,
      sizeBytes: meta.sizeBytes,
      input: meta.input as unknown as object,
    },
  });
}

export async function getProposalMeta(id: string): Promise<ProposalMetadata | undefined> {
  const row = await prisma.proposal.findUnique({ where: { id } });
  if (!row) return undefined;
  return {
    id: row.id,
    projectTitle: row.projectTitle,
    clientName: row.clientName,
    clientIndustry: row.clientIndustry,
    createdAt: row.createdAt.toISOString(),
    status: row.status as 'generated' | 'draft',
    version: row.version,
    aiProvider: row.aiProvider,
    sizeBytes: row.sizeBytes,
    input: row.input as unknown as ProposalInput,
    enrichedCompanyId: row.enrichedCompanyId ?? null,
    draftStatus: row.draftStatus,
    sections: row.sections as Record<string, unknown>,
  };
}

export function getProposalPdf(id: string): Buffer | undefined {
  const p = pdfPath(id);
  if (!existsSync(p)) return undefined;
  return readFileSync(p);
}

export async function listProposals(): Promise<ProposalSummary[]> {
  const rows = await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      projectTitle: true,
      clientName: true,
      clientIndustry: true,
      createdAt: true,
      sizeBytes: true,
      status: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    projectTitle: r.projectTitle,
    clientName: r.clientName,
    clientIndustry: r.clientIndustry,
    createdAt: r.createdAt.toISOString(),
    sizeBytes: r.sizeBytes,
    status: r.status,
  }));
}

export async function deleteProposal(id: string): Promise<boolean> {
  const existed = await prisma.proposal.findUnique({ where: { id }, select: { id: true } });
  if (existed) {
    await prisma.proposal.delete({ where: { id } });
  }
  const dir = proposalDir(id);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
  return Boolean(existed);
}

export async function proposalExists(id: string): Promise<boolean> {
  const row = await prisma.proposal.findUnique({ where: { id }, select: { id: true } });
  return Boolean(row);
}

export function proposalSize(id: string): number {
  const p = pdfPath(id);
  if (!existsSync(p)) return 0;
  return statSync(p).size;
}
