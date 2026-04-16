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
  "summary": "2-3 sentences describing the delivery rhythm, sprint cadence, and review gates.",
  "phases": [
    { "num": 1, "name": "Phase name", "description": "1-2 sentences of what happens in this phase and what comes out of it.", "duration": "X weeks" }
    // 4-5 phases total, durations summing close to the client's timeline
  ],
  "qa": ["3-4 specific QA practices — each a single clear sentence"],
  "communication": ["3-4 specific communication touchpoints with cadence"]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1300,
  };
}
