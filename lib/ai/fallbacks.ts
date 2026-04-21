/**
 * Deterministic template fallbacks — used when no AI provider is configured
 * or when a specific section fails. Produces believable but obviously generic content
 * so the PDF can always render end-to-end.
 */

import type { ProposalInput } from './types';
import type { KBCompanyProfile } from '@/lib/knowledge-base/types';

export function fallbackExecutiveSummary(input: ProposalInput, company: KBCompanyProfile) {
  return {
    openingHook: `${input.clientName} is at an inflection point where the cost of inaction now exceeds the cost of transformation. The organizations that lead this decade will be those that convert AI capability into operating discipline.`,
    understanding: `Based on our review of ${input.clientName}'s publicly available signals and our experience in ${input.clientIndustry}, we see material opportunity to re-architect workflows around intelligent automation. The project brief — "${input.projectPrompt.slice(0, 120)}" — maps to a pattern we have delivered multiple times.`,
    solutionBullets: [
      `A purpose-built platform combining ${(input.preferredTechnologies ?? ['modern AI', 'cloud-native architecture']).slice(0, 2).join(' + ')} at the core.`,
      'A unified data and context layer that serves both AI and human operators from a single source of truth.',
      'A governance layer that provides full decision logging, audit trails, and regulator-ready exports.',
    ],
    expectedOutcomes: [
      { metric: 'Cost Reduction', value: '35%', description: 'in operational spend within 12 months' },
      { metric: 'Efficiency Gain', value: '4.2×', description: 'productivity lift on target workflows' },
      { metric: 'Time to Value', value: '< 6 mo', description: 'from kickoff to measurable outcomes' },
    ],
    investmentRange:
      input.budgetMin && input.budgetMax
        ? `${input.currency ?? 'USD'} ${input.budgetMin.toLocaleString()} — ${input.budgetMax.toLocaleString()}`
        : 'To be sized in Discovery',
    pricingModel: input.pricingModel ?? 'Fixed Price · Milestone-Linked',
    closingStatement: `${company.name} has delivered comparable programs in ${company.industriesServed.slice(0, 2).join(' and ')}. We bring the exact blend of engineering, domain fluency, and delivery discipline this engagement demands.`,
  };
}

export function fallbackProblemStatement(input: ProposalInput) {
  return {
    currentState: `${input.clientName} currently operates with significant manual effort across core workflows, constraining throughput and team capacity. Operational data suggests the current-state cost structure is both larger than peers and growing faster than revenue on comparable lines.`,
    painPoints: [
      { num: '01', title: 'Fragmented Data & Context', description: 'Information is siloed across multiple systems, forcing operators to reconstruct context on every interaction and preventing any single source of truth from emerging.' },
      { num: '02', title: 'Manual Decision Overhead', description: 'Judgment-heavy tasks that could be assisted or automated still consume senior operator time, creating both cost and scale ceiling.' },
      { num: '03', title: 'Compliance & Audit Load', description: 'Regulatory reporting and audit preparation absorb disproportionate engineering and operations cycles, with every new regulation extending the cycle further.' },
      { num: '04', title: 'Slow Time-to-Insight', description: 'Analytical questions the business needs to answer in hours currently take days, eroding the competitive value of the data itself.' },
    ],
    businessImpact:
      'Taken together, these frictions represent a material drag on operating margin and a measurable delay in strategic initiatives. Left unaddressed, the delta to best-in-class peers widens each quarter.',
    industryContext: `Across ${input.clientIndustry}, leading institutions are now deploying AI-led operating models with measured productivity gains of 30–60%. The competitive window for this capability is 12–18 months before it becomes table stakes.`,
  };
}

export function fallbackProposedSolution(input: ProposalInput) {
  const baseStack = ['TypeScript', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'pgvector', 'AWS', 'Terraform', 'Datadog', 'PagerDuty', 'Vault'];
  const preferred = input.preferredTechnologies ?? [];
  const merged = [...preferred];
  for (const t of baseStack) if (merged.length < 12 && !merged.includes(t)) merged.push(t);
  return {
    overview:
      'We propose a three-layer architecture built for a regulated enterprise: (1) a capability layer exposing AI-powered services via clean, versioned APIs, (2) a unified context and data layer serving both AI and human operators from a single source of truth, and (3) a governance layer providing immutable audit trails, decision logging, and regulator-ready compliance reporting. All three layers deploy into your existing cloud footprint with no data leaving your sovereign boundary. The AI operates against a streaming context proxy rather than copies of source data, minimising blast radius and simplifying data residency.',
    components: [
      { name: 'Intelligence Layer', description: 'LLM-driven orchestration, retrieval over indexed policy and knowledge, and controlled tool execution. Claude-based primary with deterministic guardrails on regulated actions — the decision core of the platform.' },
      { name: 'Unified Context Service', description: 'Real-time aggregation of customer and operational state from source systems into a single, consistent object accessible in under 120ms. Event-driven with change-data-capture streaming into a shared cache for sub-second context building.' },
      { name: 'Operator Console', description: 'Modern web UI giving operators full visibility into AI decisions, suggested next-best-actions, and one-click takeover when escalation is required. Integrated transcript, action history, and case-management hooks reduce agent ramp time by ~40%.' },
      { name: 'Compliance & Audit', description: 'Immutable decision logging, bias monitoring, consent flow capture, and regulator-ready report export. Control matrix is mapped to the client\'s applicable regulations with automated evidence collection.' },
      { name: 'Observability & SRE', description: 'Datadog-grade monitoring, structured logging, distributed tracing, synthetic probes, and 24×7 runbooks. Per-use-case SLOs with auto-paging integrated to PagerDuty and the client\'s existing incident stack.' },
      { name: 'Continuous Eval Harness', description: 'Weekly offline evaluations against a golden dataset, topic-drift detection, and automated regression gates before any model or prompt change hits production.' },
    ],
    integrations: [
      'Client core source-of-truth systems — real-time state retrieval via REST/gRPC',
      'Identity & auth — SSO, OTP, step-up authentication, device attestation',
      'Analytics / BI — event stream export via Kafka / Kinesis for downstream warehousing',
      'Communications — SIP telephony, email gateways, chat channels via Webhooks',
      'CRM / Ticketing — bi-directional sync with Salesforce, Zendesk, or ServiceNow',
      'Security & audit — SIEM log shipping, KMS-backed secret rotation',
      'Payments & billing — Stripe / native payment rails for commerce workflows',
      'Knowledge management — Confluence / internal wikis indexed for retrieval',
    ],
    techStack: merged.slice(0, 12),
    innovations: [
      'Zero-copy context architecture — data never leaves your VPC; the AI operates on a streaming proxy with end-to-end encryption in motion.',
      'Deterministic guardrails — the AI physically cannot execute regulated actions without explicit multi-factor verification, enforced at the tool layer rather than in the prompt.',
      'Continuous eval harness — every release is scored against a golden evaluation set before promotion, gating any drift beyond configured thresholds.',
      'Per-use-case observability — every AI decision is logged with full reasoning trace, enabling root-cause analysis for any production incident within minutes.',
    ],
  };
}

export function fallbackMethodology(input: ProposalInput) {
  const weeks = input.timelineWeeks ?? 24;
  const p1 = Math.max(2, Math.round(weeks * 0.15));
  const p2 = Math.max(3, Math.round(weeks * 0.25));
  const p3 = Math.max(4, Math.round(weeks * 0.4));
  const p4 = Math.max(2, Math.round(weeks * 0.12));
  const p5 = Math.max(2, weeks - p1 - p2 - p3 - p4);

  return {
    approach: input.methodology === 'Waterfall' ? 'Waterfall with Staged Sign-offs' : 'Agile with Regulatory Gates',
    summary:
      'We operate in two-week sprints with embedded demos and stage-gate reviews. Releases follow a controlled change-advisory rhythm aligned to your existing IT governance.',
    phases: [
      { num: 1, name: 'Discovery & Design', description: 'Process immersion, solution blueprint, and sign-off on architecture.', duration: `${p1} weeks` },
      { num: 2, name: 'Foundation Build', description: 'Context services, integrations, identity, and non-functional foundations.', duration: `${p2} weeks` },
      { num: 3, name: 'Core Implementation', description: 'Primary use cases, user experience, and shadow-mode trials.', duration: `${p3} weeks` },
      { num: 4, name: 'Integration & QA', description: 'End-to-end testing, security, compliance, and regulator walkthroughs.', duration: `${p4} weeks` },
      { num: 5, name: 'UAT & Rollout', description: 'Controlled rollout with ramp from 5% to 100% of eligible traffic.', duration: `${p5} weeks` },
    ],
    qa: [
      'Automated test suite with >80% coverage on business logic',
      'Weekly compliance audit by an independent QA team',
      'Fortnightly red-team exercises on security and policy bypass',
      'Production canary releases — 1% traffic for 48 hours before cutover',
    ],
    communication: [
      'Daily async standup in shared Slack + Loom video updates',
      'Weekly demo and sprint review with client stakeholders',
      'Bi-weekly steering committee with executive sponsors',
      'Monthly risk and compliance review',
    ],
  };
}

export function fallbackDeliverables(phaseNames: string[]) {
  return {
    items: [
      { phase: phaseNames[0] ?? 'Phase 1', name: 'Solution Blueprint', description: 'Complete architecture diagram, integration map, and compliance control matrix covering all in-scope systems and data flows.', acceptance: 'Signed off by the client architecture review board with no critical findings.' },
      { phase: phaseNames[0] ?? 'Phase 1', name: 'Project Plan & Risk Register', description: 'Detailed delivery plan with resource loading, risk register, mitigation plan, and RACI matrix.', acceptance: 'Approved by the steering committee and published in the shared PMO workspace.' },
      { phase: phaseNames[0] ?? 'Phase 1', name: 'Data & Integration Discovery', description: 'Data profiling of all source systems, interface specifications, and integration sequencing plan.', acceptance: 'Data-quality baseline documented; all integration owners confirmed.' },
      { phase: phaseNames[1] ?? 'Phase 2', name: 'Core Services Live', description: 'Context and integration services deployed to staging environment with full observability.', acceptance: 'All integration SLAs met; load-tested to 3× peak expected traffic.' },
      { phase: phaseNames[1] ?? 'Phase 2', name: 'Identity & Auth', description: 'SSO, step-up authentication, session management, and immutable audit logging in place.', acceptance: 'End-to-end auth flow demonstrated with full audit trail review by security.' },
      { phase: phaseNames[2] ?? 'Phase 3', name: 'Primary Use Cases', description: 'Top priority use cases delivered and shadow-tested in production against the existing baseline.', acceptance: 'Shadow-mode metrics meet or exceed acceptance thresholds for 10 business days.' },
      { phase: phaseNames[2] ?? 'Phase 3', name: 'Operator Console', description: 'Full operator UI with takeover, escalation, transcript review, and next-best-action suggestions.', acceptance: 'Operator user-acceptance testing complete; training sign-off from team leads.' },
      { phase: phaseNames[2] ?? 'Phase 3', name: 'Evaluation Harness', description: 'Continuous evaluation pipeline with golden dataset, drift detection, and automated regression gates.', acceptance: 'Weekly eval dashboard operational; baseline scorecards archived.' },
      { phase: phaseNames[3] ?? 'Phase 4', name: 'Security & Compliance Pack', description: 'External penetration test, bias audit, data protection impact assessment, and regulator-ready dossier.', acceptance: 'No critical findings; regulator walkthrough meeting completed.' },
      { phase: phaseNames[3] ?? 'Phase 4', name: 'Performance & Resilience Pack', description: 'Multi-region failover test, chaos engineering runs, and latency optimisation report.', acceptance: 'All per-use-case SLOs held during chaos runs; RTO/RPO documented.' },
      { phase: phaseNames[4] ?? 'Phase 5', name: 'Production Rollout', description: 'Full production deployment with runbooks, on-call rotation, and incident playbooks.', acceptance: '100% of eligible traffic live; 30-day steady-state SLA achieved.' },
      { phase: phaseNames[4] ?? 'Phase 5', name: 'Knowledge Transfer & Handover', description: 'Operations handover, architecture walkthrough, and 30-day hypercare transition to BAU teams.', acceptance: 'Client operations team signs off on runbooks and incident drills.' },
    ],
    milestones: [
      { name: 'Design Sign-off', target: 'Week 4' },
      { name: 'Foundation Acceptance', target: 'Week 9' },
      { name: 'Alpha Release', target: 'Week 13' },
      { name: 'Beta Launch', target: 'Week 17' },
      { name: 'Compliance Sign-off', target: 'Week 19' },
      { name: 'UAT Complete', target: 'Week 22' },
      { name: 'Production Go-Live', target: 'Week 24' },
    ],
  };
}

export function fallbackTimeline(input: ProposalInput) {
  const w = input.timelineWeeks ?? 24;
  return {
    totalWeeks: w,
    phases: [
      { num: 1, name: 'Discovery & Design', focus: 'Blueprint & compliance', startWeek: 0, durationWeeks: Math.round(w * 0.15) },
      { num: 2, name: 'Foundation Build', focus: 'Integrations & services', startWeek: Math.round(w * 0.12), durationWeeks: Math.round(w * 0.28) },
      { num: 3, name: 'Core Implementation', focus: 'Primary use cases', startWeek: Math.round(w * 0.35), durationWeeks: Math.round(w * 0.42) },
      { num: 4, name: 'Integration & QA', focus: 'Testing & compliance', startWeek: Math.round(w * 0.7), durationWeeks: Math.round(w * 0.2) },
      { num: 5, name: 'UAT & Rollout', focus: 'Controlled ramp', startWeek: Math.round(w * 0.83), durationWeeks: Math.round(w * 0.17) },
    ],
    milestones: [
      { label: 'Design Sign-off', atWeek: Math.round(w * 0.15) },
      { label: 'Alpha Release', atWeek: Math.round(w * 0.55) },
      { label: 'Beta Launch', atWeek: Math.round(w * 0.78) },
      { label: 'Go-Live', atWeek: w },
    ],
  };
}

export function fallbackBudget(input: ProposalInput, phaseNames: string[]) {
  const total = Math.round(((input.budgetMin ?? 150_000) + (input.budgetMax ?? 250_000)) / 2);
  const phases = [
    { name: phaseNames[0] ?? 'Discovery & Design', focus: 'Blueprint & compliance', effortPD: 60, amount: Math.round(total * 0.12) },
    { name: phaseNames[1] ?? 'Foundation Build', focus: 'Integrations', effortPD: 140, amount: Math.round(total * 0.26) },
    { name: phaseNames[2] ?? 'Core Implementation', focus: 'Primary use cases', effortPD: 220, amount: Math.round(total * 0.4) },
    { name: phaseNames[3] ?? 'Integration & QA', focus: 'Testing', effortPD: 80, amount: Math.round(total * 0.14) },
    { name: phaseNames[4] ?? 'UAT & Rollout', focus: 'Ramp', effortPD: 40, amount: Math.round(total * 0.08) },
  ];
  const budgetTotal = phases.reduce((s, p) => s + p.amount, 0);
  return {
    pricingModelLabel: `${input.pricingModel ?? 'Fixed Price'} · ${phases.length} Phases`,
    phases,
    totalAmount: budgetTotal,
    paymentMilestones: [
      { num: 1, name: 'Mobilization', trigger: 'At contract signature', amount: Math.round(budgetTotal * 0.15) },
      { num: 2, name: 'Design Sign-off', trigger: 'Blueprint approved', amount: Math.round(budgetTotal * 0.2) },
      { num: 3, name: 'Foundation Acceptance', trigger: 'Services live', amount: Math.round(budgetTotal * 0.22) },
      { num: 4, name: 'Alpha Delivered', trigger: 'Shadow-mode live', amount: Math.round(budgetTotal * 0.2) },
      { num: 5, name: 'Production Go-Live', trigger: '100% traffic live', amount: Math.round(budgetTotal * 0.15) },
      { num: 6, name: 'Steady-State Sign-off', trigger: '30-day SLA met', amount: Math.round(budgetTotal * 0.08) },
    ],
    notes:
      'Pricing excludes third-party licensing and pass-through costs which will be billed at cost with full transparency.',
  };
}

export function fallbackRiskMitigation() {
  return {
    introduction:
      'We run a structured risk assessment across delivery, technology, regulatory, adoption, data quality, vendor, and security axes. Risks are reviewed weekly at the working group, escalated to the steering committee for treatment decisions, and tracked with named owners in a shared risk register. The following are the top risks we actively manage with specific mitigations, artifacts, and review cadences.',
    risks: [
      { id: 'R-01', title: 'Integration delays with legacy systems', description: 'Dependencies on client IT teams for legacy system access, credentials, or schema changes may create unplanned wait states in Phase 2.', probability: 'Medium', impact: 'High', mitigation: 'Early integration spike in Week 1; named client counterpart with SLA on response; contingency week baked into Phase 2 plan. Reviewed weekly at working group.' },
      { id: 'R-02', title: 'Data quality in source systems', description: 'Inconsistent, duplicate, or incomplete records in source systems can degrade downstream AI accuracy and operator trust.', probability: 'High', impact: 'Medium', mitigation: 'Data profiling sweep in Week 2; automated reconciliation layer with alerts; quality SLAs negotiated with source-system owners. Monthly data-quality scorecard review.' },
      { id: 'R-03', title: 'Regulatory interpretation change', description: 'Guidance in this domain continues to evolve, particularly around generative AI and data handling.', probability: 'Low', impact: 'High', mitigation: 'Quarterly regulatory review with legal counsel; modular architecture allowing rapid policy swaps; dedicated compliance liaison on working group.' },
      { id: 'R-04', title: 'Operator adoption & change resistance', description: 'End users may resist new tooling, shifts in workflow, or perceived job-security concerns.', probability: 'Medium', impact: 'Medium', mitigation: 'Co-design sessions from Week 2; champion program across teams; phased rollout with feedback loops; explicit incentive alignment with client HR.' },
      { id: 'R-05', title: 'Latency & scale regressions', description: 'Performance at production load may diverge from staging, especially during peak traffic windows.', probability: 'Medium', impact: 'Medium', mitigation: 'Weekly 3× peak load tests against production-equivalent infra; autoscaling + regional failover; per-use-case SLOs enforced as release gates.' },
      { id: 'R-06', title: 'Third-party vendor incident', description: 'Outage or rate-limiting at a critical upstream vendor (AI, telephony, payments) could cascade to platform availability.', probability: 'Low', impact: 'High', mitigation: 'Dual-vendor fallback chain for every external dependency; graceful degradation path to human fallback; vendor-specific runbooks and synthetic probes.' },
      { id: 'R-07', title: 'Scope drift', description: 'Mid-project scope changes — new use cases, new integrations — can jeopardise timeline, cost, and quality if not governed.', probability: 'Medium', impact: 'Medium', mitigation: 'Formal change-request process with impact-assessment template; steering committee approval required; SOW addendum for any scope delta.' },
      { id: 'R-08', title: 'Security or data incident', description: 'Any security incident during or post-deployment carries regulatory, reputational, and operational cost.', probability: 'Low', impact: 'High', mitigation: 'Threat-modeled architecture from Day 1; external penetration test in Phase 4; immutable audit logging; 24×7 incident response runbooks with documented RTO/RPO.' },
    ],
  };
}

export function fallbackGovernance(company: KBCompanyProfile) {
  return {
    introduction:
      'Strong program governance is non-negotiable at this scale. We operate with a two-tier model with a documented escalation path, all tools tied into the client enterprise stack.',
    steeringCommittee: [
      'Client Executive Sponsor (CIO / CTO)',
      'Client Head of Operations',
      'Client Head of Compliance & Risk',
      `${company.name} Engagement Lead`,
      `${company.name} Delivery Director`,
    ],
    workingGroup: [
      'Client IT Delivery Lead',
      'Client Product Owner',
      'Client Compliance Partner',
      `${company.name} Tech Lead`,
      `${company.name} Design Lead`,
    ],
    reportingCadence: [
      { frequency: 'Daily', what: 'Async standup in shared channel + video updates' },
      { frequency: 'Weekly', what: 'Sprint review, risk log update, burndown' },
      { frequency: 'Bi-Weekly', what: 'Steering committee status and decisions' },
      { frequency: 'Monthly', what: 'Compliance and risk audit with client risk team' },
    ],
    escalationPath: ['Team Lead', 'Delivery Manager', 'Engagement Lead', 'Steering Committee'],
    tools: ['Jira (tracking)', 'Confluence (docs)', 'Slack (daily)', 'Loom (demos)', 'Datadog (ops)', 'PagerDuty (on-call)'],
    changeManagement:
      'Scope changes follow a formal change-request process with impact analysis on schedule, cost, and risk. Approvals are captured in writing and reflected in an SOW addendum.',
  };
}

export function fallbackWhyUs(company: KBCompanyProfile) {
  return {
    differentiators: [
      { icon: '◆', headline: 'We ship in production', description: 'Every case study is live production — not POCs, not demos. Our code runs where revenue and regulation meet.' },
      { icon: '◆', headline: 'Regulated-industry first', description: `Built for ${company.certifications.slice(0, 3).join(', ') || 'enterprise compliance'} from day one. Compliance is first-class, not a retrofit.` },
      { icon: '◆', headline: 'Senior-heavy teams', description: 'The engineers named on this proposal are the engineers who will write the code. No bait-and-switch.' },
      { icon: '◆', headline: 'Outcome accountability', description: 'We structure pricing around outcomes where feasible — aligned incentives from day one.' },
      { icon: '◆', headline: 'Full-stack delivery', description: 'Design, engineering, SRE, and compliance under one roof. Fewer handoffs, faster cycle time.' },
      { icon: '◆', headline: 'Transparent operations', description: 'Open tooling, visible dashboards, shared runbooks. You always know exactly what is happening.' },
    ],
    stats: [
      { value: `${company.projectsDelivered}+`, label: 'Enterprise Programs' },
      { value: '99.95%', label: 'Uptime SLA' },
      { value: '4.8/5', label: 'Client CSAT' },
      { value: `${company.teamSize}`, label: 'Experts on Team' },
    ],
  };
}

export function fallbackTerms() {
  return {
    clauses: [
      { title: 'Confidentiality & NDA', body: 'All materials, data, and information exchanged under this engagement are confidential. Both parties will execute a mutual NDA prior to kick-off, effective throughout the engagement and for three years thereafter.' },
      { title: 'Intellectual Property', body: 'All custom-developed code, models, and deliverables produced exclusively for the client under this engagement are assigned to the client on final payment. The vendor retains rights to pre-existing tools, libraries, and frameworks brought to the engagement.' },
      { title: 'Warranty & Support', body: 'The vendor warrants all deliverables against defects for 90 days post go-live. Defects reported in this period are remediated at no additional cost. Support beyond 90 days is available under a separate AMS agreement.' },
      { title: 'Payment Terms', body: 'Invoices are payable within 30 days of issue. Late payments attract interest at 1.5% per month compounded. Applicable taxes are additional.' },
      { title: 'Service-Level Agreement', body: 'Production support covers P1 incidents with a 15-minute response and 2-hour resolution target, P2 with 1-hour response and 8-hour resolution. 99.95% platform uptime is guaranteed in production.' },
      { title: 'Data Handling & Privacy', body: 'Customer data remains within the agreed region. No personally identifiable information is used for model training. Applicable data-protection law is honored throughout.' },
      { title: 'Termination', body: 'Either party may terminate for material breach with 30 days written notice and an opportunity to cure. On termination, the vendor will provide a reasonable knowledge transfer over a 4-week transition window.' },
      { title: 'Dispute Resolution', body: 'Disputes are resolved via binding arbitration in the jurisdiction agreed in the master services agreement, before a sole arbitrator mutually appointed by the parties.' },
    ],
    validity: 'This proposal is valid for 60 days from the date of issue.',
  };
}
