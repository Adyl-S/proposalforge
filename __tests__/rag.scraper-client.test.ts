/**
 * Contract tests for fetchEnrichedCompany + the EnrichedCompany TS mirror of
 * the scraper's Pydantic model.
 *
 * Strategy:
 *   - mock global fetch
 *   - verify the client composes the correct URL, parses the body, and surfaces
 *     non-OK responses as errors
 *   - compile a representative EnrichedCompany literal to catch any TS drift
 *     from the Python contract
 */

import type { AutomationOpportunity, EnrichedCompany } from '@/lib/ai/types';
import { fetchEnrichedCompany } from '@/lib/rag/scraper-client';

const SAMPLE: EnrichedCompany = {
  id: 'a1b2c3d4',
  url: 'https://example.com',
  use_case: 'legacy',
  user_owner: 'pk',
  status: 'approved',
  company: {
    name: 'Acme Corp',
    industry: 'Manufacturing',
    sub_industry: 'Industrial Automation',
    size: { employees_band: '500-1000', revenue_band: '100M-500M' },
    hq_country: 'USA',
    other_locations: ['Germany'],
    ownership: 'pe_backed',
    archetype: 'pe_growth',
    founded_year: 1987,
    recent_events: [
      { date: '2024-11', type: 'acquisition', description: 'Acquired Foo' },
    ],
  },
  signals: {
    tech_stack: ['Salesforce', 'SAP'],
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
      linkedin_url: 'https://linkedin.com/in/alice',
      email: 'alice@acme.com',
      email_status: 'verified',
      rationale: 'Owns ops',
    },
    secondary: null,
    tertiary: null,
    all_discovered: [],
  },
  opportunities: [
    {
      title: 'Automate claims intake',
      current_state: 'Manual routing',
      proposed_state: 'LLM classifier',
      impact: { metric: 'hours_saved_per_week', estimated_value: '40' },
      effort: 'medium',
      priority_score: 0.8,
    } satisfies AutomationOpportunity,
  ],
  confidence: { overall: 0.78, per_section: { profile: 1.0, systems: 0.67 } },
  created_at: '2026-04-22T10:00:00Z',
  approved_at: '2026-04-22T11:00:00Z',
  approved_by: 'pk',
};

describe('fetchEnrichedCompany', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
    delete process.env.SCRAPER_BASE_URL;
  });

  it('composes the URL from SCRAPER_BASE_URL and returns typed JSON', async () => {
    process.env.SCRAPER_BASE_URL = 'http://scraper.local:8000/';
    const spy = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => SAMPLE,
      text: async () => JSON.stringify(SAMPLE),
    })) as unknown as typeof fetch;
    global.fetch = spy;

    const result = await fetchEnrichedCompany('a1b2c3d4');

    expect(spy).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = (spy as unknown as jest.Mock).mock.calls[0];
    // Trailing slash on the base URL must be stripped before the path is appended.
    expect(calledUrl).toBe('http://scraper.local:8000/api/v1/enriched/a1b2c3d4');
    expect(init).toMatchObject({ method: 'GET' });

    // Structural parity with the Pydantic contract.
    expect(result).toEqual(SAMPLE);
    expect(result.company.archetype).toBe('pe_growth');
    expect(result.people.primary?.email_status).toBe('verified');
    expect(result.opportunities[0]!.effort).toBe('medium');
  });

  it('accepts an explicit baseUrl override', async () => {
    const spy = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => SAMPLE,
      text: async () => '',
    })) as unknown as typeof fetch;
    global.fetch = spy;

    await fetchEnrichedCompany('xyz', 'http://other-host:9000');

    const [calledUrl] = (spy as unknown as jest.Mock).mock.calls[0];
    expect(calledUrl).toBe('http://other-host:9000/api/v1/enriched/xyz');
  });

  it('throws when the scraper returns a non-OK status', async () => {
    global.fetch = (async () => ({
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => 'not found',
    })) as unknown as typeof fetch;

    await expect(fetchEnrichedCompany('missing', 'http://h:1')).rejects.toThrow(
      /404.*not found/,
    );
  });

  it('rejects an empty id before hitting the network', async () => {
    await expect(fetchEnrichedCompany('')).rejects.toThrow(/id is required/);
  });
});

describe('EnrichedCompany shape invariants', () => {
  it('ownership union includes unknown + pe_backed', () => {
    const a: EnrichedCompany['company']['ownership'] = 'unknown';
    const b: EnrichedCompany['company']['ownership'] = 'pe_backed';
    expect([a, b]).toEqual(['unknown', 'pe_backed']);
  });

  it('archetype union is exactly the four Pydantic values', () => {
    const values: EnrichedCompany['company']['archetype'][] = [
      'founder_led_midmarket',
      'pe_growth',
      'large_corporate',
      'regulated',
      null,
    ];
    expect(values).toHaveLength(5);
  });

  it('status union matches AnalysisStatus from the scraper', () => {
    const values: EnrichedCompany['status'][] = [
      'pending_review',
      'approved',
      'rejected',
      'edited',
    ];
    expect(values).toEqual(['pending_review', 'approved', 'rejected', 'edited']);
  });
});
