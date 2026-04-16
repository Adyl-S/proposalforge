import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Mustache from 'mustache';
import type { ProposalData } from './types';

const TEMPLATE_ROOT = join(process.cwd(), 'templates');
const SECTIONS_DIR = join(TEMPLATE_ROOT, 'sections');
const STYLES_PATH = join(TEMPLATE_ROOT, 'styles', 'proposal.css');
const MAIN_TEMPLATE_PATH = join(TEMPLATE_ROOT, 'proposal.html');

const SECTION_FILES = {
  cover: 'cover-page.html',
  toc: 'table-of-contents.html',
  executiveSummary: 'executive-summary.html',
  companyOverview: 'company-overview.html',
  problemStatement: 'problem-statement.html',
  proposedSolution: 'proposed-solution.html',
  methodology: 'methodology.html',
  deliverables: 'deliverables.html',
  timeline: 'timeline.html',
  team: 'team.html',
  caseStudies: 'case-studies.html',
  budget: 'budget.html',
  riskMitigation: 'risk-mitigation.html',
  governance: 'governance.html',
  whyUs: 'why-us.html',
  terms: 'terms.html',
} as const;

type SectionKey = keyof typeof SECTION_FILES;

Mustache.escape = (text) => String(text); // disable HTML escaping — we control input

export interface AssembleOptions {
  fontBaseUrl?: string;
}

export function assembleProposalHtml(data: ProposalData, opts: AssembleOptions = {}): string {
  const styles = loadStyles(opts.fontBaseUrl);
  const mainTpl = readFileSync(MAIN_TEMPLATE_PATH, 'utf-8');

  const renderedSections: Record<SectionKey, string> = {} as any;
  for (const [key, file] of Object.entries(SECTION_FILES)) {
    const tpl = readFileSync(join(SECTIONS_DIR, file), 'utf-8');
    renderedSections[key as SectionKey] = Mustache.render(tpl, data);
  }

  return Mustache.render(mainTpl, {
    ...data,
    inlineStyles: styles,
    sections: renderedSections,
  });
}

function loadStyles(fontBaseUrl?: string): string {
  let css = readFileSync(STYLES_PATH, 'utf-8');
  if (fontBaseUrl) {
    css = css.replace(/url\('\/fonts\//g, `url('${fontBaseUrl}/fonts/`);
  }
  return css;
}
