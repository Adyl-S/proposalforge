import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function methodologyPrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the METHODOLOGY & APPROACH section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

Design the delivery approach. Tailor the phase count and durations to fit the project timeline. If compliance (SOC2, HIPAA, RBI, etc.) is required, explicitly embed regulatory gates.

=== RETURN THIS JSON SHAPE ===
{
  "approach": "Short label (e.g. 'Agile with Regulatory Gates', 'Waterfall-Phased', 'Hybrid with Continuous Delivery')",
  "summary": "3-4 sentences describing the delivery rhythm, sprint cadence, review gates, and how this approach de-risks the engagement for the client.",
  "phases": [
    { "num": 1, "name": "Phase name", "description": "2-3 sentences of what happens in this phase, the key artifacts produced, and the exit criteria.", "duration": "X weeks" }
    // EXACTLY 5 phases. Durations should sum close to the client's timeline. Use these canonical phase names: 1) Discovery & Design, 2) Foundation Build, 3) Core Implementation, 4) Integration & QA, 5) UAT & Rollout.
  ],
  "qa": ["4-5 specific QA practices — each a single clear sentence naming the artifact, cadence, or tool"],
  "communication": ["4-5 specific communication touchpoints with cadence and the audience"]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1300,
  };
}
