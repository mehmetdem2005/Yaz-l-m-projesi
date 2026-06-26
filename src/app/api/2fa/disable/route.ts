import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTwoFactorToken, verifyBackupCode, unhashBackupCodes, hashBackupCodes } from '@/lib/two-factor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/2fa/disable
 * Body: { email, token }
 * 2FA'yı devre dışı bırak — token doğrula
 */
export async function POST(req: NextRequest) {
  const { email, token } = await req.json();

  if (!email || !token) {
    return NextResponse.json({ error: 'email ve token gerekli' }, { status: 400 });
  }

  const user = await db.userAuth.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA zaten kapalı' }, { status: 400 });
  }

  // Önce TOTP dene
  let valid = false;
  if (user.twoFactorSecret) {
    valid = verifyTwoFactorToken(token, user.twoFactorSecret);
  }

  // Backup code dene
  if (!valid && user.backupCodes) {
    const codes = unhashBackupCodes(user.backupCodes);
    const result = verifyBackupCode(token, codes);
    if (result.valid) {
      valid = true;
      // Backup code'u tüket
      await db.userAuth.update({
        where: { email },
        data: { backupCodes: hashBackupCodes(result.remaining) },
      });
    }
  }

  if (!valid) {
    return NextResponse.json({ error: 'Geçersiz kod' }, { status: 400 });
  }

  await db.userAuth.update({
    where: { email },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
    },
  });

  return NextResponse.json({ success: true, message: '2FA devre dışı bırakıldı' });
}
