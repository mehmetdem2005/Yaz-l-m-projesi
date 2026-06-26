import { NextRequest, NextResponse } from 'next/server';
import { getDeepSeekClient } from '@/lib/deepseek';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/inline-complete
 * Body: { prefix, suffix, language, maxTokens }
 *
 * AI inline kod tamamlama — Cursor benzeri
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prefix, suffix, language, maxTokens } = body as {
    prefix: string;
    suffix?: string;
    language: string;
    maxTokens?: number;
  };

  if (!prefix) {
    return NextResponse.json({ error: 'prefix gerekli' }, { status: 400 });
  }

  const setting = await db.setting.findUnique({ where: { key: 'deepseek_api_key' } });
  const client = getDeepSeekClient();
  if (setting?.value) client.setApiKey(setting.value);

  if (!client.hasApiKey()) {
    return NextResponse.json(
      { error: 'API key yok', completion: '' },
      { status: 401 }
    );
  }

  try {
    const systemPrompt = `Sen bir kod tamamlama asistanısın. Kullanıcının yazdığı koda bakarak en olası devamını üret.

Kurallar:
1. SADECE kodun devamını üret — açıklama, markdown, code block kullanma
2. Prefix'in bittiği yerden devam et, mantıklı birCompletion üret
3. Eğer suffix verildiyse, suffix ile uyumlu olmalı
4. Maksimum ${maxTokens || 100} token — kısa ve öz
5. Türkçe yorumları koru
6. Mevcut kod stilini devam ettir (indentation, naming convention)
7. Eğer mantıklı bir tamamlama yoksa boş string döndür

ÇIKTI: SADECE kod, başka hiçbir şey yok. Markdown, açıklama, code fence YASAK.`;

    const userPrompt = `Dil: ${language}

MEVCUT KOD (öncesi):
\`\`\`
${prefix.slice(-1500)}
\`\`\`

${suffix ? `SONRAKI KOD (sonrası):\n\`\`\`\n${suffix.slice(0, 500)}\n\`\`\`\n` : ''}

Bu kodun devamını üret (sadece kod):`;

    const response = await client.chat({
      model: 'deepseek-v4-flash', // hızlı model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: maxTokens || 150,
      stream: false,
    });

    const completion = response.choices[0].message.content || '';

    // Clean up — remove code fences if AI added them
    const cleaned = completion
      .replace(/^```[\w]*\n?/g, '')
      .replace(/\n?```$/g, '')
      .trim();

    return NextResponse.json({
      completion: cleaned,
      tokensUsed: response.usage.total_tokens,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message, completion: '' },
      { status: 500 }
    );
  }
}
