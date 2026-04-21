import type { ProposalInput } from '../types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';

export const BASE_SYSTEM = `You are a Senior Partner at a top-tier global consulting firm (think McKinsey + Accenture's consulting practice).
You write enterprise proposals for Fortune 500 and major public-sector clients.
Every paragraph must answer "so what?" for a CXO reader.
TONE: Confident, data-driven, specific, outcome-oriented. No buzzword salad, no vague promises.
FORMAT: Return ONLY a JSON object matching the requested schema. No prose outside JSON, no markdown fences, no preamble.
STYLE: Prefer concrete numbers and named artifacts over abstract claims. Use en-dashes (—) not hyphens for parenthetical asides.
LENGTH: Generate rich, substantive content that fills a full A4 page per section. The target PDF is 16–22 pages. Each section must be dense with specifics — real metrics, real system names, real methodologies. Hit the upper bound of the requested item counts, write the maximum sentence count for each field, and err on the side of MORE detail. Never return placeholder or truncated content. Thin output is a failure.`;

export function formatRequirements(input: ProposalInput): string {
  const parts: string[] = [];
  parts.push(`Project: ${input.projectPrompt}`);
  parts.push(`Client: ${input.clientName} (${input.clientIndustry})`);
  if (input.budgetMin || input.budgetMax) {
    const cur = input.currency ?? 'USD';
    parts.push(
      `Budget Range: ${cur} ${(input.budgetMin ?? 0).toLocaleString()} — ${(input.budgetMax ?? 0).toLocaleString()}`,
    );
  }
  if (input.timelineWeeks) parts.push(`Timeline: ${input.timelineWeeks} weeks`);
  if (input.startDate) parts.push(`Start Date: ${input.startDate}`);
  if (input.teamSizePreference) parts.push(`Team Size Preference: ${input.teamSizePreference}`);
  if (input.preferredTechnologies?.length) parts.push(`Preferred Tech: ${input.preferredTechnologies.join(', ')}`);
  if (input.compliance?.length) parts.push(`Compliance: ${input.compliance.join(', ')}`);
  if (input.methodology) parts.push(`Methodology Preference: ${input.methodology}`);
  if (input.pricingModel) parts.push(`Pricing Model: ${input.pricingModel}`);
  return parts.join('\n');
}

export function formatCompany(company: KBCompanyProfile): string {
  return [
    `Name: ${company.name}`,
    `Tagline: ${company.tagline}`,
    `Founded: ${company.founded}  ·  HQ: ${company.headquarters}`,
    `Team Size: ${company.teamSize}  ·  Projects Delivered: ${company.projectsDelivered}`,
    `Industries: ${company.industriesServed.join(', ')}`,
    `Mission: ${company.mission}`,
    `Certifications: ${company.certifications.join(', ')}`,
    `Core Competencies: ${company.coreCompetencies.map((c) => c.name).join(', ')}`,
  ].join('\n');
}
