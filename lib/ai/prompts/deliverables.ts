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
    { "phase": "Phase 1", "name": "Deliverable name (3-6 words)", "description": "1-2 sentences on what it is and what it contains", "acceptance": "1 clear, testable acceptance criterion with a named artifact or metric" }
    // 9-12 deliverables spread across all phases (aim for 2 per phase)
  ],
  "milestones": [
    { "name": "Milestone name (3-5 words)", "target": "Week X or specific date" }
    // 6-8 milestones mapping to major acceptance points (design sign-off, foundation live, alpha, beta, compliance, UAT, go-live, steady-state)
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1600,
  };
}
