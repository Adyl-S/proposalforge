/**
 * Hardcoded sample proposal data — used by both test-pdf and capture-pages scripts
 * to validate the template + CSS pipeline before AI content generation is wired up.
 */

import { renderBudgetDonut, renderTimelineGantt } from '../lib/utils/chart-renderer';
import { getInitials } from '../lib/utils/helpers';
import type { ProposalData } from '../lib/pdf/types';

export function buildSampleData(): ProposalData {
  const timelineChart = renderTimelineGantt(
    [
      { name: 'Discovery & Design', startWeek: 0, durationWeeks: 4 },
      { name: 'Foundation Build', startWeek: 3, durationWeeks: 6 },
      { name: 'Core Implementation', startWeek: 8, durationWeeks: 10 },
      { name: 'Integration & QA', startWeek: 16, durationWeeks: 5 },
      { name: 'UAT & Rollout', startWeek: 20, durationWeeks: 4 },
    ],
    24,
    [
      { label: 'Design Sign-off', atWeek: 4 },
      { label: 'Alpha Release', atWeek: 13 },
      { label: 'Beta Launch', atWeek: 18 },
      { label: 'Go-Live', atWeek: 24 },
    ],
  );

  const budgetChart = renderBudgetDonut([
    { label: 'Discovery & Design', value: 28000 },
    { label: 'Foundation Build', value: 62000 },
    { label: 'Core Implementation', value: 98000 },
    { label: 'Integration & QA', value: 34000 },
    { label: 'UAT & Rollout', value: 18000 },
  ]);

  const data: ProposalData = {
    proposal: {
      projectTitle: 'AI-Powered Customer Service Intelligence Platform',
      projectSubtitle:
        'An end-to-end conversational AI platform to automate tier-1 customer interactions, reduce cost-to-serve by 45%, and lift NPS for 50M+ retail banking customers.',
      clientName: 'Meridian Bank',
      clientIndustry: 'Banking & Financial Services',
      version: '1.0',
      date: 'April 16, 2026',
      validThrough: 'June 30, 2026',
    },
    company: {
      name: 'Phavella Technologies',
      tagline: 'AI-Powered Digital Transformation',
      founded: 2022,
      headquarters: 'Mumbai, India',
      teamSize: 25,
      yearsInBusiness: 4,
      projectsDelivered: 50,
      industriesCount: 5,
      industriesServed: ['FinTech', 'Healthcare', 'E-Commerce', 'Real Estate', 'Education'],
      mission:
        'We build intelligent, production-grade AI systems that move enterprise KPIs — not demos, not prototypes, real revenue-bearing workloads.',
      certifications: ['AWS Advanced Partner', 'ISO 27001:2022', 'SOC 2 Type II', 'Google Cloud Partner'],
      coreCompetencies: [
        { name: 'AI & Machine Learning', description: 'Production-grade ML pipelines, NLP, computer vision, and generative AI solutions deployed at enterprise scale.' },
        { name: 'Conversational & Voice AI', description: 'Sub-second latency voice agents, multilingual IVR, and omnichannel chatbots built on LiveKit, Deepgram, and proprietary orchestration.' },
        { name: 'Full-Stack Engineering', description: 'Next.js, FastAPI, React Native — modern web and mobile applications built for reliability and speed.' },
        { name: 'Cloud & Platform', description: 'AWS, GCP, Azure — scalable, cost-optimized, SOC 2 compliant infrastructure with 99.95% uptime SLAs.' },
      ],
      signatoryName: 'Adil Sheikh',
      signatoryTitle: 'Founder',
    },
    toc: [
      { number: '01', title: 'Executive Summary', page: 3, major: true },
      { number: '02', title: 'About Phavella Technologies', page: 5, major: true },
      { number: '03', title: 'Understanding the Challenge', page: 6, major: true },
      { number: '04', title: 'Proposed Solution', page: 8, major: true },
      { number: '05', title: 'Methodology & Approach', page: 10, major: true },
      { number: '06', title: 'Deliverables & Milestones', page: 11, major: true },
      { number: '07', title: 'Project Timeline', page: 12, major: true },
      { number: '08', title: 'Proposed Team', page: 13, major: true },
      { number: '09', title: 'Relevant Case Studies', page: 14, major: true },
      { number: '10', title: 'Investment & Pricing', page: 17, major: true },
      { number: '11', title: 'Risk Mitigation', page: 19, major: true },
      { number: '12', title: 'Governance & PMO', page: 20, major: true },
      { number: '13', title: 'Why Phavella', page: 21, major: true },
      { number: '14', title: 'Terms & Conditions', page: 22, major: true },
    ],
    executiveSummary: {
      openingHook:
        'Meridian Bank is navigating a structural inflection point: retail customer expectations now anchor on instant, context-aware, self-serve experiences, while tier-1 contact-center costs continue to climb at 8% YoY. The banks that win the next decade will not be those that hire faster — they will be those that deploy AI that serves faster.',
      understanding:
        'Your teams handle ~2.1M monthly contacts across voice, chat, and email, with an average handle time of 7m 48s and a 14.2% repeat-contact rate. After reviewing your Q1-26 operational review, we see three compounding frictions: fragmented customer context across 9 systems, low containment on voice IVR (21%), and rising regulatory load from RBI Digital Lending norms.',
      solutionBullets: [
        'A LiveKit-based AI voice and chat agent capable of natural conversations with sub-700ms response latency, resolving 70% of tier-1 queries without human escalation.',
        'A unified customer-context layer that pulls from your core banking, CRM, and case systems in real time — giving both the AI and human agents a single, reliable pane of glass.',
        'A compliance-by-design architecture that logs every AI decision, enforces RBI/DPDPA guardrails, and supports full audit trails for internal controls and regulator reviews.',
      ],
      expectedOutcomes: [
        { metric: 'Cost Reduction', value: '45%', description: 'in tier-1 operational spend within 12 months of go-live' },
        { metric: 'Deflection Rate', value: '70%', description: 'of voice and chat contacts resolved without agent' },
        { metric: 'Projected ROI', value: '4.2×', description: 'on total program investment over 24 months' },
      ],
      investmentRange: '₹2.4 Cr — ₹3.1 Cr',
      pricingModel: 'Fixed-Price with Outcome-Linked Uplift',
      closingStatement:
        'Phavella has delivered production AI voice platforms for regulated industries across India — including deployments in healthcare, lending, and insurance. We bring deep familiarity with Indian enterprise constraints (data localization, multi-lingual support, telecom integration) and a team that has shipped, scaled, and operated these systems in live production.',
    },
    problemStatement: {
      currentState:
        'Meridian Bank currently operates a hybrid contact center model with 1,400 agents handling approximately 2.1M contacts per month. Despite significant investment in workflow automation, core experience metrics have plateaued: first-contact resolution sits at 68%, voice IVR containment at 21%, and average handle time at 7m 48s — each materially behind private-sector peers.',
      painPoints: [
        { num: '01', title: 'Fragmented Customer Context', description: 'Agents toggle between 9 disparate systems (core banking, CRM, cards, lending, compliance, KYC) to resolve a single query. The context-gathering overhead alone consumes 34% of handle time, and the same lookups must be repeated on every re-contact.' },
        { num: '02', title: 'Low Self-Service Containment', description: 'Existing IVR and chatbots contain only 21% of voice traffic and 38% of chat traffic. Most drop-offs occur at authentication, account-status queries, and card servicing — all problems where AI has demonstrated containment rates above 70% elsewhere.' },
        { num: '03', title: 'Rising Compliance Load', description: 'RBI Digital Lending norms, DPDPA 2023, and internal audit demands have added ~18% to average call duration over 18 months. Manual disclosure and consent flows continue to consume material agent time even where the underlying query is simple.' },
        { num: '04', title: 'Repeat-Contact Leakage', description: 'A 14.2% repeat-contact rate means one in seven interactions is a preventable re-work. Root causes — unclear resolution, mis-routing, incomplete KYC — are systemic, not agent-level, and require an AI-driven closure assistant to fix.' },
      ],
      businessImpact:
        'Compounded, these frictions represent an estimated ₹84 Cr in annual excess operational cost and a 9-point NPS gap versus the best-in-class private bank peer set. Left unaddressed, this gap widens as agent wages, regulatory overhead, and customer expectations continue to scale.',
      industryContext:
        'Across Indian retail banking, leading institutions are now deploying generative AI in tier-1 operations with measured deflection of 55–75% and ACSI improvements of 4–9 points. Regulators have indicated comfort with well-governed AI in customer service, provided decision logging, human-in-the-loop escalation, and bias testing are operationalized. The competitive window for deploying this capability is 12–18 months before it becomes table stakes.',
    },
    proposedSolution: {
      overview:
        'We propose a three-layer platform: (1) a conversation layer — an AI voice and chat agent capable of natural multi-turn dialogue — (2) a context layer that unifies customer data across Meridian’s 9 source systems in real time, and (3) a governance layer providing end-to-end decision logging, escalation handoff, and regulatory reporting. All three are cloud-deployed on your existing AWS India region, with no data leaving Indian sovereign boundaries.',
      components: [
        { name: 'Voice & Chat Agent', description: 'Low-latency LLM-driven agent built on LiveKit + Deepgram + Claude 3.5, supporting Hindi, English, Marathi, Tamil, and Telugu with barge-in and interruption handling.' },
        { name: 'Unified Context Service', description: 'Real-time aggregation layer that reconciles customer state from core banking, CRM, cards, and lending systems into a single event-driven context object accessible in <120ms.' },
        { name: 'AI Decision Engine', description: 'Tool-use orchestration, retrieval over policy/knowledge base, and controlled action execution (OTP, balance, dispute) with strict transaction boundaries.' },
        { name: 'Human-in-the-Loop Console', description: 'Agent desktop showing AI transcript, suggested actions, and one-click takeover — reducing agent ramp time and protecting against AI edge cases.' },
        { name: 'Compliance & Governance', description: 'Full decision logging, RBI/DPDPA consent flows, bias monitoring dashboard, and regulator-ready audit export.' },
        { name: 'Analytics & Continuous Learning', description: 'Weekly eval loops, conversation quality scoring, topic drift detection, and model refresh cycles.' },
      ],
      integrations: [
        'Core Banking (Finacle) — real-time account balance, statement retrieval, status updates',
        'CRM (Salesforce FS Cloud) — customer profile, interaction history, case creation',
        'Cards & Lending systems — dispute registration, EMI status, cap/limit queries',
        'KYC / Identity — OTP dispatch, step-up auth, biometric verification hand-off',
        'Telephony — native SIP trunk integration with Meridian’s Avaya fabric',
      ],
      techStack: [
        'LiveKit (WebRTC)', 'Deepgram Nova-3', 'Anthropic Claude 3.5 Sonnet',
        'ElevenLabs Turbo', 'FastAPI', 'Postgres 16 + pgvector',
        'Redis Streams', 'AWS Mumbai', 'Terraform', 'Datadog',
      ],
      innovations: [
        'Sub-700ms end-to-end voice latency — measurably faster than any currently deployed AI voice system in Indian banking.',
        'On-the-fly language switching mid-conversation without re-authentication — unique to our orchestration layer.',
        'Deterministic guardrails: the AI cannot execute regulated actions (transfers, statement change) without explicit multi-factor verification.',
        'Zero-copy context architecture — customer data never leaves Meridian’s VPC; the AI operates on a streaming proxy.',
      ],
    },
    methodology: {
      approach: 'Agile with Regulatory Gates',
      summary:
        'We operate in two-week sprints with embedded demos, compliance reviews at each stage gate, and continuous deployment to lower environments. Production releases follow a stricter change-advisory rhythm aligned to your existing IT governance.',
      phases: [
        { num: 1, name: 'Discovery & Design', description: 'Deep process immersion, data-flow mapping, conversation design, and architectural blueprint sign-off.', duration: '4 weeks' },
        { num: 2, name: 'Foundation Build', description: 'Context service, telephony integration, identity plumbing, and non-functional foundations (logging, SRE, secrets).', duration: '6 weeks' },
        { num: 3, name: 'Core Implementation', description: 'Voice agent, decision engine, agent desktop, and the top-25 intents by volume. Shadow-mode trials in production.', duration: '10 weeks' },
        { num: 4, name: 'Integration & QA', description: 'End-to-end load, compliance, security penetration, and bias testing. Regulator walkthroughs.', duration: '5 weeks' },
        { num: 5, name: 'UAT & Rollout', description: 'Controlled rollout by segment and branch, ramping from 5% to 100% of eligible traffic with daily ops reviews.', duration: '4 weeks' },
      ],
      qa: [
        'Automated eval suite: 10k scored conversations per week against golden answers',
        'Weekly compliance audit of all AI decisions by an independent QA team',
        'Red-team exercises every fortnight to stress jailbreaks and policy bypass',
        'Production canary: 1% traffic on each model release for 48 hours before full cutover',
      ],
      communication: [
        'Daily async standup with engineering leads (Slack + Loom updates)',
        'Weekly demo and sprint review with Meridian product and IT stakeholders',
        'Bi-weekly steering committee meeting (CXO + CTO + COO)',
        'Monthly regulatory and risk review with Meridian compliance team',
      ],
    },
    deliverables: {
      items: [
        { phase: 'Phase 1', name: 'Conversation Design Blueprint', description: 'Complete intent map, dialogue flows, exception paths, and UX prototypes for all top-25 intents.', acceptance: 'Signed off by Meridian CX, IT, and Compliance leads.' },
        { phase: 'Phase 1', name: 'Architecture & Compliance Package', description: 'Solution architecture document, RBI-mapped control matrix, data flow diagrams, threat model.', acceptance: 'Architecture Review Board approval; no critical findings.' },
        { phase: 'Phase 2', name: 'Unified Context Service', description: 'Production-deployed service aggregating data from Finacle, Salesforce, cards, and lending with <120ms p95 latency.', acceptance: 'Load-tested to 3x peak; all integration SLAs met.' },
        { phase: 'Phase 2', name: 'Telephony & Identity Bridge', description: 'SIP integration with Avaya, OTP/step-up-auth plumbing, and secure transcript pipeline.', acceptance: 'End-to-end call completes with full compliance logging.' },
        { phase: 'Phase 3', name: 'AI Voice & Chat Agent', description: 'Production-ready agent covering top-25 intents across 5 languages.', acceptance: '70% containment in shadow mode; <1% compliance violations.' },
        { phase: 'Phase 3', name: 'Agent Desktop Console', description: 'Real-time transcript, suggested-next-action panel, one-click takeover, full case capture.', acceptance: '1,400 contact-center agents trained and signed off.' },
        { phase: 'Phase 4', name: 'Security & Compliance Package', description: 'Penetration test report, bias audit, RBI/DPDPA submission dossier.', acceptance: 'Clean external audit; regulator walkthrough complete.' },
        { phase: 'Phase 5', name: 'Production Rollout & Runbooks', description: 'Full production deployment, 24×7 runbooks, on-call rotation, incident playbooks.', acceptance: '100% of eligible traffic live; 30-day steady-state SLA met.' },
      ],
      milestones: [
        { name: 'Design Sign-off', target: 'Week 4' },
        { name: 'Context Service Live', target: 'Week 9' },
        { name: 'Alpha Agent in Shadow Mode', target: 'Week 13' },
        { name: 'Compliance Sign-off', target: 'Week 18' },
        { name: 'UAT Complete', target: 'Week 22' },
        { name: 'Production Go-Live', target: 'Week 24' },
      ],
    },
    timeline: {
      totalDuration: '24 weeks · ~6 months',
      chartImage: timelineChart,
      phases: [
        { num: 1, name: 'Discovery & Design', focus: 'Blueprint, architecture, compliance mapping', duration: '4 weeks', start: 'Week 1' },
        { num: 2, name: 'Foundation Build', focus: 'Context service, telephony, identity', duration: '6 weeks', start: 'Week 4' },
        { num: 3, name: 'Core Implementation', focus: 'Voice/chat agent, decision engine, desktop', duration: '10 weeks', start: 'Week 9' },
        { num: 4, name: 'Integration & QA', focus: 'Load, compliance, security, bias testing', duration: '5 weeks', start: 'Week 17' },
        { num: 5, name: 'UAT & Rollout', focus: 'Controlled production ramp 5% → 100%', duration: '4 weeks', start: 'Week 21' },
      ],
    },
    team: {
      size: 7,
      introduction:
        'A dedicated seven-person squad, ring-fenced for this engagement end-to-end. Every role is filled by a senior practitioner with shipped enterprise AI production experience.',
      members: [
        { name: 'Adil Sheikh', title: 'Engagement Lead & Lead AI Architect', initials: getInitials('Adil Sheikh'), yearsExperience: 5, expertiseSummary: 'Production AI voice systems, LLM orchestration', relevance: 'Designed and shipped 3 production AI voice platforms across healthcare, lending, and retail. Deep familiarity with LiveKit, multi-tenant compliance, and sub-second latency orchestration.', roleOnProject: 'Overall technical ownership, architecture decisions, client stakeholder management.' },
        { name: 'Priya Natarajan', title: 'Conversational AI Design Lead', initials: 'PN', yearsExperience: 9, expertiseSummary: 'CX design, dialogue architecture, multilingual UX', relevance: 'Former head of CX at a top-3 private bank. Designed IVR and chatbot flows for 40M+ customers. Native-fluent across Hindi, Tamil, Marathi.', roleOnProject: 'Owns end-to-end conversation design, intent coverage, and UX acceptance.' },
        { name: 'Rohan Desai', title: 'Principal Backend Engineer', initials: 'RD', yearsExperience: 11, expertiseSummary: 'Distributed systems, FastAPI, event streaming', relevance: '11 years scaling fintech backends at Razorpay, CRED, and Navi. Built the unified context layer for a top-5 insurer.', roleOnProject: 'Technical lead for the context service, integration layer, and streaming platform.' },
        { name: 'Ananya Iyer', title: 'Senior ML Engineer', initials: 'AI', yearsExperience: 7, expertiseSummary: 'LLM fine-tuning, eval pipelines, RAG', relevance: 'Built evaluation pipelines for two tier-1 banking chatbots. Published on safety-aware LLM routing.', roleOnProject: 'Owns the decision engine, evaluation infrastructure, and model governance.' },
        { name: 'Vikram Seshadri', title: 'Security & Compliance Lead', initials: 'VS', yearsExperience: 14, expertiseSummary: 'RBI, DPDPA, SOC 2, threat modeling', relevance: 'Led compliance delivery for two RBI-regulated AI deployments. Former internal auditor at HDFC.', roleOnProject: 'Owns RBI/DPDPA package, bias audit, and regulator walkthroughs.' },
        { name: 'Meera Pillai', title: 'Site Reliability Engineer', initials: 'MP', yearsExperience: 8, expertiseSummary: 'AWS, Terraform, observability, 24x7 ops', relevance: 'Operated 9-figure-scale transactional platforms with 99.97% uptime. Incident-commander certified.', roleOnProject: 'Owns production ops, observability, and runbooks.' },
        { name: 'Karthik Rao', title: 'Delivery Manager', initials: 'KR', yearsExperience: 12, expertiseSummary: 'Agile delivery, banking program management', relevance: 'Delivered 11 enterprise banking programs on-time and on-budget. PMP + SAFe certified.', roleOnProject: 'Owns day-to-day program management, risk tracking, and cadence.' },
      ],
    },
    caseStudies: {
      items: [
        {
          title: 'AI Voice Agent for Multi-Branch Healthcare Network',
          clientIndustry: 'Healthcare · India',
          year: 2025,
          duration: '3 months',
          challenge: 'A 40-clinic dental chain was losing 40% of inbound calls to missed or abandoned routing. Frontline staff could not keep pace with demand, and appointment revenue was materially at risk.',
          solution: 'We shipped an AI voice agent on LiveKit + Deepgram + Gemini with ElevenLabs voice output. The agent handles booking, rescheduling, insurance pre-screening, and reminders autonomously across 3 languages.',
          outcome: 'Within 8 weeks of go-live, missed calls dropped 85% and appointment bookings increased 60%. The platform is now the primary front door for all inbound patient contact.',
          metrics: [
            { value: '85%', label: 'Reduction in missed calls' },
            { value: '60%', label: 'Lift in appointments' },
            { value: '24/7', label: 'Availability, no staffing change' },
          ],
          technologies: ['LiveKit', 'Deepgram', 'Gemini', 'ElevenLabs', 'FastAPI', 'MongoDB'],
          testimonial: {
            quote: 'The AI agent handles calls better than our front-desk staff. It never misses a beat, never gets tired, and never mis-books.',
            author: 'Dr. Priya Sharma',
            authorTitle: 'Founder, SmileCare Dental Group',
          },
        },
        {
          title: 'Real-Time Credit Decisioning Agent for Digital Lender',
          clientIndustry: 'Fintech · India',
          year: 2025,
          duration: '5 months',
          challenge: 'An RBI-licensed digital lender needed a conversational agent to run guided disclosures and collect KYC-compatible consent for personal loans in vernacular languages — at scale, with full audit trails.',
          solution: 'We delivered a compliance-first voice agent integrated with the lender’s credit engine. The agent performs layered disclosures, collects and time-stamps consent, and hands off to human underwriters when policy requires.',
          outcome: 'Onboarding conversion improved 31% without any increase in delinquency. The solution passed a full RBI audit on first submission.',
          metrics: [
            { value: '31%', label: 'Lift in onboarding conversion' },
            { value: '100%', label: 'First-pass RBI audit clearance' },
            { value: '<5%', label: 'Escalation rate to humans' },
          ],
          technologies: ['LiveKit', 'Whisper', 'Claude 3.5', 'PostgreSQL', 'Terraform', 'AWS Mumbai'],
        },
        {
          title: 'AI-Augmented Claims Triage for Health Insurance',
          clientIndustry: 'Insurance · India',
          year: 2024,
          duration: '4 months',
          challenge: 'A health insurer processed 12k monthly claims manually, with a 7-day average turnaround and a 22% re-work rate from document inconsistencies.',
          solution: 'We built a multi-modal AI triage layer that classifies claims, flags anomalies, and routes high-confidence approvals straight through — with full audit and human-in-the-loop handoff.',
          outcome: 'Turnaround dropped from 7 days to 18 hours; straight-through processing reached 52% within 90 days.',
          metrics: [
            { value: '9×', label: 'Faster turnaround' },
            { value: '52%', label: 'Straight-through rate' },
            { value: '40%', label: 'Drop in re-work' },
          ],
          technologies: ['Claude 3.5', 'OpenAI Vision', 'LangGraph', 'FastAPI', 'Postgres', 'AWS'],
        },
      ],
    },
    budget: {
      pricingModel: 'Fixed Price · 5 Phases',
      phases: [
        { name: 'Discovery & Design', focus: 'Blueprint, architecture, compliance', effort: '68 PD', cost: '₹28,00,000' },
        { name: 'Foundation Build', focus: 'Context, telephony, identity', effort: '142 PD', cost: '₹62,00,000' },
        { name: 'Core Implementation', focus: 'Agent, decision engine, desktop', effort: '228 PD', cost: '₹98,00,000' },
        { name: 'Integration & QA', focus: 'Load, compliance, security', effort: '78 PD', cost: '₹34,00,000' },
        { name: 'UAT & Rollout', focus: 'Ramp, runbooks, steady-state', effort: '42 PD', cost: '₹18,00,000' },
      ],
      totalEffort: '558 PD',
      totalCost: '₹2,40,00,000',
      chartImage: budgetChart,
      paymentMilestones: [
        { num: 1, name: 'Mobilization', trigger: 'At contract signature', amount: '₹36,00,000' },
        { num: 2, name: 'Design Sign-off', trigger: 'Blueprint approved', amount: '₹48,00,000' },
        { num: 3, name: 'Foundation Acceptance', trigger: 'Context service live', amount: '₹54,00,000' },
        { num: 4, name: 'Alpha Agent Delivered', trigger: 'Shadow-mode live', amount: '₹54,00,000' },
        { num: 5, name: 'Production Go-Live', trigger: '100% traffic live', amount: '₹36,00,000' },
        { num: 6, name: 'Steady-State Sign-off', trigger: '30-day SLA met', amount: '₹12,00,000' },
      ],
      notes:
        'Pricing excludes third-party licensing (LiveKit, Deepgram, Anthropic usage) which will be billed at cost with full transparency. A detailed TCO forecast is provided in Appendix A.',
    },
    riskMitigation: {
      introduction:
        'We have run a structured risk assessment across delivery, regulatory, and technology axes. The following are the top seven risks we actively manage with defined mitigation actions, owners, and review cadences.',
      risks: [
        { id: 'R-01', title: 'Integration delays with legacy systems', description: 'Finacle and Avaya teams may have dependency windows outside our control.', probability: 'Medium', probabilityClass: 'med', impact: 'High', impactClass: 'high', mitigation: 'Early integration spike in Week 1; dedicated Meridian counterpart named; contingency week baked into Phase 2.' },
        { id: 'R-02', title: 'Regulatory interpretation change', description: 'RBI guidance on generative AI in financial services continues to evolve.', probability: 'Low', probabilityClass: 'low', impact: 'High', impactClass: 'high', mitigation: 'Quarterly regulatory review; modular architecture allows rapid policy swaps; dedicated compliance liaison.' },
        { id: 'R-03', title: 'Model hallucination on policy queries', description: 'LLMs can produce plausible but incorrect policy answers.', probability: 'Medium', probabilityClass: 'med', impact: 'High', impactClass: 'high', mitigation: 'Retrieval-grounded responses only; hard-coded refusal on non-indexed topics; full decision logging and weekly audits.' },
        { id: 'R-04', title: 'Latency regression at peak load', description: 'Voice UX requires consistent sub-700ms response times.', probability: 'Medium', probabilityClass: 'med', impact: 'Medium', impactClass: 'med', mitigation: 'Load tests at 3x peak weekly; autoscaling + regional failover; per-intent latency SLOs.' },
        { id: 'R-05', title: 'Agent adoption & change resistance', description: 'Contact-center agents may resist AI co-pilot changes.', probability: 'Medium', probabilityClass: 'med', impact: 'Medium', impactClass: 'med', mitigation: 'Co-design sessions in Week 2; incentive alignment with Meridian HR; phased rollout with champion agents.' },
        { id: 'R-06', title: 'Data quality issues in source systems', description: 'Inconsistent customer records can degrade AI accuracy.', probability: 'High', probabilityClass: 'high', impact: 'Medium', impactClass: 'med', mitigation: 'Data profiling in Week 2; automated reconciliation layer; quality SLAs on source data by system.' },
        { id: 'R-07', title: 'Third-party vendor incident', description: 'Outages at Deepgram/Anthropic could affect availability.', probability: 'Low', probabilityClass: 'low', impact: 'High', impactClass: 'high', mitigation: 'Dual-vendor fallback chain (Deepgram + Whisper, Claude + GPT-4o); graceful human-fallback path.' },
      ],
    },
    governance: {
      introduction:
        'Strong program governance is non-negotiable at this scale. We operate with a two-tier governance model and a documented escalation path, all tools tied into Meridian’s existing enterprise stack.',
      steeringCommittee: [
        'Meridian CIO / CTO (Executive Sponsor)',
        'Meridian Head of Retail Operations',
        'Meridian Head of Compliance & Risk',
        'Phavella Founder (Engagement Lead)',
        'Phavella Delivery Director',
      ],
      workingGroup: [
        'Meridian IT delivery lead (daily-available)',
        'Meridian Product Owner (voice/chat)',
        'Meridian Compliance Partner',
        'Phavella Tech Lead',
        'Phavella Conversational Design Lead',
      ],
      reportingCadence: [
        { frequency: 'Daily', what: 'Async standup in shared Slack channel + Loom demo' },
        { frequency: 'Weekly', what: 'Sprint review, risk log update, burndown' },
        { frequency: 'Bi-Weekly', what: 'Steering committee status and decisions' },
        { frequency: 'Monthly', what: 'Compliance and risk audit with Meridian risk team' },
      ],
      escalationPath: ['Team Lead', 'Delivery Manager', 'Engagement Lead', 'Steering Committee'],
      tools: ['Jira (program)', 'Confluence (docs)', 'Slack (daily)', 'Loom (demos)', 'Datadog (ops)', 'Meridian Archer (risk)'],
      changeManagement:
        'Scope changes follow a formal change-request process with impact analysis on schedule, cost, and risk. Approvals are captured in writing and reflected in the SOW addendum.',
    },
    whyUs: {
      differentiators: [
        { icon: '◆', headline: 'We ship in production', description: 'Every case study is live production — not POCs, not demos. Our code runs where revenue and regulation meet.' },
        { icon: '◆', headline: 'Regulated-industry first', description: 'Built for RBI, DPDPA, SOC 2 from day one. Compliance is a first-class citizen, not a retrofit.' },
        { icon: '◆', headline: 'Sub-second voice latency', description: 'Our LiveKit orchestration consistently delivers <700ms end-to-end — a measurable differentiator in live call UX.' },
        { icon: '◆', headline: 'Multilingual, India-native', description: 'Hindi, Marathi, Tamil, Telugu, Bengali — out of the box, tested to grade-school reading comprehension.' },
        { icon: '◆', headline: 'AI + human, always', description: 'Every system we ship has explicit human-in-the-loop affordances. AI augments, never replaces, regulated judgment.' },
        { icon: '◆', headline: 'Named senior team', description: 'The engineers named on this proposal are the engineers who will write the code. No bait-and-switch.' },
      ],
      stats: [
        { value: '50+', label: 'Enterprise Programs' },
        { value: '99.95%', label: 'Uptime SLA' },
        { value: '4.8/5', label: 'Client CSAT' },
        { value: '<700ms', label: 'Voice Latency' },
      ],
      featuredTestimonial: {
        quote: 'Phavella delivered in four months what two larger integrators quoted nine for. And the quality of the engineering was genuinely a differentiator — we trust it in production.',
        author: 'Rakesh Menon',
        authorTitle: 'CTO, a leading Indian NBFC',
      },
    },
    terms: {
      clauses: [
        { title: 'Confidentiality & NDA', body: 'All materials, data, and information exchanged under this engagement are confidential. Both parties will execute a mutual NDA prior to the kick-off meeting, effective throughout the engagement and for three years thereafter.' },
        { title: 'Intellectual Property', body: 'All custom-developed code, models, and deliverables produced exclusively for Meridian Bank under this engagement are assigned to Meridian on final payment. Phavella retains rights to pre-existing tools, libraries, and frameworks brought to the engagement.' },
        { title: 'Warranty & Support', body: 'Phavella warrants all deliverables against defects for 90 days post go-live. Defects reported in this period are remediated at no additional cost. Support beyond 90 days is available under a separate AMS agreement.' },
        { title: 'Payment Terms', body: 'All invoices are payable within 30 days of issue in INR via NEFT/RTGS. Late payments attract interest at 1.5% per month compounded. GST is additional at applicable rates.' },
        { title: 'Service-Level Agreement', body: 'Production support covers P1 incidents with a 15-minute response and 2-hour resolution target, P2 with 1-hour response and 8-hour resolution. 99.95% platform uptime is guaranteed in the production environment.' },
        { title: 'Data Handling & Privacy', body: 'All customer data remains within Meridian’s AWS Mumbai region. No personally identifiable information is used for model training. Full DPDPA compliance is warranted, with data subject rights honored via Meridian’s existing flows.' },
        { title: 'Termination', body: 'Either party may terminate this engagement for material breach with 30 days written notice and an opportunity to cure. On termination, Phavella will provide a reasonable knowledge transfer over a 4-week transition window.' },
        { title: 'Dispute Resolution', body: 'This agreement is governed by the laws of India. Disputes are resolved via binding arbitration in Mumbai under the Arbitration and Conciliation Act, 1996, before a sole arbitrator mutually appointed by the parties.' },
      ],
      validity: 'This proposal is valid for 60 days from the date of issue.',
    },
  };

  return data;
}
