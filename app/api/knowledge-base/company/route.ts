import { NextResponse } from 'next/server';
import { getCompany, saveCompany } from '@/lib/knowledge-base/manager';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getCompany());
}

export async function PUT(req: Request) {
  const body = await req.json();
  const saved = saveCompany(body);
  return NextResponse.json(saved);
}
