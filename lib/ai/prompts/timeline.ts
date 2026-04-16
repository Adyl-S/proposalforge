import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function timelinePrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Generate TIMELINE data for this project. Map realistic phase durations to the project timeline.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== RETURN THIS JSON SHAPE ===
{
  "totalWeeks": <number — total project duration in weeks>,
  "phases": [
    { "num": 1, "name": "Phase name", "focus": "short 3-6 word focus area", "startWeek": 0, "durationWeeks": 4 }
    // 4-5 phases; phases may overlap (e.g. phase 2 starts before phase 1 ends)
  ],
  "milestones": [
    { "label": "milestone (2-4 words)", "atWeek": <number> }
    // 4-6 milestones at key gate points
  ]
}

The sum-of-non-overlapping should be close to totalWeeks. Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.4,
    maxTokens: 900,
  };
}
