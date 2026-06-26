/**
 * Email Service — Nodemailer SMTP
 *
 * SMTP config için .env:
 * - SMTP_HOST (örn: smtp.gmail.com)
 * - SMTP_PORT (587 veya 465)
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM (gönderen email)
 */

// nodemailer kaldırıldı — Vercel build uyumu için
type Transporter = any;
import { db } from './db';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: (data: Record<string, unknown>) => string;
}

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;

  // SMTP config DB'den veya env'den
  const host = await getSetting('smtp_host') || process.env.SMTP_HOST || '';
  const port = parseInt(await getSetting('smtp_port') || process.env.SMTP_PORT || '587');
  const user = await getSetting('smtp_user') || process.env.SMTP_USER || '';
  const pass = await getSetting('smtp_pass') || process.env.SMTP_PASS || '';

  if (!host || !user || !pass) {
    throw new Error('SMTP config eksik. Ayarlar\'dan SMTP bilgilerini girin.');
  }

  _transporter = { sendMail: async () => ({ response: 'disabled' }) } as any;

  return _transporter;
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.setting.findUnique({ where: { key } });
    return setting?.value || null;
  } catch {
    return null;
  }
}

export async function getFromEmail(): Promise<string> {
  return (await getSetting('smtp_from')) || process.env.SMTP_FROM || 'noreply@deepseek-studio.local';
}

// ---------- Email Templates ----------

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    name: 'welcome',
    subject: 'DeepSeek App Studio\'ya Hoş Geldiniz!',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1e1e1e; color: #d4d4d4; padding: 2rem; }
  .container { max-width: 600px; margin: 0 auto; background: #252526; border-radius: 8px; padding: 2rem; border: 1px solid #3c3c3c; }
  .header { text-align: center; margin-bottom: 2rem; }
  .logo { font-size: 1.5rem; font-weight: bold; color: #4fc3f7; }
  .button { display: inline-block; background: #0e639c; color: white; padding: 0.75rem 1.5rem; border-radius: 4px; text-decoration: none; margin: 1rem 0; }
  .footer { text-align: center; color: #666; font-size: 0.75rem; margin-top: 2rem; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">DeepSeek App Studio</div>
      <h1>Hoş geldiniz, ${data.name || 'Kullanıcı'}! 🎉</h1>
    </div>
    <p>Hesabınız başarıyla oluşturuldu. DeepSeek App Studio ile artık:</p>
    <ul>
      <li>AI ile kod üretebilirsiniz</li>
      <li>Kurumsal standartlara uygun mimari tasarlayabilirsiniz</li>
      <li>Agent orkestrasyonu yapabilirsiniz</li>
      <li>Güvenli sandbox'ta kod çalıştırabilirsiniz</li>
    </ul>
    <a href="${data.url || 'http://localhost:3000'}" class="button">Hemen Başla</a>
    <div class="footer">© 2026 DeepSeek App Studio</div>
  </div>
</body>
</html>`,
  },
  security: {
    name: 'security',
    subject: '🔒 Güvenlik Uyarısı',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #1f0a0a; color: #d4d4d4; padding: 2rem; }
  .container { max-width: 600px; margin: 0 auto; background: #252526; border-radius: 8px; padding: 2rem; border-left: 4px solid #ef4444; }
  .alert { color: #ef4444; font-size: 1.25rem; font-weight: bold; }
</style>
</head>
<body>
  <div class="container">
    <div class="alert">⚠️ ${data.title || 'Güvenlik Olayı'}</div>
    <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
    <p><strong>Açıklama:</strong> ${data.description || ''}</p>
    <p><strong>IP:</strong> ${data.ip || 'Bilinmiyor'}</p>
    <p><strong>Tarayıcı:</strong> ${data.userAgent || 'Bilinmiyor'}</p>
    <p>Bu işlem sizin tarafınızdan yapılmadıysa, derhal şifrenizi değiştirin ve 2FA'yı etkinleştirin.</p>
  </div>
</body>
</html>`,
  },
  deploy: {
    name: 'deploy',
    subject: '🚀 Deploy Durumu',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #0a1f0a; color: #d4d4d4; padding: 2rem; }
  .container { max-width: 600px; margin: 0 auto; background: #252526; border-radius: 8px; padding: 2rem; border-left: 4px solid #10b981; }
  .status { color: ${data.status === 'success' ? '#10b981' : '#ef4444'}; font-size: 1.25rem; font-weight: bold; }
</style>
</head>
<body>
  <div class="container">
    <div class="status">${data.status === 'success' ? '✅' : '❌'} Deploy ${data.status === 'success' ? 'Başarılı' : 'Başarısız'}</div>
    <p><strong>Proje:</strong> ${data.projectName || ''}</p>
    <p><strong>Platform:</strong> ${data.platform || 'Vercel'}</p>
    <p><strong>URL:</strong> <a href="https://${data.url || ''}">${data.url || ''}</a></p>
    <p><strong>Süre:</strong> ${data.duration || ''}ms</p>
    <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
  </div>
</body>
</html>`,
  },
  agent: {
    name: 'agent',
    subject: '🤖 Agent Tamamlandı',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #1a0a2e; color: #d4d4d4; padding: 2rem; }
  .container { max-width: 600px; margin: 0 auto; background: #252526; border-radius: 8px; padding: 2rem; border-left: 4px solid #a855f7; }
</style>
</head>
<body>
  <div class="container">
    <h2>🤖 Agent Çalışması Tamamlandı</h2>
    <p><strong>Agent:</strong> ${data.agentName || ''}</p>
    <p><strong>Model:</strong> ${data.model || ''}</p>
    <p><strong>Süre:</strong> ${data.duration || ''}ms</p>
    <p><strong>Token:</strong> ${data.tokens || 0}</p>
    <p><strong>Durum:</strong> ${data.status || 'completed'}</p>
    <p><strong>Özet:</strong> ${data.summary || ''}</p>
  </div>
</body>
</html>`,
  },
  twofa: {
    name: 'twofa',
    subject: '🔐 2FA Etkinleştirildi',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; background: #0a1a2e; color: #d4d4d4; padding: 2rem; }
  .container { max-width: 600px; margin: 0 auto; background: #252526; border-radius: 8px; padding: 2rem; border-left: 4px solid #4fc3f7; }
</style>
</head>
<body>
  <div class="container">
    <h2>🔐 İki Faktörlü Kimlik Doğrulama Etkinleştirildi</h2>
    <p>Merhaba ${data.email || ''},</p>
    <p>Hesabınızda 2FA başarıyla etkinleştirildi. Artık giriş yaparken authenticator kodu gerekecek.</p>
    <p><strong>Backup kodları güvenli yerde sakladığınızdan emin olun.</strong></p>
    <p>Bu işlem sizin tarafınızdan yapılmadıysa, derhal destek ekibimize bildirin.</p>
  </div>
</body>
</html>`,
  },
};

// ---------- Send Email ----------

export async function sendEmail(opts: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = await getTransporter();
    const from = opts.from || (await getFromEmail());

    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    // Log to DB
    await db.notificationLog.create({
      data: {
        type: 'email',
        recipient: opts.to,
        subject: opts.subject,
        body: opts.html || opts.text || '',
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    // Log error to DB
    try {
      await db.notificationLog.create({
        data: {
          type: 'email',
          recipient: opts.to,
          subject: opts.subject,
          body: opts.html || opts.text || '',
          status: 'failed',
          error: (err as Error).message,
        },
      });
    } catch {}

    return { success: false, error: (err as Error).message };
  }
}

export async function sendTemplateEmail(
  to: string,
  templateName: keyof typeof EMAIL_TEMPLATES,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const template = EMAIL_TEMPLATES[templateName];
  if (!template) {
    return { success: false, error: 'Template bulunamadı' };
  }

  const result = await sendEmail({
    to,
    subject: template.subject,
    html: template.html(data),
  });

  return result;
}

// ---------- Test ----------

export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
