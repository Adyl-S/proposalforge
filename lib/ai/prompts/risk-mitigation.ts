import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function riskMitigationPrompt(input: ProposalInput): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Write the RISK MITIGATION section.

=== PROJECT BRIEF ===
${formatRequirements(input)}

Identify 7-8 top project risks spanning delivery, technology, regulatory, adoption, data quality, vendor, and security axes. Be specific — generic risks like "scope creep" are unacceptable.

=== RETURN THIS JSON SHAPE ===
{
  "introduction": "3-4 sentence intro on how you run risk management on this program — cadence, framework, ownership model, and how risks flow into the steering committee.",
  "risks": [
    {
      "id": "R-01",
      "title": "Short title (4-7 words)",
      "description": "1-2 sentences describing the risk specifically for THIS project — reference actual systems, teams, or regulations where relevant",
      "probability": "Low" | "Medium" | "High",
      "impact": "Low" | "Medium" | "High",
      "mitigation": "2-3 sentences of specific, actionable mitigation with a named owner, artifact, and review cadence"
    }
    // 7-8 risks, IDs R-01 through R-08 sequentially
  ]
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.55,
    maxTokens: 1600,
  };
}
