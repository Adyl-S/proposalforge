import { BASE_SYSTEM, formatRequirements, formatCompany } from './shared';
import type { ProposalInput } from '../types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function proposedSolutionPrompt(
  input: ProposalInput,
  company: KBCompanyProfile,
): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the PROPOSED SOLUTION section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROPOSING COMPANY CAPABILITIES ===
${formatCompany(company)}

Design the solution architecture. Think in terms of layers/components, not features. Choose technologies that fit the client's constraints (budget, compliance, geography) and the company's stated capabilities.

=== RETURN THIS JSON SHAPE ===
{
  "overview": "3 sentences describing the proposed architecture in layers. Use a concrete mental model.",
  "components": [
    { "name": "4-6 word component name", "description": "1 sentence on what it does and why it is included" }
    // EXACTLY 6 components — they render in a 2-column × 3-row grid
  ],
  "integrations": ["EXACTLY 5 short bullets naming integration points. Format: 'System Name — capability (protocol)'"],
  "techStack": ["EXACTLY 8 specific technologies. Match the client's preferred tech first, then add complementary picks."],
  "innovations": ["EXACTLY 3 innovation differentiators. Each a single punchy sentence with a specific, testable claim."]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 1800,
  };
}
