/**
 * Step 12 — Use-case template library.
 *
 * Each template lives at templates/use_cases/<useCase>.md and carries a JSON
 * frontmatter block (between --- delimiters) that declares:
 *   - sections: which SectionKeys to generate for this use-case
 *   - systemOverride: appended to every section's system prompt
 *   - promptGuidance: per-section extra context appended to the user message
 */

import fs from 'fs';
import path from 'path';
import type { UseCase, SectionKey } from './types';

export interface UseCaseTemplate {
  useCase: UseCase;
  sections: SectionKey[];
  /** Appended to every section's system message when generating for this use-case. */
  systemOverride: string;
  /** Per-section extra guidance injected into the user message. */
  promptGuidance: Partial<Record<SectionKey, string>>;
  /** The markdown body (everything after the closing ---). */
  bodyMarkdown: string;
}

// ─── frontmatter parser ──────────────────────────────────────────────────────

interface RawFrontmatter {
  sections?: unknown;
  systemOverride?: unknown;
  promptGuidance?: unknown;
}

function parseFrontmatter(raw: string): { meta: RawFrontmatter; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw };
  }
  let meta: RawFrontmatter = {};
  try {
    meta = JSON.parse(match[1]) as RawFrontmatter;
  } catch {
    // Malformed frontmatter — treat as empty
  }
  return { meta, body: match[2] ?? '' };
}

const VALID_SECTIONS: readonly SectionKey[] = [
  'cover', 'toc', 'executiveSummary', 'companyOverview', 'problemStatement',
  'proposedSolution', 'methodology', 'deliverables', 'timeline', 'team',
  'caseStudies', 'budget', 'riskMitigation', 'governance', 'whyUs', 'terms',
];

function toSectionKeys(raw: unknown): SectionKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is SectionKey =>
    typeof s === 'string' && (VALID_SECTIONS as readonly string[]).includes(s),
  );
}

function toPromptGuidance(raw: unknown): Partial<Record<SectionKey, string>> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Partial<Record<SectionKey, string>> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (
      typeof v === 'string' &&
      (VALID_SECTIONS as readonly string[]).includes(k)
    ) {
      out[k as SectionKey] = v;
    }
  }
  return out;
}

// ─── loader ──────────────────────────────────────────────────────────────────

const TEMPLATE_DIR = path.join(process.cwd(), 'templates', 'use_cases');

/** In-process cache so each template is read from disk only once. */
const _cache = new Map<UseCase, UseCaseTemplate>();

export function loadUseCaseTemplate(useCase: UseCase): UseCaseTemplate {
  const cached = _cache.get(useCase);
  if (cached) return cached;

  const filePath = path.join(TEMPLATE_DIR, `${useCase}.md`);
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    // Missing template — fall back to legacy (all sections, no guidance)
    if (useCase !== 'legacy') {
      console.warn(`[use-case-templates] template not found for "${useCase}", falling back to legacy`);
      return loadUseCaseTemplate('legacy');
    }
    throw new Error(`[use-case-templates] legacy template missing at ${filePath}`);
  }

  const { meta, body } = parseFrontmatter(raw);

  const template: UseCaseTemplate = {
    useCase,
    sections: toSectionKeys(meta.sections),
    systemOverride: typeof meta.systemOverride === 'string' ? meta.systemOverride : '',
    promptGuidance: toPromptGuidance(meta.promptGuidance),
    bodyMarkdown: body,
  };

  _cache.set(useCase, template);
  return template;
}

/** Clears the in-process cache (useful in tests). */
export function clearTemplateCache(): void {
  _cache.clear();
}
