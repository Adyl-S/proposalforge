import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function termsPrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the TERMS & CONDITIONS for this proposal. Use standard enterprise commercial clauses, tailored to the client's geography and compliance requirements.

=== PROJECT BRIEF ===
${formatRequirements(input)}

${input.customTerms ? `=== CUSTOM TERMS REQUESTED ===\n${input.customTerms}\n` : ''}

=== RETURN THIS JSON SHAPE ===
{
  "clauses": [
    { "title": "Clause title (Title Case)", "body": "1-3 sentence clause body — clear, standard commercial language" }
    // 7-9 clauses covering: Confidentiality & NDA, IP, Warranty & Support, Payment Terms, SLA, Data Handling & Privacy, Termination, Dispute Resolution, (optional) Limitation of Liability
  ],
  "validity": "Short validity statement (e.g. 'Valid for 60 days from date of issue')"
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.35,
    maxTokens: 1600,
  };
}
