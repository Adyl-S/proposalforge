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
  "openingHook": "2-3 punchy sentences. Open by addressing the client's strategic inflection point — NOT the project itself. Use a contrast (e.g., 'the firms that win the next decade will not be X, they will be Y'). Add one concrete data point about the industry moment.",
  "understanding": "3-4 sentences demonstrating deep understanding of the client's situation. Include at least two specific operational metrics or patterns. Reference the client's scale (customers, volumes, channels) and the compounding frictions they face.",
  "solutionBullets": ["Three bullet points, each 2 sentences long. Each bullet describes one pillar of the proposed solution AND includes a concrete capability plus quantified outcome."],
  "expectedOutcomes": [
    { "metric": "Short label (2-3 words, Title Case)", "value": "Hero number (e.g. '45%' or '4.2x' or '$2M')", "description": "short phrase completing the value context" },
    { "metric": "...", "value": "...", "description": "..." },
    { "metric": "...", "value": "...", "description": "..." }
  ],
  "investmentRange": "Range in the client's currency with tasteful formatting (e.g. 'USD 180,000 — 240,000' or '₹2.4 Cr — ₹3.1 Cr')",
  "pricingModel": "One short label matching the client's pricing preference (e.g. 'Fixed Price · Milestone-Linked')",
  "closingStatement": "2-3 sentences on why THIS specific company is the right partner, grounded in their actual certifications/industries served. Name specific capabilities that map to this engagement. Avoid generic claims."
}

Return ONLY the JSON object.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1200,
  };
}
