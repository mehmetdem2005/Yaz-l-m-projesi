import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const files = await db.file.findMany({
    where: { projectId: id },
    orderBy: { path: 'asc' },
  });
  return NextResponse.json({ files });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { path, content, language } = body;
  if (!path) return NextResponse.json({ error: 'path gerekli' }, { status: 400 });

  const file = await db.file.upsert({
    where: { projectId_path: { projectId: id, path } },
    update: { content, language },
    create: { projectId: id, path, content, language },
  });
  return NextResponse.json({ file });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path gerekli' }, { status: 400 });
  await db.file.deleteMany({ where: { projectId: id, path } });
  return NextResponse.json({ ok: true });
}
