/**
 * Unified AI client.
 * Supports three providers, auto-routing to the first one configured:
 *   1. OpenRouter  (OPENROUTER_API_KEY) — OpenAI-compatible, any model catalog
 *   2. Anthropic   (ANTHROPIC_API_KEY)  — native Claude SDK
 *   3. OpenAI      (OPENAI_API_KEY)     — native OpenAI SDK
 *
 * All providers return structured JSON via explicit instruction + repair parsing.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
// OpenRouter model — pick any model from https://openrouter.ai/models
// Good defaults: anthropic/claude-sonnet-4.5, openai/gpt-4o-mini, google/gemini-2.5-pro
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4.5';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface GenerateOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  /** Attempt to parse response as JSON; coerces stringified arrays/objects. */
  jsonMode?: boolean;
  /** Expected top-level JSON shape — used to validate result keys. Optional. */
  jsonSchemaHint?: string;
}

export interface AiResult<T = unknown> {
  text: string;
  parsed?: T;
  provider: 'anthropic' | 'openai' | 'openrouter' | 'fallback';
  modelId: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}

const openrouterKey = process.env.OPENROUTER_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

let _anthropic: Anthropic | null = null;
let _openai: OpenAI | null = null;
let _openrouter: OpenAI | null = null;

function getAnthropic(): Anthropic | null {
  if (!anthropicKey) return null;
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: anthropicKey });
  return _anthropic;
}

function getOpenAI(): OpenAI | null {
  if (!openaiKey) return null;
  if (!_openai) _openai = new OpenAI({ apiKey: openaiKey });
  return _openai;
}

function getOpenRouter(): OpenAI | null {
  if (!openrouterKey) return null;
  if (!_openrouter) {
    _openrouter = new OpenAI({
      apiKey: openrouterKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        // OpenRouter analytics headers — optional but help attribution
        'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'https://proposalforge.local',
        'X-Title': process.env.OPENROUTER_TITLE ?? 'Proposal Generator',
      },
    });
  }
  return _openrouter;
}

export function hasAnyAiProvider(): boolean {
  return Boolean(openrouterKey || anthropicKey || openaiKey);
}

export function aiProviderName(): string {
  if (openrouterKey) return `OpenRouter (${OPENROUTER_MODEL})`;
  if (anthropicKey) return `Anthropic Claude (${ANTHROPIC_MODEL})`;
  if (openaiKey) return `OpenAI (${OPENAI_MODEL})`;
  return 'Template fallback (no AI key)';
}

// ────────────────────────────────────────────────────────────
// JSON parse helpers
// ────────────────────────────────────────────────────────────
export function extractJson<T = unknown>(text: string): T | undefined {
  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    /* fall through */
  }
  // Strip markdown fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {
      /* fall through */
    }
  }
  // Bracket-slice fallback — find first { and last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  // Array variant
  const firstArr = text.indexOf('[');
  const lastArr = text.lastIndexOf(']');
  if (firstArr >= 0 && lastArr > firstArr) {
    try {
      return JSON.parse(text.slice(firstArr, lastArr + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  return undefined;
}

// ────────────────────────────────────────────────────────────
// Provider callers with retry
// ────────────────────────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Exponential back-off
      if (i < retries) await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
  throw lastErr;
}

async function callAnthropic(opts: GenerateOptions): Promise<AiResult> {
  const client = getAnthropic();
  if (!client) throw new Error('Anthropic client unavailable');

  const res = await withRetry(() =>
    client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens ?? 2500,
      temperature: opts.temperature ?? 0.6,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  );

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  return {
    text,
    parsed: opts.jsonMode ? extractJson(text) : undefined,
    provider: 'anthropic',
    modelId: ANTHROPIC_MODEL,
    usage: { inputTokens: res.usage?.input_tokens, outputTokens: res.usage?.output_tokens },
  };
}

async function callOpenAICompatible(
  client: OpenAI,
  model: string,
  opts: GenerateOptions,
  providerTag: 'openai' | 'openrouter',
): Promise<AiResult> {
  // Note: not all OpenRouter models support `response_format: json_object`.
  // We rely on extractJson() for repair, so we request JSON in the prompt itself
  // and only set response_format for the native OpenAI path where it's reliable.
  const useNativeJsonMode = providerTag === 'openai' && opts.jsonMode;

  const res = await withRetry(() =>
    client.chat.completions.create({
      model,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 2500,
      response_format: useNativeJsonMode ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  );

  const text = res.choices[0]?.message?.content ?? '';
  return {
    text,
    parsed: opts.jsonMode ? extractJson(text) : undefined,
    provider: providerTag,
    modelId: model,
    usage: { inputTokens: res.usage?.prompt_tokens, outputTokens: res.usage?.completion_tokens },
  };
}

// ────────────────────────────────────────────────────────────
// Public API — picks best available provider, with fallbacks
// ────────────────────────────────────────────────────────────
export async function generate<T = unknown>(opts: GenerateOptions): Promise<AiResult<T>> {
  // Priority: OpenRouter → Anthropic → OpenAI
  if (openrouterKey) {
    const client = getOpenRouter();
    if (client) {
      try {
        return (await callOpenAICompatible(client, OPENROUTER_MODEL, opts, 'openrouter')) as AiResult<T>;
      } catch (err) {
        console.warn('[ai] OpenRouter failed, attempting fallback:', err);
      }
    }
  }
  if (anthropicKey) {
    try {
      return (await callAnthropic(opts)) as AiResult<T>;
    } catch (err) {
      console.warn('[ai] Anthropic failed, attempting OpenAI fallback:', err);
    }
  }
  if (openaiKey) {
    const client = getOpenAI();
    if (client) return (await callOpenAICompatible(client, OPENAI_MODEL, opts, 'openai')) as AiResult<T>;
  }
  throw new Error(
    'No AI provider configured. Set OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY in .env.local.',
  );
}
