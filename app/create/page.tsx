'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChipGroup } from '@/components/ui/ChipGroup';
import type { ProposalInput } from '@/lib/ai/types';

const INDUSTRIES = ['FinTech', 'Banking', 'Healthcare', 'Insurance', 'E-Commerce', 'Retail', 'Manufacturing', 'Telecom', 'Education', 'Energy', 'Government', 'Other'];
const TECH_OPTIONS = ['Next.js', 'React', 'Node.js', 'Python', 'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'AWS', 'GCP', 'Azure', 'Kubernetes', 'Claude', 'OpenAI', 'LiveKit', 'Deepgram', 'LangChain', 'Pinecone'];
const COMPLIANCE = ['SOC2', 'HIPAA', 'GDPR', 'ISO27001', 'RBI', 'DPDPA', 'PCI-DSS', 'FedRAMP'];
const METHODOLOGIES = ['Agile', 'Waterfall', 'Hybrid'];
const PRICING_MODELS = ['Fixed Price', 'Time & Materials', 'Hybrid', 'Outcome-Linked'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD'];

type Step = 0 | 1 | 2 | 3;

const STEP_LABELS = ['Project Brief', 'Requirements', 'Customization', 'Generate'];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [input, setInput] = useState<ProposalInput>({
    projectTitle: '',
    clientName: '',
    clientIndustry: 'FinTech',
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
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kbSummary, setKbSummary] = useState<{ projects: number; team: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/knowledge-base/projects').then((r) => r.json()),
      fetch('/api/knowledge-base/team').then((r) => r.json()),
    ])
      .then(([projects, team]) => setKbSummary({ projects: projects.length, team: team.length }))
      .catch(() => setKbSummary({ projects: 0, team: 0 }));
  }, []);

  function set<K extends keyof ProposalInput>(key: K, value: ProposalInput[K]) {
    setInput((p) => ({ ...p, [key]: value }));
  }

  function canProceed(s: Step): boolean {
    if (s === 0) return Boolean(input.projectTitle && input.clientName && input.projectPrompt.trim().length > 20);
    return true;
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'generation failed');
      router.push(body.previewUrl ?? `/proposals/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGenerating(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Create a New Proposal</h1>
          <p>Four quick steps — brief, requirements, customization, generate.</p>
        </div>
      </div>

      <div className="wizard">
        <div className="wizard-steps">
          {STEP_LABELS.map((label, i) => (
            <div
              key={i}
              className={`wizard-step ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}
            >
              <span className="num"><span className="num-value">{i + 1}</span></span>
              {label}
            </div>
          ))}
        </div>

        <div className="wizard-content">
          {error && <div className="alert alert-danger">{error}</div>}

          {step === 0 && (
            <div>
              <h2>Project Brief</h2>
              <p className="text-muted mb-lg">
                Tell us what you&apos;re proposing. The clearer your brief, the better the AI output.
              </p>

              <div className="field">
                <label>Project Title</label>
                <input
                  value={input.projectTitle}
                  onChange={(e) => set('projectTitle', e.target.value)}
                  placeholder="e.g. AI-Powered Customer Service Intelligence Platform"
                  maxLength={120}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Client Name</label>
                  <input
                    value={input.clientName}
                    onChange={(e) => set('clientName', e.target.value)}
                    placeholder="e.g. Meridian Bank"
                  />
                </div>
                <div className="field">
                  <label>Client Industry</label>
                  <select
                    value={input.clientIndustry}
                    onChange={(e) => set('clientIndustry', e.target.value)}
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Project Description <span style={{ color: 'var(--c-danger)' }}>*</span></label>
                <textarea
                  value={input.projectPrompt}
                  onChange={(e) => set('projectPrompt', e.target.value)}
                  rows={8}
                  placeholder="Describe what you're building, for whom, and why. E.g. 'Build an AI-powered customer service chatbot for a major Indian bank with 50 million customers. The bank currently handles 2.1M monthly contacts manually with a 14% repeat-contact rate. Goal: reduce tier-1 cost-to-serve by 45% with voice/chat AI agents operating in Hindi, English, and regional languages.'"
                />
                <span className="hint">At least 20 characters. The more context, the sharper the proposal.</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2>Requirements</h2>
              <p className="text-muted mb-lg">Commercial, timeline, technical, and compliance constraints.</p>

              <div className="field-row">
                <div className="field">
                  <label>Currency</label>
                  <select
                    value={input.currency}
                    onChange={(e) => set('currency', e.target.value)}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Budget Range</label>
                  <div className="field-row" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      value={input.budgetMin ?? ''}
                      onChange={(e) => set('budgetMin', Number(e.target.value) || undefined)}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={input.budgetMax ?? ''}
                      onChange={(e) => set('budgetMax', Number(e.target.value) || undefined)}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Timeline (weeks)</label>
                  <input
                    type="number"
                    value={input.timelineWeeks ?? ''}
                    onChange={(e) => set('timelineWeeks', Number(e.target.value) || undefined)}
                    min={4}
                    max={104}
                  />
                </div>
                <div className="field">
                  <label>Team Size Preference</label>
                  <input
                    type="number"
                    value={input.teamSizePreference ?? ''}
                    onChange={(e) => set('teamSizePreference', Number(e.target.value) || undefined)}
                    min={1}
                    max={50}
                  />
                </div>
              </div>

              <div className="field">
                <label>Preferred Technologies <span className="hint">(optional, multi-select)</span></label>
                <ChipGroup
                  options={TECH_OPTIONS}
                  selected={input.preferredTechnologies ?? []}
                  onChange={(next) => set('preferredTechnologies', next)}
                />
              </div>

              <div className="field">
                <label>Compliance Requirements</label>
                <ChipGroup
                  options={COMPLIANCE}
                  selected={(input.compliance ?? []) as string[]}
                  onChange={(next) => set('compliance', next as any)}
                />
              </div>

              <div className="field">
                <label>Methodology Preference</label>
                <ChipGroup
                  options={METHODOLOGIES}
                  selected={input.methodology ? [input.methodology] : []}
                  onChange={(next) => set('methodology', (next[0] as any) ?? 'Agile')}
                  multi={false}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Customization</h2>
              <p className="text-muted mb-lg">Shape the final deliverable — pricing model, KB inclusions, custom clauses.</p>

              <div className="field">
                <label>Pricing Model</label>
                <ChipGroup
                  options={PRICING_MODELS}
                  selected={input.pricingModel ? [input.pricingModel] : []}
                  onChange={(next) => set('pricingModel', (next[0] as any) ?? 'Fixed Price')}
                  multi={false}
                />
              </div>

              <div className="card-hairline" />

              <h3 style={{ marginBottom: 8 }}>Knowledge Base Inclusions</h3>
              {kbSummary && (
                <p className="text-small text-muted mb-md">
                  You have <strong>{kbSummary.projects}</strong> case studies and <strong>{kbSummary.team}</strong> team members in your KB.
                </p>
              )}
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="inc-cs"
                  checked={input.includeCaseStudies !== false}
                  onChange={(e) => set('includeCaseStudies', e.target.checked)}
                />
                <label htmlFor="inc-cs">Include relevant case studies from Knowledge Base (AI auto-selects)</label>
              </div>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="inc-team"
                  checked={input.includeTeamBios !== false}
                  onChange={(e) => set('includeTeamBios', e.target.checked)}
                />
                <label htmlFor="inc-team">Include team bios from Knowledge Base (AI auto-selects relevant members)</label>
              </div>

              <div className="card-hairline" />

              <div className="field">
                <label>Custom Terms & Conditions <span className="hint">(optional — otherwise AI-generated)</span></label>
                <textarea
                  value={input.customTerms ?? ''}
                  onChange={(e) => set('customTerms', e.target.value)}
                  rows={4}
                  placeholder="Any specific commercial clauses you'd like included verbatim..."
                />
              </div>

              <div className="field">
                <label>Proposal Version</label>
                <input
                  value={input.proposalVersion ?? '1.0'}
                  onChange={(e) => set('proposalVersion', e.target.value)}
                  placeholder="1.0"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>Ready to Generate</h2>
              <p className="text-muted mb-lg">
                We&apos;ll generate ~14 sections in parallel, render charts, and produce the final PDF. Typical runtime is 30–60 seconds with an AI key.
              </p>

              <div className="card" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div className="row-between mb-md">
                  <h3 style={{ fontSize: 16, margin: 0 }}>Summary</h3>
                  <span className="badge badge-accent">{input.clientIndustry}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Project:</strong><br />{input.projectTitle || <em className="text-muted">not set</em>}</div>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Client:</strong><br />{input.clientName || <em className="text-muted">not set</em>}</div>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Budget:</strong><br />{input.currency} {(input.budgetMin ?? 0).toLocaleString()} — {(input.budgetMax ?? 0).toLocaleString()}</div>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Timeline:</strong><br />{input.timelineWeeks} weeks</div>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Methodology:</strong><br />{input.methodology}</div>
                  <div><strong style={{ color: 'var(--c-primary)' }}>Pricing:</strong><br />{input.pricingModel}</div>
                </div>
                {(input.preferredTechnologies?.length ?? 0) > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <strong style={{ color: 'var(--c-primary)', fontSize: 13, display: 'block', marginBottom: 6 }}>Technologies:</strong>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {input.preferredTechnologies!.map((t) => <span key={t} className="badge badge-muted">{t}</span>)}
                    </div>
                  </div>
                )}
                {(input.compliance?.length ?? 0) > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ color: 'var(--c-primary)', fontSize: 13, display: 'block', marginBottom: 6 }}>Compliance:</strong>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {input.compliance!.map((c) => <span key={c} className="badge badge-success">{c}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {generating && (
                <div className="alert alert-info mt-lg">
                  <span className="spinner" style={{ marginRight: 8 }}></span>
                  <strong>Generating your proposal...</strong> AI is writing each section, rendering charts, and producing the PDF. Please wait — this takes 30–60 seconds.
                </div>
              )}
            </div>
          )}

          <div className="wizard-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0 || generating}
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
                disabled={!canProceed(step)}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-accent btn-lg"
                onClick={handleGenerate}
                disabled={generating || !canProceed(0)}
              >
                {generating ? <><span className="spinner" /> Generating...</> : '✦ Generate Proposal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
