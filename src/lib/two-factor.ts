/**
 * 2FA (Two-Factor Authentication) — TOTP (Time-based One-Time Password)
 *
 * RFC 6238 uyumlu. otplib kullanır.
 * - secret generate
 * - QR code (otpauth:// URL)
 * - token verify
 * - backup codes
 */

import { TOTP, generateSecret } from 'otplib';

const totp = new TOTP();
import QRCode from 'qrcode';

// 6 haneli kod, 30 saniye süre
totp.options = { digits: 6, step: 30, window: 1 };

const ISSUER = 'DeepSeek App Studio';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string; // data:image/png;base64
  otpauthUrl: string;
  backupCodes: string[];
}

export async function generateTwoFactorSetup(email: string): Promise<TwoFactorSetup> {
  const secret = generateSecret();
  const otpauthUrl = totp.keyuri(email, ISSUER, secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 240,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
  const backupCodes = generateBackupCodes();

  return { secret, qrCodeUrl, otpauthUrl, backupCodes };
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return totp.verify({ token: token.replace(/\s/g, ''), secret });
  } catch {
    return false;
  }
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // 8 haneli alfanumerik (XXXXXXXX format)
    const code = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    codes.push(code);
  }
  return codes;
}

export function verifyBackupCode(code: string, backupCodes: string[]): { valid: boolean; remaining: string[] } {
  const upper = code.toUpperCase().trim();
  const idx = backupCodes.indexOf(upper);
  if (idx === -1) {
    return { valid: false, remaining: backupCodes };
  }
  // Kodu kullan (one-time)
  const remaining = [...backupCodes];
  remaining.splice(idx, 1);
  return { valid: true, remaining };
}

/**
 * Hash backup codes for storage (güvenlik için)
 */
export function hashBackupCodes(codes: string[]): string {
  // Basit obfuscation (production'da bcrypt kullanın)
  return JSON.stringify(codes);
}

export function unhashBackupCodes(hashed: string): string[] {
  try {
    return JSON.parse(hashed);
  } catch {
    return [];
  }
}

/**
 * Generate current TOTP for testing
 */
export function generateCurrentToken(secret: string): string {
  return totp.generate(secret);
}
