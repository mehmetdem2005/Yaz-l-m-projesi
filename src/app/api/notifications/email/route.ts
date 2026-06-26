import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, sendTemplateEmail, testEmailConnection, EMAIL_TEMPLATES } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/email
 * Body: { action, to, template, data, subject, html }
 *
 * Actions:
 * - send: doğrudan email gönder
 * - send-template: template ile email gönder
 * - test: bağlantı testi
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, to, template, data, subject, html, text } = body;

  try {
    if (action === 'test') {
      const result = await testEmailConnection();
      return NextResponse.json(result);
    }

    if (action === 'send-template') {
      if (!to || !template) {
        return NextResponse.json({ error: 'to ve template gerekli' }, { status: 400 });
      }
      if (!EMAIL_TEMPLATES[template]) {
        return NextResponse.json({ error: 'Geçersiz template' }, { status: 400 });
      }
      const result = await sendTemplateEmail(to, template, data || {});
      return NextResponse.json(result);
    }

    // Default: send
    if (!to || !subject) {
      return NextResponse.json({ error: 'to ve subject gerekli' }, { status: 400 });
    }
    const result = await sendEmail({ to, subject, html, text });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/email — Email log'ları
 */
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
  const logs = await db.notificationLog.findMany({
    where: { type: 'email' },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return NextResponse.json({ logs });
}
