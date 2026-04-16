import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function deliverablesPrompt(input: ProposalInput, phaseNames: string[]): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the DELIVERABLES & MILESTONES section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROJECT PHASES ===
${phaseNames.map((n, i) => `Phase ${i + 1}: ${n}`).join('\n')}

=== RETURN THIS JSON SHAPE ===
{
  "items": [
    { "phase": "Phase 1", "name": "Deliverable name (3-6 words)", "description": "1 sentence on what it is", "acceptance": "1 clear, testable acceptance criterion" }
    // 7-10 deliverables across phases
  ],
  "milestones": [
    { "name": "Milestone name (3-5 words)", "target": "Week X or specific date" }
    // 5-7 milestones mapping to major acceptance points
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1600,
  };
}
