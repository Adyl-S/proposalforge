import { NextResponse } from 'next/server';
import { listTeam, upsertTeamMember, deleteTeamMember } from '@/lib/knowledge-base/manager';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(listTeam());
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.name || !body?.title) {
    return NextResponse.json({ error: 'name and title are required' }, { status: 400 });
  }
  const saved = upsertTeamMember(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const ok = deleteTeamMember(id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
