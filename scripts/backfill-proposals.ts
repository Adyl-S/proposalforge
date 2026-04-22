/**
 * Tier 0 Step 4 — one-shot migrator that reads every legacy proposal on disk
 * (data/proposals/<id>/meta.json) and upserts it into the new shared Postgres
 * proposals.proposals table. Idempotent: safe to re-run.
 *
 * Usage:
 *   npm run db:backfill
 *
 * Behaviour:
 *   - Old `p-xxxxxxxx` style ids are NOT UUIDs, so we synthesise a stable
 *     UUIDv5-style deterministic id from the legacy id and record the legacy id
 *     in the row's `input` JSON for traceability. On-disk files are left under
 *     their legacy path (per doc: "Keep the old local JSON files around until
 *     you've verified migration").
 *   - Rows backfilled before Step 5 have `enriched_company_id = NULL`.
 *   - Missing `useCase` / `userOwner` default to 'small' / 'pk' (matches Step 1
 *     defaults).
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { prisma } from '../lib/db/client';
import type { ProposalMetadata } from '../lib/proposals/store';

const ROOT = join(process.cwd(), 'data', 'proposals');

/**
 * Derive a stable UUIDv5-style id from any legacy id so Postgres's UUID column
 * accepts it. This is deterministic — running backfill twice produces the same
 * new id for the same legacy id, so upserts stay idempotent.
 */
function legacyToUuid(legacyId: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(legacyId)) {
    return legacyId.toLowerCase();
  }
  const hash = createHash('sha1').update(`proposal-forge:${legacyId}`).digest('hex');
  // Format as UUID v5 (name-based, sha1).
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '5' + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

function readMeta(dir: string): ProposalMetadata | null {
  const p = join(dir, 'meta.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as ProposalMetadata;
  } catch {
    return null;
  }
}

function pdfSize(dir: string): number {
  const p = join(dir, 'proposal.pdf');
  if (!existsSync(p)) return 0;
  return statSync(p).size;
}

async function main(): Promise<void> {
  if (!existsSync(ROOT)) {
    console.log(`No legacy proposals folder at ${ROOT} — nothing to backfill.`);
    return;
  }

  const legacyIds = readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (legacyIds.length === 0) {
    console.log('No legacy proposals on disk — nothing to backfill.');
    return;
  }

  console.log(`Scanning ${legacyIds.length} legacy proposal folders…`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const legacyId of legacyIds) {
    const dir = join(ROOT, legacyId);
    const meta = readMeta(dir);
    if (!meta) {
      console.warn(`  skip: ${legacyId} (no meta.json)`);
      skipped++;
      continue;
    }

    const id = legacyToUuid(legacyId);
    // Preserve the original on-disk id inside `input` for traceability.
    const inputWithLegacy = {
      ...(meta.input ?? {}),
      __legacyId: legacyId,
      // Step 1 defaults in case these older proposals were saved before fields existed.
      useCase: meta.input?.useCase ?? 'small',
      userOwner: meta.input?.userOwner ?? 'pk',
    };

    try {
      await prisma.proposal.upsert({
        where: { id },
        create: {
          id,
          enrichedCompanyId: null,
          useCase: inputWithLegacy.useCase,
          userOwner: inputWithLegacy.userOwner,
          draftStatus: 'generated',
          sections: {},
          projectTitle: meta.projectTitle ?? '(untitled)',
          clientName: meta.clientName ?? '(unknown)',
          clientIndustry: meta.clientIndustry ?? '',
          status: meta.status ?? 'generated',
          version: meta.version ?? '1.0',
          aiProvider: meta.aiProvider ?? 'unknown',
          sizeBytes: meta.sizeBytes ?? pdfSize(dir),
          input: inputWithLegacy as unknown as object,
          createdAt: meta.createdAt ? new Date(meta.createdAt) : new Date(),
        },
        update: {
          // Idempotent: refresh mutable fields but keep the original createdAt.
          projectTitle: meta.projectTitle ?? '(untitled)',
          clientName: meta.clientName ?? '(unknown)',
          clientIndustry: meta.clientIndustry ?? '',
          status: meta.status ?? 'generated',
          version: meta.version ?? '1.0',
          aiProvider: meta.aiProvider ?? 'unknown',
          sizeBytes: meta.sizeBytes ?? pdfSize(dir),
          input: inputWithLegacy as unknown as object,
        },
      });
      migrated++;
      console.log(`  ok: ${legacyId} -> ${id}`);
    } catch (err) {
      failed++;
      console.error(`  fail: ${legacyId}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('');
  console.log(`Done. migrated=${migrated}, skipped=${skipped}, failed=${failed}`);
  console.log('Old JSON files left in place per doc instructions.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
