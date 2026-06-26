import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const errors = await db.errorTrack.findMany({ orderBy: { lastSeen: 'desc' }, take: 50 });
    return NextResponse.json(errors);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const error = await db.errorTrack.create({ data: body });
    return NextResponse.json(error);
  } catch (e) {
    return NextResponse.json({ error: 'Hata kaydı oluşturulamadı' }, { status: 500 });
  }
}
