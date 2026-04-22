/**
 * Step 5 — generate-proposal hydrates from EnrichedCompany, respects the
 * approval gate, and still honours the textarea path for linkedin/upwork.
 */

import type { EnrichedCompany } from '@/lib/ai/types';

// Mock the scraper client BEFORE importing the orchestrator so the module
// captures the mocked export.
jest.mock('@/lib/rag/scraper-client', () => ({
  __esModule: true,
  fetchEnrichedCompany: jest.fn(),
}));
// AI client returns "no providers" so every section falls back to deterministic
// templates — no network, no cost, and the test stays fast.
jest.mock('@/lib/ai/ai-client', () => ({
  __esModule: true,
  generate: jest.fn(async () => ({ parsed: {}, raw: '{}' })),
  hasAnyAiProvider: jest.fn(() => false),
  aiProviderName: jest.fn(() => 'test'),
}));

import { fetchEnrichedCompany } from '@/lib/rag/scraper-client';
import {
  generateProposalData,
  synthesizeProjectPromptFromEnriched,
} from '@/lib/ai/generate-proposal';
import type { ProposalInput } from '@/lib/ai/types';

const mockFetch = fetchEnrichedCompany as jest.MockedFunction<typeof fetchEnrichedCompany>;

function baseInput(overrides: Partial<ProposalInput> = {}): ProposalInput {
  return {
    useCase: 'legacy',
    userOwner: 'pk',
    projectTitle: 'AI Transformation for Acme',
    clientName: 'Acme Corp',
    clientIndustry: 'Manufacturing',
    projectPrompt: '',
    currency: 'USD',
    budgetMin: 150000,
    budgetMax: 250000,
    timelineWeeks: 20,
    teamSizePreference: 6,
    preferredTechnologies: [],
    compliance: [],
    methodology: 'Agile',
    pricingModel: 'Fixed Price',
    includeCaseStudies: true,
    includeTeamBios: true,
    proposalVersion: '1.0',
    ...overrides,
  };
}

function approvedEnriched(overrides: Partial<EnrichedCompany> = {}): EnrichedCompany {
  return {
    id: '22222222-2222-2222-2222-222222222222',
    url: 'https://acme.example.com',
    use_case: 'legacy',
    user_owner: 'pk',
    status: 'approved',
    company: {
      name: 'Acme Corp',
      industry: 'Manufacturing',
      sub_industry: 'Industrial Automation',
      size: { employees_band: '500-1000', revenue_band: '100M-500M' },
      hq_country: 'USA',
      other_locations: [],
      ownership: 'pe_backed',
      archetype: 'pe_growth',
      founded_year: 1987,
      recent_events: [{ date: '2024-11', type: 'acquisition', description: 'Acquired Foo' }],
    },
    signals: {
      tech_stack: ['SAP', 'Salesforce'],
      hiring_roles: ['Claims Adjuster'],
      pain_indicators: ['Manual intake'],
      compliance_footprint: ['SOC2'],
      digital_maturity_score: 0.62,
    },
    people: {
      primary: {
        name: 'Alice',
        role: 'COO',
        seniority: 'c_suite',
        linkedin_url: null,
        email: null,
        email_status: 'not_found',
        rationale: 'Owns ops',
        source: 'linkedin',
      },
      secondary: null,
      tertiary: null,
      all_discovered: [],
    },
    opportunities: [],
    confidence: { overall: 0.78, per_section: { profile: 1.0 } },
    created_at: '2026-04-22T10:00:00Z',
    approved_at: '2026-04-22T11:00:00Z',
    approved_by: 'pk',
    ...overrides,
  };
}

const minimalKb = {
  company: {
    name: 'Phavella',
    tagline: 'test',
    founded: 2022,
    headquarters: 'Mumbai',
    teamSize: 10,
    projectsDelivered: 5,
    industriesServed: ['FinTech'],
    mission: 'test',
    certifications: [],
    coreCompetencies: [],
    brandColors: { primary: '#000', secondary: '#111', accent: '#222' },
  },
  projects: [],
  team: [],
};

beforeEach(() => {
  mockFetch.mockReset();
});

describe('synthesizeProjectPromptFromEnriched', () => {
  it('mentions industry, size, archetype, signals, and people', () => {
    const text = synthesizeProjectPromptFromEnriched(approvedEnriched());
    expect(text).toContain('Acme Corp');
    expect(text).toContain('Manufacturing');
    expect(text).toContain('500-1000');
    expect(text).toContain('pe growth');
    expect(text).toContain('SAP');
    expect(text).toContain('Salesforce');
    expect(text).toContain('Claims Adjuster');
    expect(text).toContain('Alice');
    expect(text).toContain('Primary');
  });
});

describe('generateProposalData — EnrichedCompany path', () => {
  it('approved analysis → generation succeeds and projectPrompt is synthesised', async () => {
    mockFetch.mockResolvedValue(approvedEnriched());
    const input = baseInput({
      useCase: 'legacy',
      enrichedCompanyId: '22222222-2222-2222-2222-222222222222',
      projectPrompt: '',
    });

    const data = await generateProposalData(input, minimalKb as never);

    expect(mockFetch).toHaveBeenCalledWith('22222222-2222-2222-2222-222222222222');
    expect(data.proposal.projectTitle).toBe('AI Transformation for Acme');
    // Fallback content should have been used (no AI provider) — proves the
    // synthesised projectPrompt flowed through to the section generators.
    expect(data.executiveSummary).toBeDefined();
    expect(data.problemStatement).toBeDefined();
  }, 30_000);

  it('pending_review analysis → throws the approval-gate error', async () => {
    mockFetch.mockResolvedValue(approvedEnriched({ status: 'pending_review' }));
    const input = baseInput({
      useCase: 'legacy',
      enrichedCompanyId: '22222222-2222-2222-2222-222222222222',
      projectPrompt: '',
    });

    await expect(generateProposalData(input, minimalKb as never)).rejects.toThrow(
      /Analysis pending review — approve in scraper UI first/,
    );
  });

  it('rejected analysis → throws the approval-gate error', async () => {
    mockFetch.mockResolvedValue(approvedEnriched({ status: 'rejected' }));
    const input = baseInput({
      useCase: 'legacy',
      enrichedCompanyId: '22222222-2222-2222-2222-222222222222',
    });

    await expect(generateProposalData(input, minimalKb as never)).rejects.toThrow(
      /Analysis pending review/,
    );
  });
});

describe('generateProposalData — textarea path (linkedin/upwork)', () => {
  it('no enrichedCompanyId → fetchEnrichedCompany is not called, original projectPrompt survives', async () => {
    const input = baseInput({
      useCase: 'linkedin',
      projectPrompt: 'Classic user-typed prompt',
    });

    const data = await generateProposalData(input, minimalKb as never);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(data.proposal.projectTitle).toBe('AI Transformation for Acme');
  }, 30_000);
});
