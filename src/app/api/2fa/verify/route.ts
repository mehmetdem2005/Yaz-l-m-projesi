import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTwoFactorToken, hashBackupCodes } from '@/lib/two-factor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/2fa/verify
 * Body: { email, token, backupCodes }
 * 2FA doğrula — token doğruysa 2FA'yı aktif et
 */
export async function POST(req: NextRequest) {
  const { email, token, backupCodes } = await req.json();

  if (!email || !token) {
    return NextResponse.json({ error: 'email ve token gerekli' }, { status: 400 });
  }

  const user = await db.userAuth.findUnique({ where: { email } });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json({ error: 'Önce setup yapın' }, { status: 400 });
  }

  const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);
  if (!isValid) {
    return NextResponse.json({ error: 'Geçersiz kod' }, { status: 400 });
  }

  // 2FA aktif et, backup codes sakla
  await db.userAuth.update({
    where: { email },
    data: {
      twoFactorEnabled: true,
      backupCodes: hashBackupCodes(backupCodes || []),
    },
  });

  return NextResponse.json({
    success: true,
    message: '2FA başarıyla etkinleştirildi',
    backupCodes: backupCodes || [],
  });
}
