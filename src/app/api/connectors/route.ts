import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const connectors = await db.connector.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ connectors });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, name, description, config } = body;

  if (!type || !name) {
    return NextResponse.json({ error: 'type ve name gerekli' }, { status: 400 });
  }

  const connector = await db.connector.create({
    data: {
      type,
      name,
      description: description || null,
      config: JSON.stringify(config || {}),
      status: 'disconnected',
    },
  });

  return NextResponse.json({ connector });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  await db.connector.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
