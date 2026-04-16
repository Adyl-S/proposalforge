import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { KBTeamMember } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function teamSelectionPrompt(
  input: ProposalInput,
  team: KBTeamMember[],
): GenerateOptions {
  const memberList = team
    .map(
      (m) =>
        `- ${m.id} · ${m.name} · ${m.title} · ${m.yearsExperience}y · Expertise: ${m.expertise.join(', ')}`,
    )
    .join('\n');

  return {
    system: BASE_SYSTEM,
    user: `Select and describe the ideal team for this engagement. Choose from the available roster and write relevance + role-on-project for each.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== AVAILABLE ROSTER ===
${memberList}

=== RETURN THIS JSON SHAPE ===
{
  "introduction": "2 sentences introducing the selected team.",
  "selections": [
    {
      "id": "exact member id from roster",
      "roleOnProject": "1 sentence: specific responsibility on this engagement",
      "relevance": "1-2 sentences: why this person's experience matches this specific project"
    }
    // Select 5-7 members based on the project's needs. Prefer diversity of skills (lead, backend, ML, design, security/compliance, delivery).
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.45,
    maxTokens: 1400,
  };
}
