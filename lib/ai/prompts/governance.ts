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
  "introduction": "3-4 sentences on governance posture for this engagement — why strong governance matters at this scale, the two-tier model, and how it integrates with the client's existing enterprise governance.",
  "steeringCommittee": ["5 entries, each naming a role (client-side and vendor-side roles)"],
  "workingGroup": ["5 entries, each naming an operational role"],
  "reportingCadence": [
    { "frequency": "Daily", "what": "what's reported and how" },
    { "frequency": "Weekly", "what": "..." },
    { "frequency": "Bi-Weekly", "what": "..." },
    { "frequency": "Monthly", "what": "..." }
  ],
  "escalationPath": ["4 escalation levels, each as a short role title (Team Lead → Delivery Manager → Engagement Lead → Steering Committee)"],
  "tools": ["6-8 specific tools with purpose in parens (e.g. 'Jira (tracking)', 'Confluence (docs)', 'Slack (daily)', 'Loom (demos)', 'Datadog (ops)', 'PagerDuty (on-call)')"],
  "changeManagement": "3-4 sentences on how change requests are processed — the CR workflow, impact assessment template, approval authority, and how approved changes flow into the SOW addendum."
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.5,
    maxTokens: 1300,
  };
}
