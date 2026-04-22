/**
 * Client for the scraper's /api/v1/enriched/{analysis_id} endpoint.
 *
 * Pydantic model source of truth: website_scraper/app/schemas/enriched.py.
 * The TypeScript `EnrichedCompany` interface in lib/ai/types.ts must stay in
 * lockstep with that Pydantic model.
 *
 * Step 3 of the pipeline upgrade wires only this fetch helper — actual use in
 * proposal generation lands in Step 5.
 */

import type { EnrichedCompany } from '@/lib/ai/types';

const DEFAULT_BASE_URL = 'http://localhost:8000';

function resolveBaseUrl(override?: string): string {
  const raw = override ?? process.env.SCRAPER_BASE_URL ?? DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, '');
}

export async function fetchEnrichedCompany(
  id: string,
  baseUrl?: string,
): Promise<EnrichedCompany> {
  if (!id) throw new Error('fetchEnrichedCompany: id is required');

  const url = `${resolveBaseUrl(baseUrl)}/api/v1/enriched/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `fetchEnrichedCompany: ${url} responded ${res.status}${body ? ` — ${body}` : ''}`,
    );
  }

  return (await res.json()) as EnrichedCompany;
}
