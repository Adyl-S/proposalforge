import { NextResponse } from 'next/server';
import { getProposalPdf, getProposalMeta } from '@/lib/proposals/store';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const pdf = getProposalPdf(ctx.params.id);
  if (!pdf) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const meta = await getProposalMeta(ctx.params.id);
  const url = new URL(req.url);
  const download = url.searchParams.get('download') === '1';
  const filename = `${(meta?.clientName ?? 'proposal').replace(/\s+/g, '-')}-${ctx.params.id}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}
