import { NextResponse } from 'next/server';
import { listProposals, deleteProposal } from '@/lib/proposals/store';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await listProposals());
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const ok = await deleteProposal(id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
