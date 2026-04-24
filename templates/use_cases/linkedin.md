---
{
  "sections": ["executiveSummary", "problemStatement", "proposedSolution", "whyUs"],
  "systemOverride": "This is a LinkedIn cold outreach DM, not a formal proposal. Keep the total word count under 700 words. No section headers. Write in first-person, conversational but professional tone. Lead with a signal-specific hook that proves you did your research on {{company.name}}.",
  "promptGuidance": {
    "executiveSummary": "Opening hook only — 2-3 sentences. Must name a specific signal observed (tech stack, hiring role, or recent event). End with a direct question or soft CTA. No metrics or financials here.",
    "problemStatement": "2-3 sentences naming the specific pain. Reference the signals from their public presence. Make the decision-maker feel seen, not lectured.",
    "proposedSolution": "3 bullet points maximum. Each must name a specific technique or tool. No vague 'AI can help' statements. End with an outcome metric estimate.",
    "whyUs": "One concrete proof point (a past result with a number) + one sentence on why we specifically are the right fit for {{company.name}}'s situation. Keep it to 2-3 sentences total."
  }
}
---
# LinkedIn Outreach DM — {{company.name}}

**Use-case context**: Cold LinkedIn DM to a decision-maker at {{company.name}} ({{company.industry}}).
Target: {{people.primary.name}}, {{people.primary.role}}.

Observed signals driving this outreach:
- Tech stack: {{signals.tech_stack}}
- Open roles: {{signals.hiring_roles}}
- Pain indicators: {{signals.pain_indicators}}
- Top opportunity: {{opportunities.0.title}} (priority {{opportunities.0.priority_score}})

**Format**: 3-4 short paragraphs. No bullet lists. No headers. Under 700 words.
Must feel like a human wrote it after genuinely researching the company.
