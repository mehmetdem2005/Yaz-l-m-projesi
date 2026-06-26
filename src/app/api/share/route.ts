import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/share — Yeni share link oluştur */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, name, expiresAt } = body;

  if (!projectId) {
    return NextResponse.json({ error: 'projectId gerekli' }, { status: 400 });
  }

  const token = nanoid(16);
  const shareLink = await db.shareLink.create({
    data: {
      token,
      projectId,
      name: name || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json({
    shareLink,
    url: `/api/share/${token}`,
  });
}

/** GET /api/share?projectId=... — Projenin tüm linkleri */
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ error: 'projectId gerekli' }, { status: 400 });
  }
  const links = await db.shareLink.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ links });
}
