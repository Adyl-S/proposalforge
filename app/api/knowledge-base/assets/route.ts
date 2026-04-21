import { NextResponse } from 'next/server';
import { writeFileSync, unlinkSync, existsSync, readdirSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { getAssetsDir, assetPath } from '@/lib/knowledge-base/manager';
import { slugify } from '@/lib/utils/helpers';

export const runtime = 'nodejs';

const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
  const dir = getAssetsDir();
  const entries = readdirSync(dir)
    .filter((f) => ALLOWED_EXT.has(extname(f).toLowerCase()))
    .map((f) => {
      const stat = statSync(assetPath(f));
      return { name: f, size: stat.size, mtime: stat.mtimeMs };
    });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

  const ext = extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: `unsupported extension ${ext}` }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file too large (max 5 MB)' }, { status: 400 });
  }

  const baseName = file.name.lastIndexOf(ext) > 0 ? file.name.slice(0, file.name.lastIndexOf(ext)) : file.name;
  const safeName = `${Date.now()}-${slugify(baseName)}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(assetPath(safeName), buf);
  return NextResponse.json({ name: safeName, size: buf.length }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return NextResponse.json({ error: 'invalid name' }, { status: 400 });
  }
  const p = assetPath(name);
  if (!existsSync(p)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  unlinkSync(p);
  return NextResponse.json({ ok: true });
}
