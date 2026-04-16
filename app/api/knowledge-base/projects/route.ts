import { NextResponse } from 'next/server';
import { listProjects, upsertProject, deleteProject } from '@/lib/knowledge-base/manager';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(listProjects());
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.title || !body?.client) {
    return NextResponse.json({ error: 'title and client are required' }, { status: 400 });
  }
  const saved = upsertProject(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const ok = deleteProject(id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
