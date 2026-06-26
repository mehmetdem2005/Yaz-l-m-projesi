import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await db.auditLog.create({ data: body });
    return NextResponse.json(log);
  } catch (e) {
    return NextResponse.json({ error: 'Audit log oluşturulamadı' }, { status: 500 });
  }
}
