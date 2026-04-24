/**
 * Step 12 — Use-case template library tests.
 *
 * Verifies:
 * - Each template loads and parses without error
 * - Section lists are non-empty and contain valid SectionKey values
 * - systemOverride is present and non-empty
 * - promptGuidance keys are subsets of the declared sections
 * - linkedin/upwork templates are shorter than small/legacy
 * - legacy template declares all core enterprise sections
 */

import path from 'path';
import { loadUseCaseTemplate, clearTemplateCache } from '@/lib/ai/use-case-templates';
import type { UseCaseTemplate } from '@/lib/ai/use-case-templates';
import type { UseCase, SectionKey } from '@/lib/ai/types';

const ALL_USE_CASES: UseCase[] = ['linkedin', 'upwork', 'small', 'legacy'];

const VALID_SECTION_KEYS: SectionKey[] = [
  'cover', 'toc', 'executiveSummary', 'companyOverview', 'problemStatement',
  'proposedSolution', 'methodology', 'deliverables', 'timeline', 'team',
  'caseStudies', 'budget', 'riskMitigation', 'governance', 'whyUs', 'terms',
];

const ENTERPRISE_SECTIONS: SectionKey[] = [
  'executiveSummary', 'companyOverview', 'problemStatement', 'proposedSolution',
  'methodology', 'deliverables', 'timeline', 'team', 'caseStudies',
  'budget', 'riskMitigation', 'governance', 'whyUs', 'terms',
];

beforeEach(() => {
  clearTemplateCache();
});

// ─── all templates load ───────────────────────────────────────────────────────

describe.each(ALL_USE_CASES)('template: %s', (useCase) => {
  let tpl: UseCaseTemplate;

  beforeEach(() => {
    tpl = loadUseCaseTemplate(useCase);
  });

  it('loads without throwing', () => {
    expect(tpl).toBeDefined();
    expect(tpl.useCase).toBe(useCase);
  });

  it('sections list is non-empty', () => {
    expect(tpl.sections.length).toBeGreaterThan(0);
  });

  it('all section keys are valid SectionKeys', () => {
    for (const key of tpl.sections) {
      expect(VALID_SECTION_KEYS).toContain(key);
    }
  });

  it('systemOverride is a non-empty string', () => {
    expect(typeof tpl.systemOverride).toBe('string');
    expect(tpl.systemOverride.length).toBeGreaterThan(20);
  });

  it('promptGuidance keys are valid SectionKeys', () => {
    for (const key of Object.keys(tpl.promptGuidance)) {
      expect(VALID_SECTION_KEYS).toContain(key as SectionKey);
    }
  });

  it('promptGuidance keys are a subset of declared sections', () => {
    for (const key of Object.keys(tpl.promptGuidance)) {
      expect(tpl.sections).toContain(key as SectionKey);
    }
  });

  it('promptGuidance values are non-empty strings', () => {
    for (const [, val] of Object.entries(tpl.promptGuidance)) {
      expect(typeof val).toBe('string');
      expect((val as string).length).toBeGreaterThan(10);
    }
  });

  it('bodyMarkdown is present', () => {
    expect(typeof tpl.bodyMarkdown).toBe('string');
    expect(tpl.bodyMarkdown.length).toBeGreaterThan(0);
  });
});

// ─── template-specific section counts ────────────────────────────────────────

it('linkedin has 4 sections (short cold DM)', () => {
  const tpl = loadUseCaseTemplate('linkedin');
  expect(tpl.sections).toHaveLength(4);
  expect(tpl.sections).toContain('executiveSummary');
  expect(tpl.sections).toContain('proposedSolution');
  expect(tpl.sections).toContain('whyUs');
});

it('upwork has 5 sections (cover letter)', () => {
  const tpl = loadUseCaseTemplate('upwork');
  expect(tpl.sections).toHaveLength(5);
  expect(tpl.sections).toContain('budget');
  expect(tpl.sections).not.toContain('governance');
  expect(tpl.sections).not.toContain('riskMitigation');
});

it('small has 7 sections and excludes enterprise-only sections', () => {
  const tpl = loadUseCaseTemplate('small');
  expect(tpl.sections).toHaveLength(7);
  expect(tpl.sections).not.toContain('governance');
  expect(tpl.sections).not.toContain('riskMitigation');
  expect(tpl.sections).not.toContain('companyOverview');
  expect(tpl.sections).not.toContain('team');
  expect(tpl.sections).not.toContain('caseStudies');
});

it('legacy includes all 14 core enterprise sections', () => {
  const tpl = loadUseCaseTemplate('legacy');
  for (const key of ENTERPRISE_SECTIONS) {
    expect(tpl.sections).toContain(key);
  }
});

it('linkedin has fewer sections than small', () => {
  const li = loadUseCaseTemplate('linkedin');
  const sm = loadUseCaseTemplate('small');
  expect(li.sections.length).toBeLessThan(sm.sections.length);
});

it('small has fewer sections than legacy', () => {
  const sm = loadUseCaseTemplate('small');
  const lg = loadUseCaseTemplate('legacy');
  expect(sm.sections.length).toBeLessThan(lg.sections.length);
});

// ─── caching ─────────────────────────────────────────────────────────────────

it('returns the same object on second call (cache hit)', () => {
  const a = loadUseCaseTemplate('small');
  const b = loadUseCaseTemplate('small');
  expect(a).toBe(b);
});

it('clearTemplateCache forces re-read on next call', () => {
  const a = loadUseCaseTemplate('small');
  clearTemplateCache();
  const b = loadUseCaseTemplate('small');
  expect(a).not.toBe(b);
  expect(a.sections).toEqual(b.sections);
});

// ─── promptGuidance covers declared AI-relevant sections ─────────────────────

it('legacy promptGuidance covers all 14 AI-driven sections', () => {
  const tpl = loadUseCaseTemplate('legacy');
  for (const key of ENTERPRISE_SECTIONS) {
    expect(tpl.promptGuidance).toHaveProperty(key);
  }
});

it('linkedin systemOverride mentions word count constraint', () => {
  const tpl = loadUseCaseTemplate('linkedin');
  // The override must convey a length constraint (mentions "words" or "characters" or a number)
  expect(tpl.systemOverride).toMatch(/\d+\s*(words?|characters?|chars?)/i);
});

it('upwork systemOverride mentions character limit', () => {
  const tpl = loadUseCaseTemplate('upwork');
  expect(tpl.systemOverride).toMatch(/\d+\s*characters?/i);
});
