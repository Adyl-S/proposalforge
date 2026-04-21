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
  "overview": "4-5 sentences describing the proposed architecture in layers or tiers. Use an analogy or concrete mental model. Reference specific data flows and boundaries.",
  "components": [
    { "name": "4-6 word component name", "description": "2-3 sentences on what it does, the core technologies inside it, and why it is included" }
    // EXACTLY 6 components — they render in a 2-column × 3-row grid
  ],
  "integrations": ["6-8 short bullets naming integration points with real-sounding system names. Format: 'System Name — capability and protocol (e.g. REST/GraphQL/SIP)'"],
  "techStack": ["10-14 specific technologies (frameworks, databases, vector stores, messaging, cloud services, observability). Match the client's preferred tech first, then add complementary picks."],
  "innovations": ["4 innovation differentiators. Each a single punchy sentence with a specific, testable claim (latency number, accuracy %, data-residency guarantee, etc.)."]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 1800,
  };
}
