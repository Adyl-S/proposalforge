import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { KBProject } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function caseStudySelectionPrompt(
  input: ProposalInput,
  projects: KBProject[],
): GenerateOptions {
  const projectList = projects
    .map(
      (p) =>
        `- ${p.id} · ${p.title} · ${p.clientIndustry} · ${p.year} · Tech: ${p.technologies.slice(0, 5).join(', ')} · Tags: ${(p.tags ?? []).join(', ')}`,
    )
    .join('\n');

  return {
    system: BASE_SYSTEM,
    user: `Select the 2-3 most RELEVANT past projects for this proposal. Relevance means: same industry or same problem class or same tech stack.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== AVAILABLE CASE STUDIES ===
${projectList}

=== RETURN THIS JSON SHAPE ===
{
  "selections": [
    { "id": "exact id from list", "reason": "one short sentence explaining why this case study is relevant" }
    // 2-3 entries, most relevant first
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.3,
    maxTokens: 500,
  };
}
