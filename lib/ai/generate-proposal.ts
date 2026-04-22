/**
 * Proposal Orchestrator.
 * Takes user input + KB, calls every section prompt in parallel,
 * merges with KB data (team, case studies, company), produces full ProposalData,
 * and renders SVG charts. Ready to feed into the HTML template + Puppeteer.
 */

import { generate, hasAnyAiProvider } from './ai-client';
import { fetchEnrichedCompany } from '@/lib/rag/scraper-client';
import type { EnrichedCompany } from './types';
import { executiveSummaryPrompt } from './prompts/executive-summary';
import { problemStatementPrompt } from './prompts/problem-statement';
import { proposedSolutionPrompt } from './prompts/proposed-solution';
import { methodologyPrompt } from './prompts/methodology';
import { deliverablesPrompt } from './prompts/deliverables';
import { timelinePrompt } from './prompts/timeline';
import { budgetPrompt } from './prompts/budget';
import { riskMitigationPrompt } from './prompts/risk-mitigation';
import { governancePrompt } from './prompts/governance';
import { whyUsPrompt } from './prompts/why-us';
import { termsPrompt } from './prompts/terms';
import { teamSelectionPrompt } from './prompts/team-selection';
import { caseStudySelectionPrompt } from './prompts/case-study-selection';
import * as fb from './fallbacks';
import type { ProposalInput } from './types';
import type { KnowledgeBase, KBTeamMember, KBProject } from '@/lib/knowledge-base/types';
import type { ProposalData, TeamMemberRendered, CaseStudyRendered } from '@/lib/pdf/types';
import {
  renderBudgetDonut,
  renderTimelineGantt,
} from '@/lib/utils/chart-renderer';
import { formatDate, getInitials, fileToDataUri } from '@/lib/utils/helpers';
import { assetPath } from '@/lib/knowledge-base/manager';

export interface OrchestratorProgress {
  section: string;
  status: 'start' | 'done' | 'fallback';
  elapsedMs?: number;
}

export type ProgressCb = (evt: OrchestratorProgress) => void;

interface AiSection<T> {
  run: () => Promise<T>;
  fallback: () => T;
  key: string;
}

async function runSection<T>(s: AiSection<T>, onProgress?: ProgressCb): Promise<T> {
  const start = Date.now();
  onProgress?.({ section: s.key, status: 'start' });
  try {
    const out = await s.run();
    onProgress?.({ section: s.key, status: 'done', elapsedMs: Date.now() - start });
    return out;
  } catch (err) {
    console.warn(`[orchestrator] section "${s.key}" failed — using fallback:`, err);
    onProgress?.({ section: s.key, status: 'fallback', elapsedMs: Date.now() - start });
    return s.fallback();
  }
}

/**
 * Deep-merge AI output over fallback defaults so every template field has a value.
 * Missing/empty keys from the AI are filled from the fallback. Non-empty AI values
 * are preserved. Arrays are kept as-is (we assume AI returned a full list if any).
 */
function mergeWithFallback<T extends Record<string, unknown>>(ai: unknown, fallback: T): T {
  if (!ai || typeof ai !== 'object' || Array.isArray(ai)) return fallback;
  const aiObj = ai as Record<string, unknown>;
  const out: Record<string, unknown> = { ...fallback };
  for (const key of Object.keys(fallback)) {
    const aiVal = aiObj[key];
    const fbVal = (fallback as Record<string, unknown>)[key];
    if (aiVal === undefined || aiVal === null) continue;
    if (typeof aiVal === 'string' && aiVal.trim() === '') continue;
    if (Array.isArray(aiVal)) {
      out[key] = aiVal.length > 0 ? aiVal : fbVal;
    } else if (typeof aiVal === 'object' && typeof fbVal === 'object' && fbVal !== null && !Array.isArray(fbVal)) {
      out[key] = mergeWithFallback(aiVal, fbVal as Record<string, unknown>);
    } else {
      out[key] = aiVal;
    }
  }
  // Keep any extra AI keys the fallback doesn't know about
  for (const key of Object.keys(aiObj)) {
    if (!(key in out)) out[key] = aiObj[key];
  }
  return out as T;
}

const PROB_CLASS = (s: string): 'high' | 'med' | 'low' => {
  const v = s.toLowerCase();
  if (v.startsWith('h')) return 'high';
  if (v.startsWith('l')) return 'low';
  return 'med';
};

function formatAmount(amt: number, currency: string): string {
  if (currency === 'INR') {
    // Indian grouping
    return `₹${amt.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amt);
}

function selectTeamMembers(
  members: KBTeamMember[],
  aiSelections: { id: string; roleOnProject: string; relevance: string }[] | undefined,
  explicitIds?: string[],
): Array<{ member: KBTeamMember; roleOnProject: string; relevance: string }> {
  if (explicitIds?.length) {
    return explicitIds
      .map((id) => members.find((m) => m.id === id))
      .filter((m): m is KBTeamMember => !!m)
      .map((m) => ({
        member: m,
        roleOnProject: `${m.title} on the engagement.`,
        relevance: m.bio,
      }));
  }
  if (aiSelections?.length) {
    const out: Array<{ member: KBTeamMember; roleOnProject: string; relevance: string }> = [];
    for (const sel of aiSelections) {
      const m = members.find((x) => x.id === sel.id);
      if (m) out.push({ member: m, roleOnProject: sel.roleOnProject, relevance: sel.relevance });
    }
    if (out.length > 0) return out;
  }
  // Fallback — first 4 members (keeps team page compact)
  return members.slice(0, 4).map((m) => ({
    member: m,
    roleOnProject: `${m.title} on the engagement.`,
    relevance: m.bio,
  }));
}

function selectCaseStudies(
  projects: KBProject[],
  aiSelections: { id: string; reason: string }[] | undefined,
  explicitIds?: string[],
): KBProject[] {
  // Cap to 2 case studies — the third tends to push the PDF over 25 pages.
  const CAP = 2;
  if (explicitIds?.length) {
    return explicitIds.map((id) => projects.find((p) => p.id === id)).filter((p): p is KBProject => !!p).slice(0, CAP);
  }
  if (aiSelections?.length) {
    const out: KBProject[] = [];
    for (const sel of aiSelections) {
      const p = projects.find((x) => x.id === sel.id);
      if (p) out.push(p);
      if (out.length >= CAP) break;
    }
    if (out.length > 0) return out;
  }
  return projects.slice(0, CAP);
}

// ────────────────────────────────────────────────────────────
// Step 5 — EnrichedCompany -> single structured projectPrompt
// ────────────────────────────────────────────────────────────

/**
 * Tier 0 projection: roll the EnrichedCompany into one detailed brief string that
 * the existing 13 section prompts can consume unchanged. Tier 1 Step 11 will
 * split this into per-section prompts; until then the single-string path keeps
 * the blast radius small.
 */
export function synthesizeProjectPromptFromEnriched(ec: EnrichedCompany): string {
  const co = ec.company;
  const lines: string[] = [];

  const header = `Prepare an enterprise AI transformation proposal for ${co.name ?? 'the target company'}`;
  const ctx = [
    co.industry && `in the ${co.industry} sector`,
    co.sub_industry && `(${co.sub_industry})`,
    co.size.employees_band && `~${co.size.employees_band} employees`,
    co.size.revenue_band && `revenue band ${co.size.revenue_band}`,
    co.hq_country && `headquartered in ${co.hq_country}`,
  ]
    .filter(Boolean)
    .join(', ');
  lines.push(`${header}${ctx ? ', ' + ctx : ''}.`);

  if (co.archetype) lines.push(`Ownership archetype: ${co.archetype.replace(/_/g, ' ')}.`);
  if (co.founded_year) lines.push(`Founded ${co.founded_year}.`);

  if (co.recent_events.length) {
    lines.push('', 'Recent events:');
    for (const ev of co.recent_events) {
      lines.push(`- ${ev.date ? `[${ev.date}] ` : ''}${ev.type}: ${ev.description}`);
    }
  }

  const sig = ec.signals;
  lines.push('', 'Observed signals:');
  if (sig.tech_stack.length) lines.push(`- Tech stack: ${sig.tech_stack.join(', ')}`);
  if (sig.hiring_roles.length) lines.push(`- Hiring: ${sig.hiring_roles.join(', ')}`);
  if (sig.pain_indicators.length) lines.push(`- Pain indicators: ${sig.pain_indicators.join(', ')}`);
  if (sig.compliance_footprint.length) {
    lines.push(`- Compliance footprint: ${sig.compliance_footprint.join(', ')}`);
  }
  lines.push(`- Digital maturity score: ${sig.digital_maturity_score.toFixed(2)} (0-1)`);

  if (ec.opportunities.length) {
    lines.push('', 'Automation opportunities surfaced by scraper analysis:');
    for (const op of ec.opportunities) {
      lines.push(
        `- ${op.title} — effort ${op.effort}, priority ${op.priority_score.toFixed(2)}`,
      );
      lines.push(`  Current: ${op.current_state}`);
      lines.push(`  Proposed: ${op.proposed_state}`);
      lines.push(`  Impact: ${op.impact.metric} ≈ ${op.impact.estimated_value}`);
    }
  }

  const { primary, secondary, tertiary } = ec.people;
  if (primary || secondary || tertiary) {
    lines.push('', 'Key decision makers:');
    for (const [label, c] of [
      ['Primary', primary],
      ['Secondary', secondary],
      ['Tertiary', tertiary],
    ] as const) {
      if (!c) continue;
      lines.push(
        `- ${label}: ${c.name}, ${c.role} (${c.seniority})${c.rationale ? ' — ' + c.rationale : ''}`,
      );
    }
  }

  lines.push(
    '',
    `Confidence: overall ${ec.confidence.overall.toFixed(2)}. Use this data to ground every claim — cite the actual industry, size, and signals; avoid generic framing.`,
  );

  return lines.join('\n');
}

async function hydrateFromEnriched(
  input: ProposalInput,
): Promise<ProposalInput> {
  if (!input.enrichedCompanyId) return input;

  const ec = await fetchEnrichedCompany(input.enrichedCompanyId);

  if (ec.status !== 'approved') {
    throw new Error(
      `Analysis pending review — approve in scraper UI first. (current status: ${ec.status})`,
    );
  }

  return {
    ...input,
    projectPrompt: synthesizeProjectPromptFromEnriched(ec),
    // Auto-fill client metadata from the scraper only when the caller left it blank.
    clientName: input.clientName || ec.company.name || input.clientName,
    clientIndustry: input.clientIndustry || ec.company.industry || input.clientIndustry,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────
export async function generateProposalData(
  input: ProposalInput,
  kb: KnowledgeBase,
  onProgress?: ProgressCb,
): Promise<ProposalData> {
  // eslint-disable-next-line no-param-reassign
  input = await hydrateFromEnriched(input);
  const useAi = hasAnyAiProvider();
  const currency = input.currency ?? 'USD';

  // Kick off all parallelizable AI calls
  const companySnapshot = kb.company;
  const phaseNamesDefault = ['Discovery & Design', 'Foundation Build', 'Core Implementation', 'Integration & QA', 'UAT & Rollout'];

  const [execRaw, problemRaw, solutionRaw, methRaw, deliverablesRaw, timelineRaw, budgetRaw, riskRaw, govRaw, whyRaw, termsRaw, teamRaw, casesRaw] =
    await Promise.all([
      runSection(
        {
          key: 'executiveSummary',
          run: async () => {
            const fallback = fb.fallbackExecutiveSummary(input, companySnapshot);
            if (!useAi) return fallback;
            const r = await generate(executiveSummaryPrompt(input, companySnapshot));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackExecutiveSummary(input, companySnapshot),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'problemStatement',
          run: async () => {
            const fallback = fb.fallbackProblemStatement(input);
            if (!useAi) return fallback;
            const r = await generate(problemStatementPrompt(input));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackProblemStatement(input),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'proposedSolution',
          run: async () => {
            const fallback = fb.fallbackProposedSolution(input);
            if (!useAi) return fallback;
            const r = await generate(proposedSolutionPrompt(input, companySnapshot));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackProposedSolution(input),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'methodology',
          run: async () => {
            const fallback = fb.fallbackMethodology(input);
            if (!useAi) return fallback;
            const r = await generate(methodologyPrompt(input));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackMethodology(input),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'deliverables',
          run: async () => {
            const fallback = fb.fallbackDeliverables(phaseNamesDefault);
            if (!useAi) return fallback;
            const r = await generate(deliverablesPrompt(input, phaseNamesDefault));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackDeliverables(phaseNamesDefault),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'timeline',
          run: async () => {
            const fallback = fb.fallbackTimeline(input);
            if (!useAi) return fallback;
            const r = await generate(timelinePrompt(input));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackTimeline(input),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'budget',
          run: async () => {
            const fallback = fb.fallbackBudget(input, phaseNamesDefault);
            if (!useAi) return fallback;
            const r = await generate(budgetPrompt(input, phaseNamesDefault));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackBudget(input, phaseNamesDefault),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'riskMitigation',
          run: async () => {
            const fallback = fb.fallbackRiskMitigation();
            if (!useAi) return fallback;
            const r = await generate(riskMitigationPrompt(input));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackRiskMitigation(),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'governance',
          run: async () => {
            const fallback = fb.fallbackGovernance(companySnapshot);
            if (!useAi) return fallback;
            const r = await generate(governancePrompt(input, companySnapshot));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackGovernance(companySnapshot),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'whyUs',
          run: async () => {
            const fallback = fb.fallbackWhyUs(companySnapshot);
            if (!useAi) return fallback;
            const r = await generate(whyUsPrompt(input, companySnapshot));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackWhyUs(companySnapshot),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'terms',
          run: async () => {
            const fallback = fb.fallbackTerms();
            if (!useAi) return fallback;
            const r = await generate(termsPrompt(input));
            return mergeWithFallback(r.parsed, fallback);
          },
          fallback: () => fb.fallbackTerms(),
        },
        onProgress,
      ),
      runSection(
        {
          key: 'teamSelection',
          run: async () => {
            if (!useAi || kb.team.length === 0) return undefined;
            const r = await generate(teamSelectionPrompt(input, kb.team));
            return (r.parsed as any)?.selections as { id: string; roleOnProject: string; relevance: string }[] | undefined;
          },
          fallback: () => undefined,
        },
        onProgress,
      ),
      runSection(
        {
          key: 'caseStudySelection',
          run: async () => {
            if (!useAi || kb.projects.length === 0) return undefined;
            const r = await generate(caseStudySelectionPrompt(input, kb.projects));
            return (r.parsed as any)?.selections as { id: string; reason: string }[] | undefined;
          },
          fallback: () => undefined,
        },
        onProgress,
      ),
    ]);

  // ────── Build derived objects ──────

  // Timeline chart
  const timelineChart = renderTimelineGantt(
    (timelineRaw.phases ?? []).map((p: any) => ({
      name: p.name,
      startWeek: p.startWeek ?? 0,
      durationWeeks: p.durationWeeks ?? 4,
    })),
    timelineRaw.totalWeeks ?? input.timelineWeeks ?? 24,
    (timelineRaw.milestones ?? []).map((m: any) => ({ label: m.label, atWeek: m.atWeek })),
  );

  // Budget chart
  const budgetChart = renderBudgetDonut(
    (budgetRaw.phases ?? []).map((p: any) => ({ label: p.name, value: p.amount ?? p.cost ?? 0 })),
  );

  // Team (merge KB + AI selection)
  const teamIncluded = input.includeTeamBios !== false && kb.team.length > 0;
  const teamSelected = teamIncluded
    ? selectTeamMembers(kb.team, teamRaw as any, input.teamMemberIds)
    : [];

  const teamMembers: TeamMemberRendered[] = teamSelected.map(({ member, roleOnProject, relevance }) => {
    const photoUri = member.photoPath ? fileToDataUri(assetPath(member.photoPath)) : undefined;
    return {
      name: member.name,
      title: member.title,
      initials: getInitials(member.name),
      photoDataUri: photoUri,
      yearsExperience: member.yearsExperience,
      expertiseSummary: member.expertise.slice(0, 3).join(', '),
      relevance,
      roleOnProject,
    };
  });

  // Case studies
  const csIncluded = input.includeCaseStudies !== false && kb.projects.length > 0;
  const csSelected = csIncluded
    ? selectCaseStudies(kb.projects, casesRaw as any, input.caseStudyIds)
    : [];

  const caseStudies: CaseStudyRendered[] = csSelected.map((p) => ({
    title: p.title,
    clientIndustry: `${p.clientIndustry} · ${p.client}`,
    year: p.year,
    duration: p.duration,
    challenge: p.challenge,
    solution: p.solution,
    outcome: p.results.slice(0, 2).join(' '),
    metrics: p.metrics ?? p.results.slice(0, 3).map((r, i) => ({ value: `#${i + 1}`, label: r })),
    technologies: p.technologies,
    testimonial: p.testimonial
      ? { quote: p.testimonial.quote, author: p.testimonial.author, authorTitle: p.testimonial.title }
      : undefined,
  }));

  // Build canonical ProposalData
  const companyLogoUri = companySnapshot.logoPath
    ? fileToDataUri(assetPath(companySnapshot.logoPath))
    : undefined;
  const yearsInBusiness = new Date().getFullYear() - companySnapshot.founded;

  const version = input.proposalVersion ?? '1.0';
  const data: ProposalData = {
    proposal: {
      projectTitle: input.projectTitle,
      projectSubtitle: input.projectPrompt.slice(0, 260),
      clientName: input.clientName,
      clientIndustry: input.clientIndustry,
      version,
      date: formatDate(new Date(), 'long'),
      validThrough: formatDate(new Date(Date.now() + 60 * 24 * 3600 * 1000), 'long'),
    },
    company: {
      ...companySnapshot,
      logoDataUri: companyLogoUri,
      yearsInBusiness,
      industriesCount: companySnapshot.industriesServed.length,
    },
    toc: buildToc(),
    executiveSummary: execRaw,
    problemStatement: problemRaw,
    proposedSolution: solutionRaw,
    methodology: methRaw,
    deliverables: deliverablesRaw,
    timeline: {
      totalDuration: `${timelineRaw.totalWeeks ?? input.timelineWeeks ?? 24} weeks`,
      chartImage: timelineChart,
      phases: (timelineRaw.phases ?? []).map((p: any) => ({
        num: p.num,
        name: p.name,
        focus: p.focus,
        duration: `${p.durationWeeks} weeks`,
        start: `Week ${p.startWeek + 1}`,
      })),
    },
    team: {
      size: teamMembers.length,
      introduction: teamMembers.length
        ? `A dedicated ${teamMembers.length}-person squad, ring-fenced for this engagement end-to-end.`
        : 'Team details provided separately.',
      members: teamMembers,
    },
    caseStudies: { items: caseStudies },
    budget: {
      pricingModel: budgetRaw.pricingModelLabel ?? 'Fixed Price',
      phases: (budgetRaw.phases ?? []).map((p: any) => ({
        name: p.name,
        focus: p.focus,
        effort: `${p.effortPD} PD`,
        cost: formatAmount(p.amount ?? 0, currency),
      })),
      totalEffort: `${(budgetRaw.phases ?? []).reduce((s: number, p: any) => s + (p.effortPD ?? 0), 0)} PD`,
      totalCost: formatAmount(budgetRaw.totalAmount ?? 0, currency),
      chartImage: budgetChart,
      paymentMilestones: (budgetRaw.paymentMilestones ?? []).map((m: any) => ({
        num: m.num,
        name: m.name,
        trigger: m.trigger,
        amount: formatAmount(m.amount ?? 0, currency),
      })),
      notes: budgetRaw.notes ?? '',
    },
    riskMitigation: {
      introduction: riskRaw.introduction,
      risks: (riskRaw.risks ?? []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        probability: r.probability,
        probabilityClass: PROB_CLASS(r.probability ?? 'Medium'),
        impact: r.impact,
        impactClass: PROB_CLASS(r.impact ?? 'Medium'),
        mitigation: r.mitigation,
      })),
    },
    governance: govRaw,
    whyUs: {
      differentiators: whyRaw.differentiators ?? [],
      stats: whyRaw.stats ?? [],
      featuredTestimonial: pickFeaturedTestimonial(kb.projects),
    },
    terms: termsRaw,
  };

  return data;
}

function buildToc(): ProposalData['toc'] {
  return [
    { number: '01', title: 'Executive Summary', page: 3, major: true },
    { number: '02', title: 'About Us', page: 5, major: true },
    { number: '03', title: 'Understanding the Challenge', page: 6, major: true },
    { number: '04', title: 'Proposed Solution', page: 8, major: true },
    { number: '05', title: 'Methodology & Approach', page: 10, major: true },
    { number: '06', title: 'Deliverables & Milestones', page: 11, major: true },
    { number: '07', title: 'Project Timeline', page: 12, major: true },
    { number: '08', title: 'Proposed Team', page: 13, major: true },
    { number: '09', title: 'Relevant Case Studies', page: 14, major: true },
    { number: '10', title: 'Investment & Pricing', page: 17, major: true },
    { number: '11', title: 'Risk Mitigation', page: 19, major: true },
    { number: '12', title: 'Governance & PMO', page: 20, major: true },
    { number: '13', title: 'Why Choose Us', page: 21, major: true },
    { number: '14', title: 'Terms & Conditions', page: 22, major: true },
  ];
}

function pickFeaturedTestimonial(projects: KBProject[]): { quote: string; author: string; authorTitle: string } | undefined {
  const withQuote = projects.find((p) => p.testimonial);
  if (!withQuote?.testimonial) return undefined;
  return {
    quote: withQuote.testimonial.quote,
    author: withQuote.testimonial.author,
    authorTitle: withQuote.testimonial.title,
  };
}
