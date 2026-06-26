import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const targets = await db.deployTarget.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(targets);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = await db.deployTarget.create({ data: body });
    return NextResponse.json(target);
  } catch (e) {
    return NextResponse.json({ error: 'Deploy target oluşturulamadı' }, { status: 500 });
  }
}
