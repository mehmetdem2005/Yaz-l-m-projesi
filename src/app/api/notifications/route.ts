import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notifs = await db.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    return NextResponse.json(notifs);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notif = await db.notification.create({ data: body });
    return NextResponse.json(notif);
  } catch (e) {
    return NextResponse.json({ error: 'Bildirim oluşturulamadı' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, read } = await req.json();
    const notif = await db.notification.update({ where: { id }, data: { read } });
    return NextResponse.json(notif);
  } catch (e) {
    return NextResponse.json({ error: 'Bildirim güncellenemedi' }, { status: 500 });
  }
}
