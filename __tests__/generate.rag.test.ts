/**
 * Step 13 QA — RAG integration with proposal generation.
 *
 * Checklist:
 * ✓ §5 proposedSolution (Technical Approach) receives RAG architecture passages
 * ✓ §8 whyUs (About Phavella) receives RAG team/project passages
 * ✓ §3 problemStatement (opportunity rationale) receives RAG proof-point passages
 * ✓ RAG queries fire with correct query strings (industry + opportunity)
 * ✓ Graceful degradation: empty RAG → proposal still generates (no crash)
 * ✓ Degradation verified: without RAG context, generate() still receives a call
 * ✓ Sections NOT in template never trigger RAG queries
 */

import type { ProposalInput } from '@/lib/ai/types';

// ─── mocks ────────────────────────────────────────────────────────────────────

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

import { generateProposalData } from '@/lib/ai/generate-proposal';
import { clearRagCache } from '@/lib/rag/client';

// ─── fixtures ─────────────────────────────────────────────────────────────────

function makeInput(useCase: ProposalInput['useCase'], overrides: Partial<ProposalInput> = {}): ProposalInput {
  return {
    useCase,
    userOwner: 'pk',
    projectTitle: 'AI for Acme Logistics',
    clientName: 'Acme Logistics',
    clientIndustry: 'Logistics',
    projectPrompt: 'Build an AI-powered route optimisation platform for Acme Logistics. Automate Manual load planning — effort medium, priority 0.80\n- Automate Manual load planning — effort medium, priority 0.80',
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

const minimalKb = {
  company: {
    name: 'Phavella', tagline: 'AI', founded: 2022, headquarters: 'Mumbai',
    teamSize: 10, projectsDelivered: 20, industriesServed: ['Logistics'],
    mission: 'Build', certifications: [], coreCompetencies: [],
    brandColors: { primary: '#000', secondary: '#111', accent: '#222' },
  },
  projects: [],
  team: [],
};

// RAG passage fixture
const TECH_PASSAGES = [
  { text: 'PK uses event-driven microservices with Kafka for logistics pipelines.', score: 0.94 },
];
const ABOUT_PASSAGES = [
  { text: 'Phavella delivered a 40% throughput improvement for a mid-market freight company in 2024.', score: 0.91 },
];
const PROOF_PASSAGES = [
  { text: 'AI route optimisation reduced fuel costs by 22% for a 500-truck fleet.', score: 0.87 },
];

const EMPTY = { passages: [], query: '', fromCache: false };

// ─── setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockGenerate.mockReset();
  mockQueryRAG.mockReset();
  clearRagCache();
  // Default: generate returns empty parsed so mergeWithFallback uses fallback
  mockGenerate.mockResolvedValue({ parsed: {}, text: '{}', provider: 'mock', modelId: 'mock' });
  // Default RAG returns empty — each test overrides as needed
  mockQueryRAG.mockResolvedValue(EMPTY);
});

// ─── Checklist item 1: §5 proposedSolution receives architecture RAG ──────────

describe('§5 Technical Approach — architecture RAG injection', () => {
  it('queryRAG is called with architecture query for proposedSolution', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    const techCall = calls.find(([q]) => q.includes('architecture pattern'));
    expect(techCall).toBeDefined();
    expect(techCall![0]).toContain('Logistics');
  }, 30_000);

  it('architecture RAG passages appear in the proposedSolution generate() call', async () => {
    mockQueryRAG.mockImplementation((query: string) => {
      if (query.includes('architecture pattern')) {
        return Promise.resolve({ passages: TECH_PASSAGES, query, fromCache: false });
      }
      return Promise.resolve(EMPTY);
    });

    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { system: string; user: string });
    const solutionCall = calls.find((c) => c.user.includes('ARCHITECTURE REFERENCE'));
    expect(solutionCall).toBeDefined();
    expect(solutionCall!.user).toContain('event-driven microservices with Kafka');
  }, 30_000);

  it('architecture query fires for all use-cases that include proposedSolution', async () => {
    for (const useCase of ['linkedin', 'upwork', 'small', 'legacy'] as ProposalInput['useCase'][]) {
      mockQueryRAG.mockReset();
      mockQueryRAG.mockResolvedValue(EMPTY);
      await generateProposalData(makeInput(useCase), minimalKb as never);
      const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
      const techQuery = calls.find(([q]) => q.includes('architecture pattern'));
      expect(techQuery).toBeDefined();
    }
  }, 60_000);
});

// ─── Checklist item 2: §8 whyUs receives About Phavella RAG ──────────────────

describe('§8 About Phavella — team voice RAG injection', () => {
  it('queryRAG is called with team bio query for whyUs', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    const aboutCall = calls.find(([q]) => q.includes('team bio'));
    expect(aboutCall).toBeDefined();
    expect(aboutCall![1]).toBe('pk'); // userOwner passed correctly
  }, 30_000);

  it('About Phavella RAG passages appear in the whyUs generate() call', async () => {
    mockQueryRAG.mockImplementation((query: string) => {
      if (query.includes('team bio')) {
        return Promise.resolve({ passages: ABOUT_PASSAGES, query, fromCache: false });
      }
      return Promise.resolve(EMPTY);
    });

    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { system: string; user: string });
    const whyUsCall = calls.find((c) => c.user.includes('ABOUT PHAVELLA'));
    expect(whyUsCall).toBeDefined();
    expect(whyUsCall!.user).toContain('40% throughput improvement');
  }, 30_000);

  it('About Phavella RAG fires for legacy (whyUs in template)', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(true);
  }, 30_000);

  it('About Phavella RAG fires for linkedin (whyUs in template)', async () => {
    await generateProposalData(makeInput('linkedin'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(true);
  }, 30_000);

  it('About Phavella RAG does NOT fire for small (whyUs not in template)', async () => {
    await generateProposalData(makeInput('small'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(false);
  }, 30_000);

  it('About Phavella RAG does NOT fire for upwork (whyUs not in template)', async () => {
    await generateProposalData(makeInput('upwork'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    expect(calls.some(([q]) => q.includes('team bio'))).toBe(false);
  }, 30_000);
});

// ─── Checklist item 3: §3 problemStatement receives opportunity proof RAG ─────

describe('§3 Opportunity Rationale — proof points RAG injection', () => {
  it('queryRAG is called with proof points query for problemStatement', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    const proofCall = calls.find(([q]) => q.includes('proof points'));
    expect(proofCall).toBeDefined();
    expect(proofCall![0]).toContain('automation ROI');
  }, 30_000);

  it('proof RAG passages appear in the problemStatement generate() call', async () => {
    mockQueryRAG.mockImplementation((query: string) => {
      if (query.includes('proof points')) {
        return Promise.resolve({ passages: PROOF_PASSAGES, query, fromCache: false });
      }
      return Promise.resolve(EMPTY);
    });

    await generateProposalData(makeInput('legacy'), minimalKb as never);

    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { system: string; user: string });
    const probCall = calls.find((c) => c.user.includes('OPPORTUNITY PROOF POINTS'));
    expect(probCall).toBeDefined();
    expect(probCall!.user).toContain('22% for a 500-truck fleet');
  }, 30_000);
});

// ─── Checklist item 4: Graceful degradation (RAG off) ────────────────────────

describe('Graceful degradation — RAG returns empty', () => {
  it('proposal still generates when all RAG queries return empty passages', async () => {
    // queryRAG already returns EMPTY by default
    const data = await generateProposalData(makeInput('legacy'), minimalKb as never);
    expect(data.proposal.projectTitle).toBe('AI for Acme Logistics');
    expect(data.executiveSummary).toBeDefined();
    expect(data.problemStatement).toBeDefined();
    expect(data.proposedSolution).toBeDefined();
    expect(data.whyUs).toBeDefined();
  }, 30_000);

  it('proposal still generates when queryRAG throws', async () => {
    mockQueryRAG.mockRejectedValue(new Error('RAG unreachable'));
    const data = await generateProposalData(makeInput('legacy'), minimalKb as never);
    expect(data.proposal.projectTitle).toBe('AI for Acme Logistics');
    expect(data.proposedSolution).toBeDefined();
  }, 30_000);

  it('generate() is still called for RAG-enabled sections even when RAG is empty', async () => {
    // Empty RAG → withRagContext is a no-op → generate() still fires with original prompt
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { user: string });
    // proposedSolution, problemStatement, whyUs must all have been called
    const hasSolution = calls.some((c) => c.user.includes('PROPOSED SOLUTION'));
    const hasProblem = calls.some((c) => c.user.includes('UNDERSTANDING THE CHALLENGE'));
    const hasWhyUs = calls.some((c) => c.user.includes('WHY CHOOSE US'));
    expect(hasSolution).toBe(true);
    expect(hasProblem).toBe(true);
    expect(hasWhyUs).toBe(true);
  }, 30_000);

  it('no RAG context block in generate() user message when passages are empty', async () => {
    await generateProposalData(makeInput('legacy'), minimalKb as never);
    const calls = mockGenerate.mock.calls.map((c: unknown[]) => c[0] as { user: string });
    // None of the calls should contain the RAG reference block
    const hasRagBlock = calls.some((c) => c.user.includes('=== REFERENCE MATERIAL'));
    expect(hasRagBlock).toBe(false);
  }, 30_000);
});

// ─── query scoping: userOwner is passed correctly ─────────────────────────────

describe('userOwner scoping', () => {
  it('passes userOwner="pk" to all RAG queries', async () => {
    await generateProposalData(makeInput('legacy', { userOwner: 'pk' }), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    for (const [, owner] of calls) {
      expect(owner).toBe('pk');
    }
  }, 30_000);

  it('passes userOwner="aj" to all RAG queries when set', async () => {
    await generateProposalData(makeInput('legacy', { userOwner: 'aj' }), minimalKb as never);
    const calls = mockQueryRAG.mock.calls as [string, string, ...unknown[]][];
    for (const [, owner] of calls) {
      expect(owner).toBe('aj');
    }
  }, 30_000);
});
