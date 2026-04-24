/**
 * Step 13 — RAG client unit tests.
 *
 * Strategy: mock global fetch so no real network calls are made.
 * Tests cover:
 *   - Happy path: passages parsed from all supported response shapes
 *   - 24h cache: second call with same args hits cache, zero extra fetches
 *   - Cache TTL: expired entries trigger a fresh fetch
 *   - Graceful degradation: network error / timeout / non-OK → empty passages
 *   - Empty query guard: blank string returns EMPTY_RAG immediately
 *   - withRagContext injection: appended to user message; no-op when empty
 *   - formatPassages: readable output
 */

import { queryRAG, withRagContext, formatPassages, clearRagCache, EMPTY_RAG } from '@/lib/rag/client';
import type { RagPassage } from '@/lib/rag/client';
import type { GenerateOptions } from '@/lib/ai/ai-client';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeFetch(body: unknown, status = 200): jest.Mock {
  return jest.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

const SAMPLE_PASSAGES_BODY = {
  passages: [
    { text: 'Use event-driven microservices with Kafka for real-time logistics pipelines.', score: 0.94 },
    { text: 'FastAPI + async SQLAlchemy outperforms Django ORM by 3x at p99.', score: 0.88 },
    { text: 'PK built a TMS integration for SwiftHaul in 8 weeks using Oracle OTM REST API.', score: 0.81 },
  ],
};

const BASE_OPTS: GenerateOptions = {
  system: 'You are a senior consultant.',
  user: 'Write the proposed solution section.',
  jsonMode: true,
};

const realFetch = global.fetch;

beforeEach(() => {
  clearRagCache();
  jest.useFakeTimers();
});

afterEach(() => {
  global.fetch = realFetch;
  jest.useRealTimers();
});

// ─── queryRAG — happy path ────────────────────────────────────────────────────

describe('queryRAG — response parsing', () => {
  it('parses { passages: [...] } shape', async () => {
    global.fetch = makeFetch(SAMPLE_PASSAGES_BODY);
    const result = await queryRAG('architecture pattern for logistics', 'pk');
    expect(result.passages).toHaveLength(3);
    expect(result.passages[0]!.score).toBe(0.94);
    expect(result.passages[0]!.text).toContain('Kafka');
    expect(result.fromCache).toBe(false);
  });

  it('parses { results: [...] } shape (alternate field name)', async () => {
    global.fetch = makeFetch({ results: SAMPLE_PASSAGES_BODY.passages });
    const result = await queryRAG('team bio pk', 'pk');
    expect(result.passages).toHaveLength(3);
  });

  it('parses { hits: [...] } shape (ES style)', async () => {
    global.fetch = makeFetch({ hits: SAMPLE_PASSAGES_BODY.passages });
    const result = await queryRAG('proof points', 'pk');
    expect(result.passages).toHaveLength(3);
  });

  it('parses bare array response', async () => {
    global.fetch = makeFetch(SAMPLE_PASSAGES_BODY.passages);
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toHaveLength(3);
  });

  it('parses "content" field alias for text', async () => {
    global.fetch = makeFetch({ passages: [{ content: 'Alternative field.', score: 0.7 }] });
    const result = await queryRAG('test', 'pk');
    expect(result.passages[0]!.text).toBe('Alternative field.');
  });

  it('sends correct POST body with user_owner and top_k', async () => {
    const spy = makeFetch(SAMPLE_PASSAGES_BODY);
    global.fetch = spy;
    await queryRAG('architecture pattern for fintech', 'aj', 3);
    const [, init] = spy.mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.query).toBe('architecture pattern for fintech');
    expect(body.user_owner).toBe('aj');
    expect(body.top_k).toBe(3);
  });

  it('posts to /query path on RAG_URL', async () => {
    const spy = makeFetch(SAMPLE_PASSAGES_BODY);
    global.fetch = spy;
    await queryRAG('test', 'pk');
    const [url] = spy.mock.calls[0]!;
    expect(url as string).toMatch(/\/query$/);
  });

  it('stores query in result', async () => {
    global.fetch = makeFetch(SAMPLE_PASSAGES_BODY);
    const result = await queryRAG('some query', 'pk');
    expect(result.query).toBe('some query');
  });
});

// ─── queryRAG — 24h cache ────────────────────────────────────────────────────

describe('queryRAG — 24 h cache', () => {
  it('second call with same args returns cached result without extra fetch', async () => {
    const spy = makeFetch(SAMPLE_PASSAGES_BODY);
    global.fetch = spy;

    const first = await queryRAG('architecture pattern', 'pk');
    const second = await queryRAG('architecture pattern', 'pk');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(second.passages).toHaveLength(first.passages.length);
  });

  it('different topK → separate cache entries', async () => {
    global.fetch = makeFetch(SAMPLE_PASSAGES_BODY);
    await queryRAG('test', 'pk', 5);
    await queryRAG('test', 'pk', 3);
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(2);
  });

  it('different userOwner → separate cache entries', async () => {
    global.fetch = makeFetch(SAMPLE_PASSAGES_BODY);
    await queryRAG('test', 'pk');
    await queryRAG('test', 'aj');
    expect((global.fetch as jest.Mock).mock.calls).toHaveLength(2);
  });

  it('expired TTL (>24h) forces a fresh fetch', async () => {
    const spy = makeFetch(SAMPLE_PASSAGES_BODY);
    global.fetch = spy;

    await queryRAG('test', 'pk');
    // Advance time past 24h + 1 second
    jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000);
    await queryRAG('test', 'pk');

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('clearRagCache resets all entries', async () => {
    const spy = makeFetch(SAMPLE_PASSAGES_BODY);
    global.fetch = spy;

    await queryRAG('test', 'pk');
    clearRagCache();
    await queryRAG('test', 'pk');

    expect(spy).toHaveBeenCalledTimes(2);
  });
});

// ─── queryRAG — graceful degradation ─────────────────────────────────────────

describe('queryRAG — graceful degradation', () => {
  it('network error → returns empty passages (no throw)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toEqual([]);
  });

  it('non-OK status (500) → returns empty passages', async () => {
    global.fetch = makeFetch({ error: 'Internal Server Error' }, 500);
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toEqual([]);
  });

  it('non-OK status (404) → returns empty passages', async () => {
    global.fetch = makeFetch({ error: 'Not Found' }, 404);
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toEqual([]);
  });

  it('malformed JSON response → returns empty passages', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('bad json'); },
    })) as unknown as typeof fetch;
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toEqual([]);
  });

  it('empty query string → returns EMPTY_RAG immediately (no fetch)', async () => {
    const spy = jest.fn();
    global.fetch = spy;
    const result = await queryRAG('', 'pk');
    expect(result).toEqual(EMPTY_RAG);
    expect(spy).not.toHaveBeenCalled();
  });

  it('whitespace-only query → returns EMPTY_RAG immediately (no fetch)', async () => {
    const spy = jest.fn();
    global.fetch = spy;
    await queryRAG('   ', 'pk');
    expect(spy).not.toHaveBeenCalled();
  });

  it('response with no recognisable passage field → empty passages', async () => {
    global.fetch = makeFetch({ unknown_field: 'something' });
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toEqual([]);
  });

  it('passages with blank text are dropped', async () => {
    global.fetch = makeFetch({
      passages: [
        { text: '', score: 0.9 },
        { text: '   ', score: 0.8 },
        { text: 'Valid passage.', score: 0.7 },
      ],
    });
    const result = await queryRAG('test', 'pk');
    expect(result.passages).toHaveLength(1);
    expect(result.passages[0]!.text).toBe('Valid passage.');
  });
});

// ─── withRagContext ───────────────────────────────────────────────────────────

describe('withRagContext', () => {
  it('appends passage block to user message', () => {
    const passages: RagPassage[] = [
      { text: 'PK delivered a FastAPI TMS integration in 8 weeks.', score: 0.92 },
    ];
    const result = withRagContext(BASE_OPTS, passages);
    expect(result.user).toContain(BASE_OPTS.user);
    expect(result.user).toContain('REFERENCE MATERIAL');
    expect(result.user).toContain('PK delivered a FastAPI TMS integration');
    expect(result.user).toContain('0.92');
  });

  it('uses custom label when provided', () => {
    const passages: RagPassage[] = [{ text: 'Test passage.', score: 0.8 }];
    const result = withRagContext(BASE_OPTS, passages, 'ARCHITECTURE REFERENCE');
    expect(result.user).toContain('ARCHITECTURE REFERENCE');
  });

  it('returns opts unchanged when passages is empty (graceful no-op)', () => {
    const result = withRagContext(BASE_OPTS, []);
    expect(result).toBe(BASE_OPTS);
  });

  it('does not modify system message', () => {
    const passages: RagPassage[] = [{ text: 'Test.', score: 0.9 }];
    const result = withRagContext(BASE_OPTS, passages);
    expect(result.system).toBe(BASE_OPTS.system);
  });

  it('handles score=0 without crashing (score not shown when zero)', () => {
    const passages: RagPassage[] = [{ text: 'Passage without score.', score: 0 }];
    const result = withRagContext(BASE_OPTS, passages);
    expect(result.user).toContain('Passage without score.');
    expect(result.user).not.toContain('relevance 0.00');
  });

  it('appends closing marker', () => {
    const passages: RagPassage[] = [{ text: 'Test.', score: 0.9 }];
    const result = withRagContext(BASE_OPTS, passages);
    expect(result.user).toContain('END REFERENCE MATERIAL');
  });
});

// ─── formatPassages ───────────────────────────────────────────────────────────

describe('formatPassages', () => {
  it('formats passages as numbered list', () => {
    const passages: RagPassage[] = [
      { text: 'First passage.', score: 0.9 },
      { text: 'Second passage.', score: 0.8 },
    ];
    const out = formatPassages(passages);
    expect(out).toContain('[1] First passage.');
    expect(out).toContain('[2] Second passage.');
  });

  it('returns "(no RAG results)" for empty array', () => {
    expect(formatPassages([])).toBe('(no RAG results)');
  });
});
