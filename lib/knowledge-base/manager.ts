import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  KnowledgeBase,
  KBCompanyProfile,
  KBProject,
  KBTeamMember,
} from './types';

const DATA_ROOT = join(process.cwd(), 'data', 'knowledge-base');
const COMPANY_PATH = join(DATA_ROOT, 'company.json');
const PROJECTS_PATH = join(DATA_ROOT, 'projects.json');
const TEAM_PATH = join(DATA_ROOT, 'team.json');
const ASSETS_DIR = join(DATA_ROOT, 'assets');

const DEFAULT_COMPANY: KBCompanyProfile = {
  name: 'Your Company',
  tagline: 'Building the future',
  founded: new Date().getFullYear(),
  headquarters: '',
  teamSize: 1,
  projectsDelivered: 0,
  industriesServed: [],
  mission: '',
  certifications: [],
  coreCompetencies: [],
  brandColors: { primary: '#0F172A', secondary: '#1E293B', accent: '#3B82F6' },
};

function ensureDataDirs() {
  mkdirSync(DATA_ROOT, { recursive: true });
  mkdirSync(ASSETS_DIR, { recursive: true });
}

function atomicWrite(path: string, data: unknown) {
  ensureDataDirs();
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmp, path);
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

// ────────────────────────────────────────────────────────────
// Company
// ────────────────────────────────────────────────────────────
export function getCompany(): KBCompanyProfile {
  return readJson<KBCompanyProfile>(COMPANY_PATH, DEFAULT_COMPANY);
}

export function saveCompany(profile: KBCompanyProfile): KBCompanyProfile {
  atomicWrite(COMPANY_PATH, profile);
  return profile;
}

// ────────────────────────────────────────────────────────────
// Projects
// ────────────────────────────────────────────────────────────
export function listProjects(): KBProject[] {
  return readJson<KBProject[]>(PROJECTS_PATH, []);
}

export function getProject(id: string): KBProject | undefined {
  return listProjects().find((p) => p.id === id);
}

export function upsertProject(input: Omit<KBProject, 'id'> & { id?: string }): KBProject {
  const items = listProjects();
  const id = input.id ?? `proj-${randomUUID().slice(0, 8)}`;
  const record: KBProject = { ...input, id };
  const idx = items.findIndex((p) => p.id === id);
  if (idx >= 0) items[idx] = record;
  else items.push(record);
  atomicWrite(PROJECTS_PATH, items);
  return record;
}

export function deleteProject(id: string): boolean {
  const items = listProjects();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  atomicWrite(PROJECTS_PATH, next);
  return true;
}

// ────────────────────────────────────────────────────────────
// Team
// ────────────────────────────────────────────────────────────
export function listTeam(): KBTeamMember[] {
  return readJson<KBTeamMember[]>(TEAM_PATH, []);
}

export function getTeamMember(id: string): KBTeamMember | undefined {
  return listTeam().find((m) => m.id === id);
}

export function upsertTeamMember(
  input: Omit<KBTeamMember, 'id'> & { id?: string },
): KBTeamMember {
  const items = listTeam();
  const id = input.id ?? `team-${randomUUID().slice(0, 8)}`;
  const record: KBTeamMember = { ...input, id };
  const idx = items.findIndex((m) => m.id === id);
  if (idx >= 0) items[idx] = record;
  else items.push(record);
  atomicWrite(TEAM_PATH, items);
  return record;
}

export function deleteTeamMember(id: string): boolean {
  const items = listTeam();
  const next = items.filter((m) => m.id !== id);
  if (next.length === items.length) return false;
  atomicWrite(TEAM_PATH, next);
  return true;
}

// ────────────────────────────────────────────────────────────
// Snapshot
// ────────────────────────────────────────────────────────────
export function getKnowledgeBase(): KnowledgeBase {
  return {
    company: getCompany(),
    projects: listProjects(),
    team: listTeam(),
  };
}

// ────────────────────────────────────────────────────────────
// Asset paths
// ────────────────────────────────────────────────────────────
export function getAssetsDir(): string {
  ensureDataDirs();
  return ASSETS_DIR;
}

export function assetPath(filename: string): string {
  return join(ASSETS_DIR, filename);
}
