/**
 * Proposal storage — each generated proposal is a directory under data/proposals/<id>/
 * containing proposal.pdf and meta.json.
 */

import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ProposalInput } from '@/lib/ai/types';

const ROOT = join(process.cwd(), 'data', 'proposals');

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

function ensureRoot() {
  mkdirSync(ROOT, { recursive: true });
}

export function newProposalId(): string {
  return `p-${randomUUID().slice(0, 12)}`;
}

export function proposalDir(id: string): string {
  return join(ROOT, id);
}

export function saveProposal(id: string, pdf: Buffer, meta: ProposalMetadata): void {
  ensureRoot();
  const dir = proposalDir(id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'proposal.pdf'), pdf);
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
}

export function getProposalMeta(id: string): ProposalMetadata | undefined {
  const p = join(proposalDir(id), 'meta.json');
  if (!existsSync(p)) return undefined;
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as ProposalMetadata;
  } catch {
    return undefined;
  }
}

export function getProposalPdf(id: string): Buffer | undefined {
  const p = join(proposalDir(id), 'proposal.pdf');
  if (!existsSync(p)) return undefined;
  return readFileSync(p);
}

export function listProposals(): ProposalSummary[] {
  ensureRoot();
  const ids = readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  return ids
    .map((id) => getProposalMeta(id))
    .filter((m): m is ProposalMetadata => !!m)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ id, projectTitle, clientName, clientIndustry, createdAt, sizeBytes, status }) => ({
      id,
      projectTitle,
      clientName,
      clientIndustry,
      createdAt,
      sizeBytes,
      status,
    }));
}

export function deleteProposal(id: string): boolean {
  const dir = proposalDir(id);
  if (!existsSync(dir)) return false;
  rmSync(dir, { recursive: true, force: true });
  return true;
}

export function proposalExists(id: string): boolean {
  return existsSync(join(proposalDir(id), 'proposal.pdf'));
}

export function proposalSize(id: string): number {
  const p = join(proposalDir(id), 'proposal.pdf');
  if (!existsSync(p)) return 0;
  return statSync(p).size;
}
