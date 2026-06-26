import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/share/[token] — Paylaşılan proje snapshot'ını getir */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const link = await db.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: { files: true },
      },
    },
  });

  if (!link || !link.isActive) {
    return NextResponse.json({ error: 'Link geçersiz veya pasif' }, { status: 404 });
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Link süresi dolmuş' }, { status: 410 });
  }

  // View count artır
  await db.shareLink.update({
    where: { id: link.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({
    project: link.project,
    sharedAt: link.createdAt,
    shareName: link.name,
  });
}

/** DELETE /api/share/[token] — Linki geri al (deactivate) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  await db.shareLink.updateMany({
    where: { token },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
