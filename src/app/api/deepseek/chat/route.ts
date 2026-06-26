import { NextRequest, NextResponse } from 'next/server';
import { getDeepSeekClient, DEEPSEEK_MODELS, type DeepSeekModel } from '@/lib/deepseek';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/deepseek/chat
 * Streaming chat completion
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      model,
      temperature,
      max_tokens,
      tools,
      tool_choice,
      projectId,
      stream = true,
    } = body as {
      messages: Array<{ role: string; content: string }>;
      model: DeepSeekModel;
      temperature?: number;
      max_tokens?: number;
      tools?: unknown[];
      tool_choice?: unknown;
      projectId?: string;
      stream?: boolean;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages gerekli' }, { status: 400 });
    }

    const setting = await db.setting.findUnique({ where: { key: 'deepseek_api_key' } });
    const client = getDeepSeekClient();
    if (setting?.value) {
      client.setApiKey(setting.value);
    }
    if (!client.hasApiKey()) {
      return NextResponse.json(
        {
          error:
            'DeepSeek API key eksik. Settings bölümünden API keyinizi girin veya DEEPSEEK_API_KEY env değişkenini ayarlayın.',
          code: 'NO_API_KEY',
        },
        { status: 401 }
      );
    }

    if (!stream) {
      const response = await client.chat({
        model: model || 'deepseek-reasoner',
        messages: messages as any,
        temperature,
        max_tokens,
        tools: tools as any,
        tool_choice: tool_choice as any,
      });

      if (projectId) {
        try {
          await db.message.create({
            data: {
              projectId,
              role: 'assistant',
              content: response.choices[0].message.content || '',
              modelUsed: model,
              tokensIn: response.usage.prompt_tokens,
              tokensOut: response.usage.completion_tokens,
            },
          });
        } catch {}
      }

      return NextResponse.json(response);
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const startTime = Date.now();
        let totalDelta = '';
        let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

        try {
          for await (const chunk of client.chatStream({
            model: model || 'deepseek-reasoner',
            messages: messages as any,
            temperature,
            max_tokens,
            tools: tools as any,
            tool_choice: tool_choice as any,
          })) {
            if (chunk.done) {
              controller.close();
              break;
            }
            if (chunk.delta) totalDelta += chunk.delta;
            if (chunk.usage) usage = chunk.usage;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  delta: chunk.delta,
                  finishReason: chunk.finishReason,
                  usage: chunk.usage,
                })}\n\n`
              )
            );
          }

          if (projectId) {
            try {
              await db.message.create({
                data: {
                  projectId,
                  role: 'assistant',
                  content: totalDelta,
                  modelUsed: model,
                  tokensIn: usage?.prompt_tokens,
                  tokensOut: usage?.completion_tokens,
                  latencyMs: Date.now() - startTime,
                },
              });
            } catch {}
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/**
 * GET /api/deepseek/chat — Tüm desteklenen modeller
 */
export async function GET() {
  return NextResponse.json({ models: DEEPSEEK_MODELS });
}
