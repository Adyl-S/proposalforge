import { BASE_SYSTEM, formatRequirements, formatCompany } from './shared';
import type { ProposalInput } from '../types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function executiveSummaryPrompt(
  input: ProposalInput,
  company: KBCompanyProfile,
): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the EXECUTIVE SUMMARY for this proposal.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROPOSING COMPANY ===
${formatCompany(company)}

=== RETURN THIS JSON SHAPE ===
{
  "openingHook": "1-2 punchy sentences. Open by addressing the client's strategic inflection point — NOT the project itself. Use a contrast (e.g., 'the firms that win the next decade will not be X, they will be Y').",
  "understanding": "2-3 sentences demonstrating deep understanding of the client's situation. Include at least one specific operational metric or pattern.",
  "solutionBullets": ["Three bullet points, each describing one pillar of the proposed solution. Each bullet must include a concrete capability or quantified outcome."],
  "expectedOutcomes": [
    { "metric": "Short label (2-3 words, Title Case)", "value": "Hero number (e.g. '45%' or '4.2x' or '$2M')", "description": "short phrase completing the value context" },
    { "metric": "...", "value": "...", "description": "..." },
    { "metric": "...", "value": "...", "description": "..." }
  ],
  "investmentRange": "Range in the client's currency with tasteful formatting (e.g. 'USD 180,000 — 240,000' or '₹2.4 Cr — ₹3.1 Cr')",
  "pricingModel": "One short label matching the client's pricing preference (e.g. 'Fixed Price · Milestone-Linked')",
  "closingStatement": "1-2 sentences on why THIS specific company is the right partner, grounded in their actual certifications/industries served. Avoid generic claims."
}

Return ONLY the JSON object.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1200,
  };
}
