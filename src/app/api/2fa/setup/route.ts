import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTwoFactorSetup } from '@/lib/two-factor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/2fa/setup
 * Body: { email }
 * 2FA setup başlat — secret + QR code + backup codes üret
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'email gerekli' }, { status: 400 });
  }

  const setup = await generateTwoFactorSetup(email);

  // UserAuth kaydı yoksa oluştur, secret'ı geçici sakla (verify edilene kadar)
  await db.userAuth.upsert({
    where: { email },
    update: { twoFactorSecret: setup.secret },
    create: {
      email,
      twoFactorSecret: setup.secret,
      twoFactorEnabled: false,
    },
  });

  return NextResponse.json({
    secret: setup.secret,
    qrCodeUrl: setup.qrCodeUrl,
    otpauthUrl: setup.otpauthUrl,
    backupCodes: setup.backupCodes,
    message: 'QR kodu authenticator app ile tarayın, sonra 6 haneli kodu doğrulayın',
  });
}

/**
 * GET /api/2fa/status?email=...
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email gerekli' }, { status: 400 });
  }

  const user = await db.userAuth.findUnique({ where: { email } });
  return NextResponse.json({
    enabled: user?.twoFactorEnabled || false,
    hasSecret: Boolean(user?.twoFactorSecret),
    backupCodesRemaining: user?.backupCodes ? JSON.parse(user.backupCodes).length : 0,
  });
}
