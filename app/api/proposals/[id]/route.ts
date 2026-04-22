import { NextResponse } from 'next/server';
import { getProposalMeta, deleteProposal } from '@/lib/proposals/store';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const meta = await getProposalMeta(ctx.params.id);
  if (!meta) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(meta);
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const ok = await deleteProposal(ctx.params.id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
