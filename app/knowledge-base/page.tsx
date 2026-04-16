'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { KBCompanyProfile, KBProject, KBTeamMember } from '@/lib/knowledge-base/types';

type Tab = 'company' | 'projects' | 'team';

export default function KnowledgeBasePage() {
  const [tab, setTab] = useState<Tab>('company');
  const [company, setCompany] = useState<KBCompanyProfile | null>(null);
  const [projects, setProjects] = useState<KBProject[]>([]);
  const [team, setTeam] = useState<KBTeamMember[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    const [c, p, t] = await Promise.all([
      fetch('/api/knowledge-base/company').then((r) => r.json()),
      fetch('/api/knowledge-base/projects').then((r) => r.json()),
      fetch('/api/knowledge-base/team').then((r) => r.json()),
    ]);
    setCompany(c);
    setProjects(p);
    setTeam(t);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Knowledge Base</h1>
          <p>The quality of your proposals depends on what lives here. Keep it current.</p>
        </div>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>Company Profile</button>
        <button className={`tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>Past Projects <span className="text-muted">({projects.length})</span></button>
        <button className={`tab ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>Team <span className="text-muted">({team.length})</span></button>
      </div>

      {tab === 'company' && company && (
        <CompanyForm
          value={company}
          onChange={setCompany}
          onSave={async (next) => {
            const r = await fetch('/api/knowledge-base/company', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next),
            });
            if (r.ok) showToast('Company profile saved.');
          }}
        />
      )}

      {tab === 'projects' && (
        <ProjectsTab
          projects={projects}
          onReload={loadAll}
          showToast={showToast}
        />
      )}

      {tab === 'team' && (
        <TeamTab
          members={team}
          onReload={loadAll}
          showToast={showToast}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Company form
// ────────────────────────────────────────────────────────────
function CompanyForm({
  value,
  onChange,
  onSave,
}: {
  value: KBCompanyProfile;
  onChange: (v: KBCompanyProfile) => void;
  onSave: (v: KBCompanyProfile) => void | Promise<void>;
}) {
  function set<K extends keyof KBCompanyProfile>(key: K, v: KBCompanyProfile[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="card">
      <div className="row-between mb-lg">
        <h2 style={{ margin: 0 }}>Company Profile</h2>
        <button className="btn btn-primary" onClick={() => onSave(value)}>Save Changes</button>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Company Name</label>
          <input value={value.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label>Tagline</label>
          <input value={value.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Founded Year</label>
          <input type="number" value={value.founded} onChange={(e) => set('founded', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Headquarters</label>
          <input value={value.headquarters} onChange={(e) => set('headquarters', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Team Size</label>
          <input type="number" value={value.teamSize} onChange={(e) => set('teamSize', Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Projects Delivered</label>
          <input type="number" value={value.projectsDelivered} onChange={(e) => set('projectsDelivered', Number(e.target.value))} />
        </div>
      </div>

      <div className="field">
        <label>Mission Statement</label>
        <textarea value={value.mission} onChange={(e) => set('mission', e.target.value)} rows={3} />
      </div>

      <div className="field">
        <label>Industries Served <span className="hint">(comma-separated)</span></label>
        <input
          value={(value.industriesServed ?? []).join(', ')}
          onChange={(e) => set('industriesServed', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>

      <div className="field">
        <label>Certifications <span className="hint">(comma-separated)</span></label>
        <input
          value={(value.certifications ?? []).join(', ')}
          onChange={(e) => set('certifications', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>

      <div className="card-hairline" />

      <h3 style={{ marginBottom: 12 }}>Core Competencies</h3>
      {(value.coreCompetencies ?? []).map((c, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end', marginBottom: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Name</label>
            <input value={c.name} onChange={(e) => {
              const next = [...value.coreCompetencies];
              next[i] = { ...c, name: e.target.value };
              set('coreCompetencies', next);
            }} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Description</label>
            <input value={c.description} onChange={(e) => {
              const next = [...value.coreCompetencies];
              next[i] = { ...c, description: e.target.value };
              set('coreCompetencies', next);
            }} />
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => {
            const next = value.coreCompetencies.filter((_, j) => j !== i);
            set('coreCompetencies', next);
          }}>Remove</button>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" onClick={() => set('coreCompetencies', [...(value.coreCompetencies ?? []), { name: '', description: '' }])}>+ Add Competency</button>

      <div className="card-hairline" />

      <div className="field-row">
        <div className="field">
          <label>Signatory Name</label>
          <input value={value.signatoryName ?? ''} onChange={(e) => set('signatoryName', e.target.value)} />
        </div>
        <div className="field">
          <label>Signatory Title</label>
          <input value={value.signatoryTitle ?? ''} onChange={(e) => set('signatoryTitle', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Projects tab
// ────────────────────────────────────────────────────────────
function ProjectsTab({ projects, onReload, showToast }: { projects: KBProject[]; onReload: () => void; showToast: (s: string) => void }) {
  const [editing, setEditing] = useState<KBProject | null>(null);
  const [creating, setCreating] = useState(false);

  async function save(p: KBProject) {
    const r = await fetch('/api/knowledge-base/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    if (r.ok) {
      showToast('Project saved.');
      setEditing(null);
      setCreating(false);
      onReload();
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const r = await fetch(`/api/knowledge-base/projects?id=${id}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Project deleted.');
      onReload();
    }
  }

  const blank: KBProject = {
    id: '',
    title: '',
    client: '',
    clientIndustry: 'FinTech',
    year: new Date().getFullYear(),
    duration: '3 months',
    teamSize: 4,
    challenge: '',
    solution: '',
    results: [],
    technologies: [],
  };

  return (
    <>
      <div className="row-between mb-lg">
        <span className="text-muted">{projects.length} case study{projects.length === 1 ? '' : 'ies'} in Knowledge Base</span>
        <button className="btn btn-primary" onClick={() => { setEditing(blank); setCreating(true); }}>+ Add Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <h3>No projects yet</h3>
          <p>Add case studies so the AI can reference them when building proposals.</p>
        </div>
      ) : (
        <div className="entity-grid">
          {projects.map((p) => (
            <div key={p.id} className="entity-card">
              <div className="row-between">
                <span className="badge badge-accent">{p.clientIndustry}</span>
                <span className="text-small text-muted">{p.year}</span>
              </div>
              <h3>{p.title}</h3>
              <div className="meta">{p.client} · {p.duration}</div>
              <p className="text-small" style={{ color: 'var(--c-body)' }}>{p.challenge.slice(0, 120)}{p.challenge.length > 120 ? '…' : ''}</p>
              <div className="tags">
                {p.technologies.slice(0, 4).map((t) => <span key={t} className="badge badge-muted">{t}</span>)}
                {p.technologies.length > 4 && <span className="badge badge-muted">+{p.technologies.length - 4}</span>}
              </div>
              <div className="entity-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(p); setCreating(false); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={creating ? 'Add Project' : 'Edit Project'}>
        {editing && <ProjectForm value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={save} />}
      </Modal>
    </>
  );
}

function ProjectForm({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: KBProject;
  onChange: (p: KBProject) => void;
  onCancel: () => void;
  onSave: (p: KBProject) => void;
}) {
  function set<K extends keyof KBProject>(key: K, v: KBProject[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <>
      <div className="field">
        <label>Title</label>
        <input value={value.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field"><label>Client</label><input value={value.client} onChange={(e) => set('client', e.target.value)} /></div>
        <div className="field"><label>Industry</label><input value={value.clientIndustry} onChange={(e) => set('clientIndustry', e.target.value)} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Year</label><input type="number" value={value.year} onChange={(e) => set('year', Number(e.target.value))} /></div>
        <div className="field"><label>Duration</label><input value={value.duration} onChange={(e) => set('duration', e.target.value)} /></div>
      </div>
      <div className="field">
        <label>Challenge</label>
        <textarea value={value.challenge} onChange={(e) => set('challenge', e.target.value)} rows={3} />
      </div>
      <div className="field">
        <label>Solution</label>
        <textarea value={value.solution} onChange={(e) => set('solution', e.target.value)} rows={3} />
      </div>
      <div className="field">
        <label>Results <span className="hint">(one per line)</span></label>
        <textarea
          value={value.results.join('\n')}
          onChange={(e) => set('results', e.target.value.split('\n').filter(Boolean))}
          rows={3}
        />
      </div>
      <div className="field">
        <label>Technologies <span className="hint">(comma-separated)</span></label>
        <input
          value={value.technologies.join(', ')}
          onChange={(e) => set('technologies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(value)}>Save</button>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Team tab
// ────────────────────────────────────────────────────────────
function TeamTab({ members, onReload, showToast }: { members: KBTeamMember[]; onReload: () => void; showToast: (s: string) => void }) {
  const [editing, setEditing] = useState<KBTeamMember | null>(null);
  const [creating, setCreating] = useState(false);

  async function save(m: KBTeamMember) {
    const r = await fetch('/api/knowledge-base/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    });
    if (r.ok) {
      showToast('Team member saved.');
      setEditing(null);
      setCreating(false);
      onReload();
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this team member? This cannot be undone.')) return;
    const r = await fetch(`/api/knowledge-base/team?id=${id}`, { method: 'DELETE' });
    if (r.ok) {
      showToast('Team member deleted.');
      onReload();
    }
  }

  const blank: KBTeamMember = {
    id: '',
    name: '',
    title: '',
    yearsExperience: 5,
    expertise: [],
    bio: '',
  };

  return (
    <>
      <div className="row-between mb-lg">
        <span className="text-muted">{members.length} team member{members.length === 1 ? '' : 's'}</span>
        <button className="btn btn-primary" onClick={() => { setEditing(blank); setCreating(true); }}>+ Add Member</button>
      </div>

      {members.length === 0 ? (
        <div className="empty">
          <h3>No team members yet</h3>
          <p>Add team members so the AI can assemble the right team for each proposal.</p>
        </div>
      ) : (
        <div className="entity-grid">
          {members.map((m) => (
            <div key={m.id} className="entity-card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'linear-gradient(135deg, #0F172A, #3B82F6)',
                  color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>{m.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{m.name}</h3>
                  <div className="meta">{m.title} · {m.yearsExperience}y</div>
                </div>
              </div>
              <p className="text-small" style={{ color: 'var(--c-body)' }}>{m.bio.slice(0, 130)}{m.bio.length > 130 ? '…' : ''}</p>
              <div className="tags">
                {m.expertise.slice(0, 4).map((t) => <span key={t} className="badge badge-muted">{t}</span>)}
                {m.expertise.length > 4 && <span className="badge badge-muted">+{m.expertise.length - 4}</span>}
              </div>
              <div className="entity-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(m); setCreating(false); }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={creating ? 'Add Team Member' : 'Edit Team Member'}>
        {editing && <TeamForm value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={save} />}
      </Modal>
    </>
  );
}

function TeamForm({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: KBTeamMember;
  onChange: (m: KBTeamMember) => void;
  onCancel: () => void;
  onSave: (m: KBTeamMember) => void;
}) {
  function set<K extends keyof KBTeamMember>(key: K, v: KBTeamMember[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <>
      <div className="field-row">
        <div className="field"><label>Name</label><input value={value.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="field"><label>Title</label><input value={value.title} onChange={(e) => set('title', e.target.value)} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Years Experience</label><input type="number" value={value.yearsExperience} onChange={(e) => set('yearsExperience', Number(e.target.value))} /></div>
        <div className="field"><label>Education</label><input value={value.education ?? ''} onChange={(e) => set('education', e.target.value)} /></div>
      </div>
      <div className="field">
        <label>Expertise <span className="hint">(comma-separated)</span></label>
        <input
          value={(value.expertise ?? []).join(', ')}
          onChange={(e) => set('expertise', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="field">
        <label>Bio</label>
        <textarea value={value.bio} onChange={(e) => set('bio', e.target.value)} rows={4} />
      </div>
      <div className="field">
        <label>Certifications <span className="hint">(comma-separated)</span></label>
        <input
          value={(value.certifications ?? []).join(', ')}
          onChange={(e) => set('certifications', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave(value)}>Save</button>
      </div>
    </>
  );
}
