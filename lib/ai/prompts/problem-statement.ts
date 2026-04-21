import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function problemStatementPrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the UNDERSTANDING THE CHALLENGE section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

Deeply analyze what's driving this project. Identify 4 specific pain points with real-world framing (not generic "lack of efficiency" filler). Think like a consultant who has interviewed the client's ops and finance teams.

=== RETURN THIS JSON SHAPE ===
{
  "currentState": "4-5 sentences describing the client's current operating state, grounded in realistic metrics (e.g., volumes, handle times, error rates, revenue at risk). Invent plausible numbers if the project requires it — the client will adjust. Reference specific channels, systems, and team structures.",
  "painPoints": [
    { "num": "01", "title": "Short title (4-6 words)", "description": "3-4 sentences. Lead with the symptom, connect to the business impact with a number, explain the root cause, and end with the downstream consequence." },
    { "num": "02", "title": "...", "description": "..." },
    { "num": "03", "title": "...", "description": "..." },
    { "num": "04", "title": "...", "description": "..." }
  ],
  "businessImpact": "3-4 sentences quantifying the total cost of inaction (direct cost, opportunity cost, risk cost). Include a peer-group benchmark comparison.",
  "industryContext": "3-4 sentences framing this as an industry-wide inflection (what peers are doing, what the competitive window looks like, what regulators are signaling)."
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.55,
    maxTokens: 1400,
  };
}
