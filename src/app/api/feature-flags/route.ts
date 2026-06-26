import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const flags = await db.featureFlag.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(flags);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const flag = await db.featureFlag.create({ data: body });
    return NextResponse.json(flag);
  } catch (e) {
    return NextResponse.json({ error: 'Feature flag oluşturulamadı' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, enabled } = await req.json();
    const flag = await db.featureFlag.update({ where: { id }, data: { enabled } });
    return NextResponse.json(flag);
  } catch (e) {
    return NextResponse.json({ error: 'Feature flag güncellenemedi' }, { status: 500 });
  }
}
