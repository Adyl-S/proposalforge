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
  "overview": "3-4 sentences describing the proposed architecture in layers or tiers. Use an analogy or concrete mental model.",
  "components": [
    { "name": "4-6 word component name", "description": "1-2 sentences on what it does and why it's included" }
    // Include 4-6 components
  ],
  "integrations": ["5-6 short bullets naming integration points with real-sounding system names. Format: 'System Name — capability'"],
  "techStack": ["8-12 specific technologies (frameworks, databases, services, cloud). Match them to the client's preferred tech if specified."],
  "innovations": ["3-4 innovation differentiators. Each as a single punchy sentence that makes a specific claim (latency, accuracy, sovereignty, etc.)"]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 1800,
  };
}
