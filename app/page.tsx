import Link from 'next/link';
import { listProposals } from '@/lib/proposals/store';
import { getKnowledgeBase } from '@/lib/knowledge-base/manager';
import { aiProviderName, hasAnyAiProvider } from '@/lib/ai/ai-client';

export const dynamic = 'force-dynamic';

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dashboard() {
  const proposals = listProposals();
  const kb = getKnowledgeBase();
  const aiReady = hasAnyAiProvider();

  return (
    <>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Dashboard</h1>
          <p>Generate and manage enterprise-grade proposals — powered by AI and your Knowledge Base.</p>
        </div>
        <Link href="/create" className="btn btn-primary btn-lg">
          + New Proposal
        </Link>
      </div>

      {!aiReady && (
        <div className="alert alert-warning">
          <strong>No AI provider configured.</strong> Set <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code> in your <code>.env.local</code> to enable AI-generated content.
          Without a key, proposals are generated using deterministic template fallbacks.
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Proposals</div>
          <div className="stat-value">{proposals.length}</div>
          <div className="stat-foot">Total generated</div>
        </div>
        <div className="stat">
          <div className="stat-label">Case Studies</div>
          <div className="stat-value">{kb.projects.length}</div>
          <div className="stat-foot">In Knowledge Base</div>
        </div>
        <div className="stat">
          <div className="stat-label">Team Members</div>
          <div className="stat-value">{kb.team.length}</div>
          <div className="stat-foot">Available to assign</div>
        </div>
        <div className="stat">
          <div className="stat-label">AI Provider</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{aiProviderName().split(' ')[0]}</div>
          <div className="stat-foot" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {aiReady ? aiProviderName().replace(/^[^(]+/, '').replace(/[()]/g, '') || 'Live' : 'Fallback only'}
          </div>
        </div>
      </div>

      <div className="row-between mb-md">
        <h2>Recent Proposals</h2>
        {proposals.length > 0 && (
          <span className="text-small text-muted">
            {proposals.length} proposal{proposals.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="empty">
          <h3>No proposals yet</h3>
          <p>Create your first enterprise proposal in under 60 seconds.</p>
          <Link href="/create" className="btn btn-primary mt-md" style={{ marginTop: 16 }}>
            Start New Proposal
          </Link>
        </div>
      ) : (
        <div className="proposal-list">
          {proposals.map((p) => (
            <Link key={p.id} href={`/proposals/${p.id}`} className="proposal-card">
              <div className="row-between">
                <span className="badge badge-accent">{p.clientIndustry || 'General'}</span>
                <span className="text-small text-muted">{formatRelativeTime(p.createdAt)}</span>
              </div>
              <h3>{p.projectTitle}</h3>
              <div className="meta">for {p.clientName}</div>
              <div className="foot">
                <span>{formatSize(p.sizeBytes)}</span>
                <span className="badge badge-success">{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
