/**
 * Smart Chat — Profesyonel AI asistanı
 *
 * Özellikler:
 * - Eksik bilgiyi sorarak tamamlar (clarifying questions)
 * - Context-aware (proje, standart, geçmiş sohbet)
 * - Step-by-step plan sunar
 * - Diff mode: tam dosya yazmak yerine diff önerir
 * - Memory-enhanced: kullanıcı tercihlerini hatırlar
 * - Skill-aware: hangi skill'lerin aktif olduğuna göre davranır
 */

export interface ChatContext {
  projectId?: string;
  projectName?: string;
  projectDescription?: string;
  standard?: string;
  files?: { path: string; content: string }[];
  recentMessages?: { role: string; content: string }[];
  activeSkills?: string[];
  activeConnectors?: string[];
  userPreferences?: Record<string, unknown>;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  options?: string[]; // çoktan seçmeli ise
  required: boolean;
  context: string; // neden soruluyor
}

export interface ChatPlan {
  understanding: string; // AI'ın anladığı
  clarifyingQuestions: ClarifyingQuestion[]; // sorular
  proposedPlan: string[]; // adımlar
  estimatedSteps: number;
  estimatedTime: string;
  approach: 'full' | 'diff' | 'mixed';
}

/**
 * AI'ın vereceği yanıt — ya soru sorar ya da kod üretir
 */
export interface SmartChatResponse {
  type: 'question' | 'plan' | 'executing' | 'complete' | 'error';
  message: string;
  questions?: ClarifyingQuestion[];
  plan?: ChatPlan;
  codeChanges?: Array<{ path: string; content: string; isDiff: boolean }>;
  nextSteps?: string[];
}

/**
 * System prompt builder — AI'a nasıl davranacağını söyler
 */
export function buildSystemPrompt(ctx: ChatContext): string {
  const standard = ctx.standard ? `\n\nAKTİF KURUMSAL STANDART: ${ctx.standard}` : '';
  const skills = ctx.activeSkills?.length
    ? `\n\nAKTİF SKILLER: ${ctx.activeSkills.join(', ')}`
    : '';
  const files = ctx.files?.slice(0, 5).map((f) => `  - ${f.path}`).join('\n') || '';

  return `Sen DeepSeek App Studio'nun profesyonel AI kod asistanısın. TÜRKÇE yanıt ver.

ÖNCEKİ KONUŞMA:
${ctx.recentMessages?.slice(-5).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join('\n') || '(yok)'}

PROJE: ${ctx.projectName || 'Bilinmeyen'}
${ctx.projectDescription ? `AÇIKLAMA: ${ctx.projectDescription}` : ''}
MEVCUT DOSYALAR:
${files || '  (boş)'}
${standard}${skills}

DAVRANIŞ KURALLARI (ÇOK ÖNEMLİ):
1. **Önce anla, sonra kodla.** Kullanıcının isteği belirsizse, PROFESYONEL bir şekilde SORU SOR.
2. Soru sorarken çoktan seçmeli seçenekler sun (mümkünse).
3. Maksimum 3 soru sor, sonra plana geç.
4. **Plan sun**: Kod yazmadan önce ne yapacağını adım adım listele.
5. **Diff tercih et**: Mevcut dosyayı düzenliyorsan, TAMAMEN yeniden yazma. Sadece değişen kısımları \`\`\`diff path="..." formatında ver.
6. Yeni dosya oluşturuyorsan \`\`\`tsx path="..." formatını kullan.
7. Kod kalitesi: clean code, SOLID, TypeScript strict, error handling, JSDoc comments.
8. Kurumsal standartlara uy: OWASP, ISO, NIST relevant maddelerini uygula.
9. Eğer kullanıcı "düzenle" derse, mevcut dosyaları okuyup diff oluştur.
10. Memory: kullanıcı tercihlerini (renk paleti, framework, vs.) sonraki mesajlarda hatırla.

ÇIKTI FORMAT'LARI:
- SORU SORARKEN: JSON formatında
  \`\`\`json
  {
    "type": "question",
    "message": "Birkaç şeyi netleştirmem gerekiyor:",
    "questions": [
      { "id": "q1", "question": "Hangi framework kullanalım?", "options": ["Next.js", "Remix", "Astro"], "required": true, "context": "Proje web tabanlı görünüyor" }
    ]
  }
  \`\`\`

- PLAN SUNARKEN:
  \`\`\`json
  {
    "type": "plan",
    "message": "Anladım. İşte planım:",
    "plan": {
      "understanding": "...",
      "proposedPlan": ["1. Veri modeli tasarla", "2. API route yaz", "3. UI komponent"],
      "estimatedSteps": 3,
      "estimatedTime": "5-10 dk",
      "approach": "diff"
    }
  }
  \`\`\`
  Sonra "Onaylıyor musun?" diye sor.

- KOD ÜRETİRKEN: Markdown içinde kod blokları, her dosya için ayrı.
  Açıklama paragrafı kısa, kod örnekleri tam.

- HATA DURUMUNDA:
  \`\`\`json
  { "type": "error", "message": "..." }
  \`\`\`

Şimdi kullanıcının mesajını analiz et, uygun formatta yanıt ver.`;
}

/**
 * AI yanıtını parse et — JSON bloklarını ayıkla
 */
export function parseSmartResponse(content: string): SmartChatResponse | null {
  // ```json ... ``` bloğunu ara
  const jsonMatch = content.match(/```json\s*\n([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      // Geçersiz JSON, düz metin olarak devam
    }
  }

  // Doğrudan JSON mu?
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return JSON.parse(trimmed);
    }
  } catch {
    // geç
  }

  // Düz metin — kod bloklarını ayıkla
  const codeBlocks = content.matchAll(/```(\w+)?\s*(?:path="([^"]+)")?\s*\n([\s\S]*?)```/g);
  const codeChanges: SmartChatResponse['codeChanges'] = [];
  let match: RegExpMatchArray | null;
  while ((match = codeBlocks.next().value as RegExpMatchArray | null)) {
    const [, lang, path, code] = match;
    if (path) {
      codeChanges.push({
        path,
        content: code.trim(),
        isDiff: lang === 'diff',
      });
    }
  }

  if (codeChanges.length > 0) {
    return {
      type: 'complete',
      message: content.split('```')[0].trim() || 'Kod üretildi',
      codeChanges,
      nextSteps: ["Diff'i inceleyin", 'Onaylayınca uygularım'],
    };
  }

  return null;
}

/**
 * Kullanıcı yanıtından context çıkar
 */
export function extractUserPreferences(message: string): Record<string, unknown> {
  const prefs: Record<string, unknown> = {};

  // Framework
  if (/next\.?js/i.test(message)) prefs.framework = 'nextjs';
  else if (/react/i.test(message)) prefs.framework = 'react';
  else if (/vue/i.test(message)) prefs.framework = 'vue';
  else if (/svelte/i.test(message)) prefs.framework = 'svelte';

  // Stil
  if (/tailwind/i.test(message)) prefs.styling = 'tailwind';
  else if (/styled.?component/i.test(message)) prefs.styling = 'styled-components';
  else if (/css.?module/i.test(message)) prefs.styling = 'css-modules';

  // Dil
  if (/typescript|ts/i.test(message)) prefs.language = 'typescript';
  else if (/javascript|js/i.test(message)) prefs.language = 'javascript';

  // Renk
  const colorMatch = message.match(/#([0-9a-f]{6})/i);
  if (colorMatch) prefs.primaryColor = '#' + colorMatch[1];

  return prefs;
}

/**
 * Örnek prompt önerileri (kullanıcı boş ekran gördüğünde)
 */
export const SUGGESTED_PROMPTS = [
  {
    title: 'SaaS Dashboard',
    prompt: 'Multi-tenant SaaS yönetim paneli tasarla. Kullanıcı yönetimi, billing, analytics içersin.',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Kurumsal API',
    prompt: 'Express.js ile kurumsal REST API tasarla. JWT auth, rate limiting, OpenAPI dokümantasyonu, OWASP korumalı.',
    icon: 'Server',
  },
  {
    title: 'TOGAF Mimari',
    prompt: 'TOGAF 10 ADM metodolojisine göre bu projenin mimarisini tasarla. 8 fazın çıktılarını üret.',
    icon: 'Building2',
  },
  {
    title: 'AI Agent',
    prompt: 'ReAct pattern AI agent geliştir. Function calling, memory, planning destekli olsun. TypeScript.',
    icon: 'Bot',
  },
  {
    title: 'E-Ticaret',
    prompt: 'PCI-DSS uyumlu e-ticaret ödeme akışı tasarla. Stripe entegrasyonu, 3D Secure, fraud detection.',
    icon: 'ShoppingCart',
  },
  {
    title: 'Mobil App',
    prompt: 'React Native ile cross-platform mobil app tasarla. Offline-first, push notification, biometric auth.',
    icon: 'Smartphone',
  },
];

/**
 * Bir sohbet mesajını "smart" şekilde işle
 */
export async function smartChat(
  userMessage: string,
  context: ChatContext
): Promise<SmartChatResponse> {
  const systemPrompt = buildSystemPrompt(context);

  // API call — server-side
  const res = await fetch('/api/deepseek/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: context.userPreferences?.model || 'deepseek-v4-pro',
      temperature: 0.4,
      max_tokens: 4000,
      stream: false,
      projectId: context.projectId,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  const parsed = parseSmartResponse(content);
  if (parsed) return parsed;

  return {
    type: 'complete',
    message: content,
  };
}
