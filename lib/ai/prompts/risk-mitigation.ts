import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function riskMitigationPrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the RISK MITIGATION section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

Identify 6-7 top project risks spanning delivery, technology, regulatory, adoption, and vendor axes. Be specific — generic risks like "scope creep" are unacceptable.

=== RETURN THIS JSON SHAPE ===
{
  "introduction": "2-3 sentence intro on how you run risk management on this program.",
  "risks": [
    {
      "id": "R-01",
      "title": "Short title (4-7 words)",
      "description": "1 sentence describing the risk specifically for this project",
      "probability": "Low" | "Medium" | "High",
      "impact": "Low" | "Medium" | "High",
      "mitigation": "1-2 sentences of specific, actionable mitigation with a named owner or artifact"
    }
    // 6-7 risks, IDs R-01 through R-07 sequentially
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.55,
    maxTokens: 1600,
  };
}
