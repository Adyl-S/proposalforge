import { BASE_SYSTEM, formatRequirements, formatCompany } from './shared';
import type { ProposalInput } from '../types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function whyUsPrompt(
  input: ProposalInput,
  company: KBCompanyProfile,
): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the WHY CHOOSE US section. Ground every differentiator in the company's actual capabilities — do not invent certifications or industries.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROPOSING COMPANY ===
${formatCompany(company)}

=== RETURN THIS JSON SHAPE ===
{
  "differentiators": [
    { "icon": "◆", "headline": "4-6 word headline", "description": "1-2 sentences with a specific capability or proof point — name real systems, regulators, or methodologies where possible" }
    // EXACTLY 6 differentiators (render in 2-column × 3-row grid)
  ],
  "stats": [
    { "value": "Number or metric (e.g. '50+', '99.95%')", "label": "2-3 word label (uppercase-friendly)" }
    // EXACTLY 4 stats — use real company data when available
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1100,
  };
}
