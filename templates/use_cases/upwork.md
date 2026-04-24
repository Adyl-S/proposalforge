---
{
  "sections": ["executiveSummary", "problemStatement", "proposedSolution", "methodology", "budget"],
  "systemOverride": "This is an Upwork proposal cover letter. Hard limit: 1800 characters total across all sections. No section headers in the final output. Write in first-person. Open by calling out the specific job requirement, then show relevant experience, then give a clear approach and rough number. End with a direct CTA.",
  "promptGuidance": {
    "executiveSummary": "Opening paragraph: 2-3 sentences. Mirror the job posting language back. Show you read the brief. Reference one specific technical requirement or challenge from the post.",
    "problemStatement": "1-2 sentences. Name the core technical challenge in the client's words. Do NOT use bullet points.",
    "proposedSolution": "3-4 sentences on what you would build. Name specific technologies. Include one sentence on how long it would realistically take.",
    "methodology": "2-3 sentences on your working style: communication cadence, milestones, revision policy. Keep it practical, not jargon-heavy.",
    "budget": "One sentence with a price range and what it covers. Format: 'My fixed-price quote for [scope] is $X-$Y, covering [deliverables].' No payment schedule tables — this is a cover letter."
  }
}
---
# Upwork Cover Letter — {{company.name}}

**Use-case context**: Upwork job application for a project at {{company.name}} ({{company.industry}}).

Project context from enriched data:
- Key pain indicators: {{signals.pain_indicators}}
- Relevant tech stack signals: {{signals.tech_stack}}
- Top proposed solution: {{opportunities.0.proposed_state}}

**Format**: One continuous block of text, no headers, under 1800 characters.
Opening → relevant experience → approach → timeline → price → CTA.
