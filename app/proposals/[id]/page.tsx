import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProposalMeta } from '@/lib/proposals/store';
import { DeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const meta = getProposalMeta(params.id);
  if (!meta) notFound();

  const created = new Date(meta.createdAt);
  const sizeMb = (meta.sizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <>
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ marginBottom: 8 }}>
            <Link href="/" className="text-small text-muted">← Back to Dashboard</Link>
          </div>
          <h1>{meta.projectTitle}</h1>
          <p>
            Prepared for <strong style={{ color: 'var(--c-secondary)' }}>{meta.clientName}</strong>
            {' · '}
            <span>{meta.clientIndustry}</span>
            {' · '}
            <span>v{meta.version}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`/api/proposals/${params.id}/pdf?download=1`} className="btn btn-primary">⬇ Download PDF</a>
          <a href={`/api/proposals/${params.id}/pdf`} className="btn btn-ghost" target="_blank" rel="noopener">Open in New Tab</a>
          <DeleteButton id={params.id} />
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat-label">Created</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="stat-foot">{created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{meta.status}</div>
          <div className="stat-foot">Ready to send</div>
        </div>
        <div className="stat">
          <div className="stat-label">File Size</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{sizeMb} MB</div>
          <div className="stat-foot">PDF / A4</div>
        </div>
        <div className="stat">
          <div className="stat-label">AI Provider</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{meta.aiProvider?.split(' ')[0] ?? 'Unknown'}</div>
          <div className="stat-foot">{meta.aiProvider ?? '—'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>PDF Preview</h3>
          <span className="text-small text-muted">Scroll to view all pages · Use the download button for the best quality.</span>
        </div>
        <iframe
          src={`/api/proposals/${params.id}/pdf#toolbar=1&navpanes=0&view=FitH`}
          style={{ width: '100%', height: '85vh', border: 'none', background: 'var(--c-surface)' }}
          title="Proposal PDF"
        />
      </div>

      <div className="card mt-lg">
        <h3 style={{ marginBottom: 12 }}>Generation Input</h3>
        <details>
          <summary style={{ cursor: 'pointer', color: 'var(--c-muted)', fontSize: 13, marginBottom: 8 }}>
            Show the input used to generate this proposal
          </summary>
          <pre style={{
            background: 'var(--c-surface)',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            lineHeight: 1.5,
          }}>{JSON.stringify(meta.input, null, 2)}</pre>
        </details>
      </div>
    </>
  );
}
