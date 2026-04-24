---
{
  "sections": [
    "executiveSummary", "companyOverview", "problemStatement", "proposedSolution",
    "methodology", "deliverables", "timeline", "team", "caseStudies",
    "budget", "riskMitigation", "governance", "whyUs", "terms"
  ],
  "systemOverride": "This is a full enterprise proposal for a $50M+ business. Write with the authority and precision of a Big-4 consulting firm. Every claim must be grounded in the scraped signals. Use the EnrichedCompany opportunities as the narrative spine of the engagement. Quantify all outcomes. Match the tone to the company archetype: regulated = formal and compliance-aware; pe_growth = ROI-first; large_corporate = process-oriented; founder_led_midmarket = direct and results-focused.",
  "promptGuidance": {
    "executiveSummary": "Open with the company name and a one-sentence characterisation of their strategic position based on the enriched data. Follow with: (1) the top 2-3 pain signals observed, (2) the proposed AI transformation thesis in 2-3 sentences, (3) expected outcomes with 2-3 quantified metrics from the opportunities data. Close with a statement of why now. Target 400-500 words.",
    "companyOverview": "Populate from our Knowledge Base (team size, years, certifications). Tailor the framing to make our capabilities directly relevant to this client's industry and archetype.",
    "problemStatement": "Structure around the top 3 pain indicators from the enriched data. For each: name the pain, show the business cost (referencing scraped evidence), and note the archetype-specific pressure driving urgency. Use the hiring signals as evidence of scale of problem.",
    "proposedSolution": "Use the AutomationOpportunity list as the section backbone. For each top-3 opportunity: name it, explain current vs proposed state, name the specific AI/automation technique, and give the impact metric. Conclude with an integration architecture overview that connects their identified tech stack.",
    "methodology": "Use Agile phases aligned to the opportunity roadmap. Phase 1 = quick wins (small-effort opportunities). Phase 2 = core build. Phase 3 = integration with their existing tech stack (name the tools from signals.tech_stack). Phase 4 = optimisation and knowledge transfer.",
    "deliverables": "Derive deliverables from the opportunities list. Each opportunity maps to 1-2 deliverables with clear acceptance criteria. Include integration docs for their specific tech stack.",
    "timeline": "Sequence phases based on opportunity effort scores: small-effort opportunities in Phase 1, large-effort in Phase 3+. Total duration informed by budget range and team size.",
    "team": "Select team members whose expertise aligns with the client's tech stack and industry. For regulated archetype, include a compliance/security specialist. For pe_growth, highlight ROI track record.",
    "caseStudies": "Select case studies from the same industry or with similar tech stack. If none exact match, pick closest by archetype. Lead each case study with the metric most relevant to this client's top pain indicator.",
    "budget": "Phase the investment around the opportunity roadmap. Phase 1 (quick wins) should be the smallest cost envelope to establish trust. Include an ROI projection table using the impact metrics from the opportunities data.",
    "riskMitigation": "Top risks specific to this engagement: (1) data integration risk with their specific tech stack, (2) change management risk given the company size/archetype, (3) timeline risk from any recent events (acquisition, expansion). Each risk gets a concrete mitigation, not a generic one.",
    "governance": "Match reporting cadence to archetype: regulated = weekly written status + steering committee; pe_growth = biweekly with ROI dashboard; large_corporate = weekly standup + monthly exec review; founder_led_midmarket = async updates + monthly call.",
    "whyUs": "Lead with the case study result most relevant to this client's pain indicators. Follow with 4 differentiators, each tied to a specific signal from the enriched data. Close with a quantified track record stat.",
    "terms": "Standard enterprise terms: IP ownership, confidentiality, 90-day warranty, net-30 payment. Add a compliance clause if the company archetype is 'regulated'."
  }
}
---
# Legacy Enterprise Proposal — {{company.name}}

**Use-case context**: Full 10-15 page enterprise proposal for {{company.name}}.
Industry: {{company.industry}} | Archetype: {{company.archetype}} | Size: {{company.size.employees_band}}

Automation opportunities (narrative spine of this proposal):
{{#opportunities}}
- {{title}} | effort: {{effort}} | priority: {{priority_score}}
  Current: {{current_state}}
  Proposed: {{proposed_state}}
  Impact: {{impact.metric}} ≈ {{impact.estimated_value}}
{{/opportunities}}

Key decision makers:
- Primary: {{people.primary.name}}, {{people.primary.role}} ({{people.primary.seniority}})
- Secondary: {{people.secondary.name}}, {{people.secondary.role}}

Observed signals:
- Tech stack: {{signals.tech_stack}}
- Hiring: {{signals.hiring_roles}}
- Pain indicators: {{signals.pain_indicators}}
- Compliance footprint: {{signals.compliance_footprint}}
- Digital maturity: {{signals.digital_maturity_score}}

Recent events:
{{#company.recent_events}}
- [{{type}}] {{description}}
{{/company.recent_events}}

**Format**: Full enterprise proposal. All 14 sections. Each section 300-600 words.
Ground every claim in the scraped signals above. No generic AI promises.
