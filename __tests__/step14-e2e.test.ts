/**
 * Step 14 QA — final wire: EnrichedCompany → full templated proposal.
 *
 * ✓ legacy + enrichedCompanyId → all ProposalData sections populated
 * ✓ synthesised projectPrompt carries company, industry, and opportunity data
 * ✓ RAG proof query uses the opportunity title extracted from synthesised prompt
 * ✓ RAG passages injected into proposedSolution, problemStatement, whyUs
 * ✓ non-approved status → throws approval-gate error
 * ✓ linkedin regression: projectPrompt path, 4 sections, no scraper call
 * ✓ upwork regression: projectPrompt path, 5 sections, no scraper call
 * ✓ API route rejects legacy/small without enrichedCompanyId (400)
 */

// ─── mocks (must precede imports) ────────────────────────────────────────────

jest.mock('@/lib/rag/scraper-client', () => ({
  __esModule: true,
  fetchEnrichedCompany: jest.fn(),
}));

const mockGenerate = jest.fn();
jest.mock('@/lib/ai/ai-client', () => ({
  __esModule: true,
  generate: (...args: unknown[]) => mockGenerate(...args),
  hasAnyAiProvider: jest.fn(() => true),
  aiProviderName: jest.fn(() => 'mock'),
}));

const mockQueryRAG = jest.fn();
jest.mock('@/lib/rag/client', () => ({
  __esModule: true,
  queryRAG: (...args: unknown[]) => mockQueryRAG(...args),
  withRagContext: jest.requireActual('@/lib/rag/client').withRagContext,
  formatPassages: jest.requireActual('@/lib/rag/client').formatPassages,
  EMPTY_RAG: { passages: [], query: '', fromCache: false },
  clearRagCache: jest.fn(),
}));

// ─── imports after mocks ──────────────────────────────────────────────────────

import { fetchEnrichedCompany } from '@/lib/rag/scraper-client';
import { generateProposalData } from '@/lib/ai/generate-proposal';
import { clearRagCache } from '@/lib/rag/client';
import type { ProposalInput, EnrichedCompany } from '@/lib/ai/types';

const mockFetchEnriched = fetchEnrichedCompany as jest.MockedFunction<typeof fetchEnrichedCompany>;

// ─── fixtures ─────────────────────────────────────────────────────────────────

const ENRICHED_COMPANY: EnrichedCompany = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  url: 'https://swifthaul.example.com',
  use_case: 'legacy',
  user_owner: 'pk',
  status: 'approved',
  company: {
    name: 'SwiftHaul Logistics',
    industry: 'Logistics',
    sub_industry: 'Freight Management',
    size: { employees_band: '500-1000', revenue_band: '100M-500M' },
    hq_country: 'USA',
    other_locations: [],
    ownership: 'pe_backed',
    archetype: 'pe_growth',
    founded_year: 2001,
    recent_events: [
      { date: '2024-08', type: 'expansion', description: 'Expanded to 5 new routes across the Gulf' },
    ],
  },
  signals: {
    tech_stack: ['Oracle TMS', 'SAP ERP', 'Legacy dispatch software'],
    hiring_roles: ['Logistics Analyst', 'Dispatcher', 'Route Planner'],
    pain_indicators: ['Manual load planning taking 3h per shift', 'Route inefficiency'],
    compliance_footprint: ['ISO 9001'],
    digital_maturity_score: 0.45,
  },
  people: {
    primary: {
      name: 'Sarah Chen',
      role: 'COO',
      seniority: 'c_suite',
      linkedin_url: null,
      email: 'sarah.chen@swifthaul.example.com',
      email_status: 'verified',
      rationale: 'Owns operations and technology decisions',
      source: 'linkedin',
    },
    secondary: null,
    tertiary: null,
    all_discovered: [],
  },
  opportunities: [
    {
      title: 'Automate Manual Load Planning',
      current_state: 'Manual dispatch process taking 3h per shift',
      proposed_state: 'AI-driven load optimisation reducing planning effort by 80%',
      impact: { metric: 'Dispatcher Hours Saved', estimated_value: '40h/week' },
      effort: 'medium',
      priority_score: 0.87,
    },
    {
      title: 'AI Route Optimisation',
      current_state: 'Static routes updated quarterly',
      proposed_state: 'Dynamic ML-optimised routing updated hourly',
      impact: { metric: 'Fuel Cost Reduction', estimated_value: '18% annually' },
      effort: 'large',
      priority_score: 0.79,
    },
  ],
  confidence: { overall: 0.81, per_section: { company: 0.9, signals: 0.75 } },
  created_at: '2026-04-20T09:00:00Z',
  approved_at: '2026-04-20T10:00:00Z',
  approved_by: 'pk',
};

const EMPTY = { passages: [], query: '', fromCache: false };
const TECH_PASSAGES = [
  { text: 'PK uses event-driven microservices with Kafka for logistics route optimisation.', score: 0.94 },
];
const ABOUT_PASSAGES = [
  { text: 'Phavella delivered a 40% throughput improvement for a mid-market freight company.', score: 0.91 },
];
const PROOF_PASSAGES = [
  { text: 'AI route optimisation reduced fuel costs by 22% for a 500-truck fleet in 2024.', score: 0.87 },
];

const minimalKb = {
  company: {
    name: 'Phavella',
    tagline: 'AI',
    founded: 2022,
    headquarters: 'Mumbai',
    teamSize: 10,
    projectsDelivered: 20,
    industriesServed: ['Logistics'],
    mission: 'Build',
    certifications: [],
    coreCompetencies: [],
    brandColors: { primary: '#000', secondary: '#111', accent: '#222' },
  },
  projects: [],
  team: [],
};

function makeInput(useCase: ProposalInput['useCase'], overrides: Partial<ProposalInput> = {}): ProposalInput {
  const usesEnriched = useCase === 'legacy' || useCase === 'small';
  return {
    useCase,
    userOwner: 'pk',
    projectTitle: 'AI Transformation for SwiftHaul',
    clientName: 'SwiftHaul Logistics',
    clientIndustry: 'Logistics',
    projectPrompt: usesEnriched
      ? '' // enrichedCompanyId path — synthesized prompt replaces this
      : 'Build an AI route optimisation platform — Automate Manual load planning — effort medium, priority 0.87',
    enrichedCompanyId: usesEnriched ? ENRICHED_COMPANY.id : undefined,
    currency: 'USD',
    budgetMin: 100_000,
    budgetMax: 300_000,
    timelineWeeks: 20,
    methodology: 'Agile',
    pricingModel: 'Fixed Price',
    includeCaseStudies: false,
    includeTeamBios: false,
    proposalVersion: '1.0',
    ...overrides,
  };
}

// ─── setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockGenerate.mockReset();
  mockQueryRAG.mockReset();
  mockFetchEnriched.mockReset();
  clearRagCache();
  mockGenerate.mockResolvedValue({ parsed: {}, text: '{}', provider: 'mock', modelId: 'mock' });
  mockQueryRAG.mockResolvedValue(EMPTY);
  mockFetchEnriched.mockResolvedValue(ENRICHED_COMPANY);
});

// ─── §1: full legacy path via EnrichedCompany ─────────────────────────────────

describe('legacy + enrichedCompanyId — full ProposalData', () => {
  it('all ProposalData sections are defined', async () => {
    const data = await generateProposalData(makeInput('legacy'), minimalKb as never);

    expect(data.proposal.projectTitle).toBe('AI Transformation for SwiftHaul');
    expect(data.executiveSummary).toBeDefined();
    expect(data.problemStatement).toBeDefined();
    expect(data.proposedSolution).toBeDefined();
    expect(data.methodology).toBeDefined();
    expect(data.deliverables).toBeDefined();
    expect(data.timeline).toBeDefined();
    expect(data.budget).toBeDefined();
    expect(data.riskMitigation).toBeDefined();
    expect(data.governance).toBeDefined();
    expect(data.whyUs).toBeDefined();
    expect(data.terms).toBeDefined();
  }, 30_000);

  it('fetchEnrichedCompany is called with the correct enrichedCompanyId', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    expect(mockFetchEnriched).toHaveBeenCalledWith(ENRICHED_COMPANY.id);
    expect(mockFetchEnriched).toHaveBeenCalledTimes(1);
  }, 30_000);

  it('synthesised projectPrompt contains company name, industry, and opportunity data', async () => {
    const calls: { user: string }[] = [];
    mockGenerate.mockImplementation(async (opts: { user: string }) => {
      calls.push(opts);
      return { parsed: {}, text: '{}', provider: 'mock', modelId: 'mock' };
    });

    await generateProposalData(makeInput('legacy'), minimalKb as never);

    // All section prompts embed input.projectPrompt which is synthesised from EnrichedCompany
    const anyUserMsg = calls.map((c) => c.user).join('\n');
    expect(anyUserMsg).toContain('SwiftHaul Logistics');
    expect(anyUserMsg).toContain('Logistics');
    expect(anyUserMsg).toContain('Automate Manual Load Planning');
    expect(anyUserMsg).toContain('Sarah Chen');
  }, 30_000);
});

// ─── §2: RAG uses opportunity title from synthesised prompt ───────────────────

describe('RAG integration with EnrichedCompany synthesis', () => {
  it('proof-points RAG query uses the opportunity title from EnrichedCompany', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockQueryRAG.mock.calls as [string, string][];
    // The synthesised prompt has "- Automate Manual Load Planning — effort medium, ..."
    // Regex extracts "Automate Manual Load Planning" → used in proof query
    const proofCall = calls.find(([q]) => q.includes('Automate Manual Load Planning'));
    expect(proofCall).toBeDefined();
    expect(proofCall![0]).toContain('proof points');
  }, 30_000);

  it('architecture RAG query uses the client industry from EnrichedCompany', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockQueryRAG.mock.calls as [string, string][];
    const techCall = calls.find(([q]) => q.includes('architecture pattern'));
    expect(techCall).toBeDefined();
    expect(techCall![0]).toContain('Logistics');
  }, 30_000);

  it('RAG passages from all three queries appear in the correct generate() calls', async () => {
    mockQueryRAG.mockImplementation(async (query: string) => {
      if (query.includes('architecture pattern')) return { passages: TECH_PASSAGES, query, fromCache: false };
      if (query.includes('team bio')) return { passages: ABOUT_PASSAGES, query, fromCache: false };
      if (query.includes('proof points')) return { passages: PROOF_PASSAGES, query, fromCache: false };
      return EMPTY;
    });

    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { user: string });

    const solutionCall = calls.find((c) => c.user.includes('ARCHITECTURE REFERENCE'));
    expect(solutionCall).toBeDefined();
    expect(solutionCall!.user).toContain('event-driven microservices with Kafka');

    const whyUsCall = calls.find((c) => c.user.includes('ABOUT PHAVELLA'));
    expect(whyUsCall).toBeDefined();
    expect(whyUsCall!.user).toContain('40% throughput improvement');

    const probCall = calls.find((c) => c.user.includes('OPPORTUNITY PROOF POINTS'));
    expect(probCall).toBeDefined();
    expect(probCall!.user).toContain('22% for a 500-truck fleet');
  }, 30_000);

  it('userOwner from input is passed to all RAG queries', async () => {
    await generateProposalData(makeInput('legacy', { userOwner: 'aj' }), minimalKb as never);

    const calls = mockQueryRAG.mock.calls as [string, string][];
    for (const [, owner] of calls) {
      expect(owner).toBe('aj');
    }
  }, 30_000);
});

// ─── §3: approval gate ────────────────────────────────────────────────────────

describe('approval gate', () => {
  it('pending_review → throws', async () => {
    mockFetchEnriched.mockResolvedValue({ ...ENRICHED_COMPANY, status: 'pending_review' });
    await expect(generateProposalData(makeInput('legacy'), minimalKb as never)).rejects.toThrow(
      /Analysis pending review — approve in scraper UI first/,
    );
  }, 30_000);

  it('rejected → throws', async () => {
    mockFetchEnriched.mockResolvedValue({ ...ENRICHED_COMPANY, status: 'rejected' });
    await expect(generateProposalData(makeInput('legacy'), minimalKb as never)).rejects.toThrow(
      /Analysis pending review/,
    );
  }, 30_000);

  it('scraper network failure → propagates error (no swallowing)', async () => {
    mockFetchEnriched.mockRejectedValue(new Error('Connection refused'));
    await expect(generateProposalData(makeInput('legacy'), minimalKb as never)).rejects.toThrow(
      'Connection refused',
    );
  }, 30_000);
});

// ─── §4: linkedin regression ──────────────────────────────────────────────────

describe('linkedin regression — textarea path unchanged', () => {
  it('no enrichedCompanyId → fetchEnrichedCompany not called', async () => {
    await generateProposalData(makeInput('linkedin'), minimalKb as never);
    expect(mockFetchEnriched).not.toHaveBeenCalled();
  }, 30_000);

  it('linkedin generates exactly 4 AI sections', async () => {
    await generateProposalData(makeInput('linkedin'), minimalKb as never);
    expect(mockGenerate).toHaveBeenCalledTimes(4);
  }, 30_000);

  it('linkedin uses original projectPrompt (not synthesised)', async () => {
    const promptCalls: string[] = [];
    mockGenerate.mockImplementation(async (opts: { user: string }) => {
      promptCalls.push(opts.user);
      return { parsed: {}, text: '{}', provider: 'mock', modelId: 'mock' };
    });

    const linkedinInput = makeInput('linkedin');
    await generateProposalData(linkedinInput, minimalKb as never);

    // Original projectPrompt should appear in generate() calls
    expect(promptCalls.some((u) => u.includes('AI route optimisation platform'))).toBe(true);
    // SwiftHaul appears only because clientName is set, not from synthesis
    expect(mockFetchEnriched).not.toHaveBeenCalled();
  }, 30_000);

  it('whyUs RAG fires for linkedin (whyUs is in linkedin template)', async () => {
    await generateProposalData(makeInput('linkedin'), minimalKb as never);

    const calls = mockQueryRAG.mock.calls as [string, string][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(true);
  }, 30_000);
});

// ─── §5: upwork regression ────────────────────────────────────────────────────

describe('upwork regression — textarea path unchanged', () => {
  it('upwork generates exactly 5 AI sections', async () => {
    await generateProposalData(makeInput('upwork'), minimalKb as never);
    expect(mockGenerate).toHaveBeenCalledTimes(5);
  }, 30_000);

  it('whyUs RAG does NOT fire for upwork (whyUs not in upwork template)', async () => {
    await generateProposalData(makeInput('upwork'), minimalKb as never);

    const calls = mockQueryRAG.mock.calls as [string, string][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(false);
  }, 30_000);

  it('no enrichedCompanyId → fetchEnrichedCompany not called', async () => {
    await generateProposalData(makeInput('upwork'), minimalKb as never);
    expect(mockFetchEnriched).not.toHaveBeenCalled();
  }, 30_000);
});

// ─── §6: API route useCase guard ─────────────────────────────────────────────

describe('API route — useCase guard for legacy/small', () => {
  // We test the guard logic by importing the route handler and creating a
  // minimal mock Request. We mock all heavy dependencies so only the guard fires.

  jest.mock('@/lib/proposals/store', () => ({
    __esModule: true,
    newProposalId: jest.fn(() => 'test-id'),
    proposalDir: jest.fn(() => '/tmp/test'),
    saveProposal: jest.fn(),
  }));
  jest.mock('@/lib/knowledge-base/manager', () => ({
    __esModule: true,
    getKnowledgeBase: jest.fn(() => ({ company: {}, projects: [], team: [] })),
  }));
  jest.mock('@/lib/pdf/template', () => ({
    __esModule: true,
    assembleProposalHtml: jest.fn(() => '<html></html>'),
  }));
  jest.mock('@/lib/pdf/generate-pdf', () => ({
    __esModule: true,
    generateProposalPdf: jest.fn(() => Buffer.from('fake-pdf')),
  }));
  jest.mock('node:fs', () => ({
    ...jest.requireActual('node:fs'),
    mkdirSync: jest.fn(),
  }));

  // The route is imported after the mocks above so they're captured.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { POST } = require('@/app/api/generate/route') as { POST: (req: Request) => Promise<Response> };

  function makeReq(body: Record<string, unknown>): Request {
    return new Request('http://localhost/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  const baseBody = {
    projectTitle: 'Test',
    clientName: 'Test Co',
    clientIndustry: 'Tech',
  };

  it('legacy without enrichedCompanyId → 400', async () => {
    const res = await POST(makeReq({ ...baseBody, useCase: 'legacy', projectPrompt: 'some prompt' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('enrichedCompanyId');
  });

  it('small without enrichedCompanyId → 400', async () => {
    const res = await POST(makeReq({ ...baseBody, useCase: 'small', projectPrompt: 'some prompt' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('enrichedCompanyId');
  });

  it('linkedin with only projectPrompt → NOT blocked by enrichedCompanyId guard (passes guard)', async () => {
    const res = await POST(
      makeReq({ ...baseBody, useCase: 'linkedin', projectPrompt: 'LinkedIn outreach for AI logistics solution' }),
    );
    // Guard does not fire — may succeed or fail downstream (AI/PDF mocks may not be perfect)
    // but must NOT be a 400 from the enrichedCompanyId guard
    if (res.status === 400) {
      const body = (await res.json()) as { error: string };
      expect(body.error).not.toContain('enrichedCompanyId');
    }
  });

  it('upwork with only projectPrompt → NOT blocked by enrichedCompanyId guard', async () => {
    const res = await POST(
      makeReq({ ...baseBody, useCase: 'upwork', projectPrompt: 'Upwork cover letter for AI project' }),
    );
    if (res.status === 400) {
      const body = (await res.json()) as { error: string };
      expect(body.error).not.toContain('enrichedCompanyId');
    }
  });

  it('legacy WITH enrichedCompanyId → passes the guard (no 400 from guard)', async () => {
    // fetchEnrichedCompany mock already set up at module level
    const res = await POST(
      makeReq({
        ...baseBody,
        useCase: 'legacy',
        enrichedCompanyId: ENRICHED_COMPANY.id,
      }),
    );
    // The guard must NOT fire — status will be 200 or 500 depending on downstream mocks
    if (res.status === 400) {
      const body = (await res.json()) as { error: string };
      expect(body.error).not.toContain('enrichedCompanyId is required');
    }
  });
});
