/**
 * Step 13 — RAG client for authentic voice.
 *
 * Queries the Phavella expertise RAG (https://par1kahl.kronus.tech) so that
 * proposals pull from PK's actual architecture patterns, team voice, and
 * proof points instead of generic LLM invention.
 *
 * Caches responses for 24 h — queries repeat heavily across proposals
 * (same industry, same userOwner) and the RAG corpus changes infrequently.
 *
 * Degrades gracefully: any network error → empty passages → section still
 * generates from the LLM base prompt alone, no exception propagation.
 */

import type { GenerateOptions } from '@/lib/ai/ai-client';

const RAG_BASE_URL = (process.env.RAG_URL ?? 'https://par1kahl.kronus.tech').replace(/\/+$/, '');
const FETCH_TIMEOUT_MS = 10_000;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 h

// ─── public types ─────────────────────────────────────────────────────────────

export interface RagPassage {
  text: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RagResult {
  passages: RagPassage[];
  query: string;
  fromCache: boolean;
}

export const EMPTY_RAG: RagResult = { passages: [], query: '', fromCache: false };

// ─── in-process 24 h cache ────────────────────────────────────────────────────

interface CacheEntry {
  result: RagResult;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry>();

function cacheKey(query: string, userOwner: string, topK: number): string {
  return `${query}::${userOwner}::${topK}`;
}

/** Clears the in-process cache — used in tests. */
export function clearRagCache(): void {
  _cache.clear();
}

// ─── response parser (flexible — handles different RAG API shapes) ─────────────

function parsePassages(body: unknown): RagPassage[] {
  if (!body || typeof body !== 'object') return [];

  // Shape A: { passages: [...] }
  const asObj = body as Record<string, unknown>;
  const rawList =
    Array.isArray(asObj['passages']) ? asObj['passages'] :
    Array.isArray(asObj['results']) ? asObj['results'] :
    Array.isArray(asObj['hits']) ? asObj['hits'] :
    Array.isArray(body) ? body :
    [];

  return (rawList as unknown[]).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const p = item as Record<string, unknown>;
    const text =
      typeof p['text'] === 'string' ? p['text'] :
      typeof p['content'] === 'string' ? p['content'] :
      typeof p['passage'] === 'string' ? p['passage'] : '';
    if (!text.trim()) return [];
    const score =
      typeof p['score'] === 'number' ? p['score'] :
      typeof p['relevance'] === 'number' ? p['relevance'] : 0;
    const metadata =
      p['metadata'] && typeof p['metadata'] === 'object'
        ? (p['metadata'] as Record<string, unknown>)
        : undefined;
    return [{ text, score, metadata }];
  });
}

// ─── network call ─────────────────────────────────────────────────────────────

async function fetchPassages(
  query: string,
  userOwner: string,
  topK: number,
): Promise<RagPassage[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${RAG_BASE_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, user_owner: userOwner, top_k: topK }),
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const body = await res.json().catch(() => null);
    return parsePassages(body);
  } finally {
    clearTimeout(timer);
  }
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Query the RAG for relevant passages.
 *
 * @param query     Natural-language retrieval query.
 * @param userOwner Owner scope — "pk" or "aj". Used as a retrieval filter so
 *                  each user's corpus stays separate. Silently ignored when the
 *                  RAG backend does not support per-user scoping yet.
 * @param topK      Max passages to return (default 5).
 */
export async function queryRAG(
  query: string,
  userOwner: string,
  topK: number = 5,
): Promise<RagResult> {
  if (!query.trim()) return EMPTY_RAG;

  const key = cacheKey(query, userOwner, topK);
  const cached = _cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.result, fromCache: true };
  }

  let passages: RagPassage[];
  try {
    passages = await fetchPassages(query, userOwner, topK);
  } catch {
    // Network error, timeout, or parse failure — degrade gracefully
    passages = [];
  }

  const result: RagResult = { passages, query, fromCache: false };
  _cache.set(key, { result, expiresAt: Date.now() + TTL_MS });
  return result;
}

// ─── prompt injection helper ──────────────────────────────────────────────────

/**
 * Appends RAG passages as a reference block in the section's user message.
 * When passages is empty, opts is returned unchanged (graceful degradation).
 */
export function withRagContext(
  opts: GenerateOptions,
  passages: RagPassage[],
  label = 'REFERENCE MATERIAL',
): GenerateOptions {
  if (!passages.length) return opts;

  const block = [
    `\n=== ${label} (authentic voice — use verbatim where relevant, do not contradict) ===`,
    ...passages.map((p, i) => `[${i + 1}] ${p.score > 0 ? `(relevance ${p.score.toFixed(2)}) ` : ''}${p.text.trim()}`),
    '=== END REFERENCE MATERIAL ===',
  ].join('\n');

  return { ...opts, user: opts.user + block };
}

/**
 * Format passages into a readable plain-text block (for debugging / logging).
 */
export function formatPassages(passages: RagPassage[]): string {
  if (!passages.length) return '(no RAG results)';
  return passages.map((p, i) => `[${i + 1}] ${p.text}`).join('\n\n');
}
