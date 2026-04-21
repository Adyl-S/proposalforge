import { BASE_SYSTEM, formatRequirements } from './shared';
import type { ProposalInput } from '../types';
import type { GenerateOptions } from '../ai-client';

export function budgetPrompt(input: ProposalInput, phaseNames: string[]): GenerateOptions {
  return {
    system: BASE_SYSTEM,
    user: `Create the BUDGET / INVESTMENT breakdown.

=== PROJECT BRIEF ===
${formatRequirements(input)}

=== PROJECT PHASES ===
${phaseNames.map((n, i) => `Phase ${i + 1}: ${n}`).join('\n')}

Use the budget range to calibrate. If only a max is given, use 85% of it. Person-days should reflect the team-size preference and timeline. Use the project's currency.

=== RETURN THIS JSON SHAPE ===
{
  "pricingModelLabel": "e.g. 'Fixed Price · 4 Phases'",
  "phases": [
    { "name": "Phase name (match project phases)", "focus": "3-6 word focus area", "effortPD": 68, "amount": 28000 }
    // one entry per phase (match the phase count provided above), amounts as raw numbers
  ],
  "totalAmount": <total number>,
  "paymentMilestones": [
    { "num": 1, "name": "Milestone name", "trigger": "Trigger condition", "amount": 30000 }
    // 6 milestones summing exactly to totalAmount (Mobilization, Design Sign-off, Foundation Acceptance, Alpha Delivered, Go-Live, Steady-State Sign-off)
  ],
  "notes": "2-3 sentences on what's excluded (third-party licensing, travel, pass-through costs), any TCO caveats, and a note on GST/tax treatment."
}

Return ONLY the JSON.`,
    jsonMode: true,
    temperature: 0.4,
    maxTokens: 1400,
  };
}
