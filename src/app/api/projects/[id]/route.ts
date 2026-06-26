import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      files: { orderBy: { path: 'asc' } },
      messages: { orderBy: { createdAt: 'asc' }, take: 100 },
      versions: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!project) return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const project = await db.project.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      standard: body.standard,
      status: body.status,
    },
  });
  return NextResponse.json({ project });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
