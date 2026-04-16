import { BASE_SYSTEM, formatRequirements, formatCompany } from './shared';
import type { ProposalInput } from '../types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';
import type { GenerateOptions } from '../ai-client';

export function governancePrompt(
  input: ProposalInput,
  company: KBCompanyProfile,
): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the GOVERNANCE & PROJECT MANAGEMENT section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROPOSING COMPANY ===
${formatCompany(company)}

=== RETURN THIS JSON SHAPE ===
{
  "introduction": "2 sentences on governance posture for this engagement.",
  "steeringCommittee": ["4-5 entries, each naming a role (client-side and vendor-side roles)"],
  "workingGroup": ["4-5 entries, each naming an operational role"],
  "reportingCadence": [
    { "frequency": "Daily", "what": "what's reported and how" },
    { "frequency": "Weekly", "what": "..." },
    { "frequency": "Bi-Weekly", "what": "..." },
    { "frequency": "Monthly", "what": "..." }
  ],
  "escalationPath": ["3-4 escalation levels, each as a short role title"],
  "tools": ["5-7 specific tools with purpose in parens (e.g. 'Jira (tracking)')"],
  "changeManagement": "2 sentences on how change requests are processed."
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1300,
  };
}
