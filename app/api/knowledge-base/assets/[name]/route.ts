import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { assetPath } from '@/lib/knowledge-base/manager';

export const runtime = 'nodejs';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(
  _req: Request,
  ctx: { params: { name: string } },
) {
  const { name } = ctx.params;
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return NextResponse.json({ error: 'invalid name' }, { status: 400 });
  }
  const p = assetPath(name);
  if (!existsSync(p)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const ext = extname(name).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  const buf = readFileSync(p);
  return new NextResponse(new Uint8Array(buf), {
    headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
