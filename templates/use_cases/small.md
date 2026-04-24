---
{
  "sections": ["executiveSummary", "problemStatement", "proposedSolution", "deliverables", "timeline", "budget", "terms"],
  "systemOverride": "This is a concise 3-5 page proposal for a small or startup client. Avoid enterprise jargon. Use plain language. Keep each section to half the length you would for a large enterprise. No governance, no risk matrices, no org charts. Focus on clarity and confidence.",
  "promptGuidance": {
    "executiveSummary": "2-3 short paragraphs: (1) what we understand about their challenge, (2) what we propose, (3) expected outcome with one concrete metric. No more than 200 words.",
    "problemStatement": "3-5 bullet points naming the specific pain points observed. Each bullet = one pain, one impact sentence. Reference the signals (tech stack, hiring, events) from the enriched data.",
    "proposedSolution": "Name the solution, list its 3-4 main components, explain why this approach fits their size and situation. Include a brief 'what you get' summary. Keep under 300 words.",
    "deliverables": "Table or list of 5-8 concrete deliverables with brief descriptions. No vague 'Phase N deliverable' placeholders — name the actual artefact.",
    "timeline": "Simple 3-4 phase plan. Each phase: name, duration, key milestone. No complex Gantt details — a paragraph per phase is fine.",
    "budget": "Total investment figure with a simple phase breakdown. Include one clear sentence on the pricing model (fixed/T&M) and payment schedule (2-3 milestones max).",
    "terms": "Keep to 5 bullet points covering: IP ownership, confidentiality, revision policy, warranty, payment terms. Plain English, not legalese."
  }
}
---
# Small / Startup Proposal — {{company.name}}

**Use-case context**: Concise 3-5 page proposal for {{company.name}} ({{company.industry}}, {{company.size.employees_band}} employees).

Key signals informing this proposal:
- Pain indicators: {{signals.pain_indicators}}
- Tech stack in use: {{signals.tech_stack}}
- Top automation opportunity: {{opportunities.0.title}}
  - Current state: {{opportunities.0.current_state}}
  - Proposed: {{opportunities.0.proposed_state}}
  - Impact: {{opportunities.0.impact.metric}} ≈ {{opportunities.0.impact.estimated_value}}

**Format**: Clear and direct. Each section 150-300 words max.
No governance section. No risk table. No org chart.
Decision-maker should be able to read the entire proposal in 10 minutes.
