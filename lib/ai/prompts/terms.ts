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
    { "title": "Clause title (Title Case)", "body": "2-3 sentence clause body — clear, standard commercial language with specific numbers (notice periods, interest rates, SLA targets, warranty duration)" }
    // EXACTLY 8 clauses covering: Confidentiality & NDA, Intellectual Property, Warranty & Support, Payment Terms, Service-Level Agreement, Data Handling & Privacy, Termination, Dispute Resolution
  ],
  "validity": "Short validity statement (e.g. 'Valid for 60 days from date of issue')"
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.35,
    maxTokens: 1600,
  };
}
