import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await db.cronJob.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(jobs);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const job = await db.cronJob.create({ data: body });
    return NextResponse.json(job);
  } catch (e) {
    return NextResponse.json({ error: 'Cron job oluşturulamadı' }, { status: 500 });
  }
}
