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
  const baseStack = ['TypeScript', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS', 'Terraform'];
  const preferred = input.preferredTechnologies ?? [];
  const merged = [...preferred];
  for (const t of baseStack) if (merged.length < 8 && !merged.includes(t)) merged.push(t);
  return {
    overview:
      'We propose a three-layer architecture: (1) a capability layer exposing AI-powered services via clean APIs, (2) a unified context and data layer serving both AI and human operators from a single source of truth, and (3) a governance layer providing audit trails, decision logging, and compliance reporting. All layers deploy into your existing cloud footprint with no data leaving your sovereign boundary.',
    components: [
      { name: 'Intelligence Layer', description: 'LLM-driven orchestration, retrieval, and controlled tool execution — the decision core of the platform.' },
      { name: 'Unified Context Service', description: 'Real-time aggregation of customer and operational state from source systems into a single consistent object.' },
      { name: 'Operator Console', description: 'Modern web UI giving operators full visibility into AI decisions and one-click takeover on escalation.' },
      { name: 'Compliance & Audit', description: 'Immutable decision logging, bias monitoring, and regulator-ready report export.' },
      { name: 'Observability & SRE', description: 'Datadog-grade monitoring, alerting, runbooks, and per-use-case SLOs for 24×7 operations.' },
      { name: 'Continuous Eval Harness', description: 'Weekly evaluations against a golden dataset with automated regression gates before any change ships.' },
    ],
    integrations: [
      'Core source-of-truth systems — real-time state retrieval (REST/gRPC)',
      'Identity & auth — SSO, OTP, step-up authentication',
      'Analytics / BI — event stream export for downstream warehousing',
      'Communications — telephony, email, chat channels',
      'Security & audit — SIEM log shipping, secret rotation',
    ],
    techStack: merged.slice(0, 8),
    innovations: [
      'Zero-copy context architecture — data never leaves your VPC; the AI operates on a streaming proxy.',
      'Deterministic guardrails — the AI cannot execute regulated actions without explicit verification.',
      'Continuous eval harness — every release is scored against golden datasets before promotion.',
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
      { phase: phaseNames[0] ?? 'Phase 1', name: 'Solution Blueprint', description: 'Architecture, integrations, and compliance control matrix.', acceptance: 'Signed off by the client architecture review board.' },
      { phase: phaseNames[1] ?? 'Phase 2', name: 'Core Services Live', description: 'Context and integration services deployed to staging with full observability.', acceptance: 'All integration SLAs met; load-tested to 3× peak.' },
      { phase: phaseNames[1] ?? 'Phase 2', name: 'Identity & Auth', description: 'SSO, step-up auth, and immutable audit logging in place.', acceptance: 'End-to-end auth flow with full audit trail.' },
      { phase: phaseNames[2] ?? 'Phase 3', name: 'Primary Use Cases', description: 'Top priority use cases delivered and shadow-tested in production.', acceptance: 'Shadow metrics meet or exceed acceptance thresholds.' },
      { phase: phaseNames[2] ?? 'Phase 3', name: 'Operator Console', description: 'Full operator UI with takeover and next-best-action suggestions.', acceptance: 'Operators trained and UAT signed off.' },
      { phase: phaseNames[3] ?? 'Phase 4', name: 'Security & Compliance Pack', description: 'External pen-test, bias audit, and regulator-ready dossier.', acceptance: 'No critical findings; regulator walkthrough complete.' },
    ],
    milestones: [
      { name: 'Design Sign-off', target: 'Week 4' },
      { name: 'Alpha Release', target: 'Week 13' },
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
      'We run a structured risk assessment across delivery, technology, regulatory, adoption, data quality, and vendor axes. Risks are reviewed weekly at the working group, escalated to the steering committee for treatment decisions, and tracked with named owners in a shared risk register.',
    risks: [
      { id: 'R-01', title: 'Integration delays with legacy systems', description: 'Client IT dependencies may create unplanned wait states in Phase 2.', probability: 'Medium', impact: 'High', mitigation: 'Early integration spike in Week 1; named client counterpart; contingency week baked into Phase 2.' },
      { id: 'R-02', title: 'Data quality in source systems', description: 'Inconsistent or incomplete records can degrade downstream AI accuracy.', probability: 'High', impact: 'Medium', mitigation: 'Data profiling in Week 2; automated reconciliation layer; quality SLAs on source data.' },
      { id: 'R-03', title: 'Regulatory interpretation change', description: 'Guidance in this domain continues to evolve, particularly around generative AI.', probability: 'Low', impact: 'High', mitigation: 'Quarterly regulatory review; modular architecture; dedicated compliance liaison.' },
      { id: 'R-04', title: 'Operator adoption & change resistance', description: 'End users may resist new tooling or workflow shifts.', probability: 'Medium', impact: 'Medium', mitigation: 'Co-design sessions from Week 2; champion program; phased rollout with feedback loops.' },
      { id: 'R-05', title: 'Latency & scale regressions', description: 'Performance at production load may diverge from staging during peak windows.', probability: 'Medium', impact: 'Medium', mitigation: 'Weekly 3× peak load tests; autoscaling + regional failover; per-use-case SLOs as release gates.' },
      { id: 'R-06', title: 'Third-party vendor incident', description: 'Outage at a critical upstream vendor could cascade to platform availability.', probability: 'Low', impact: 'High', mitigation: 'Dual-vendor fallback chain; graceful degradation path; vendor-specific runbooks.' },
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
