import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDeepSeekClient, type DeepSeekModel } from '@/lib/deepseek';
import { ReActAgent, createFileTools } from '@/lib/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/agent/run
 * Streaming agent execution (SSE)
 *
 * Body: { projectId, input, model, maxSteps }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, input, model = 'deepseek-v4-pro', maxSteps = 8 } = body as {
    projectId: string;
    input: string;
    model?: DeepSeekModel;
    maxSteps?: number;
  };

  if (!input) return NextResponse.json({ error: 'input gerekli' }, { status: 400 });

  const setting = await db.setting.findUnique({ where: { key: 'deepseek_api_key' } });
  const client = getDeepSeekClient();
  if (setting?.value) client.setApiKey(setting.value);
  if (!client.hasApiKey()) {
    return NextResponse.json({ error: 'DeepSeek API key eksik' }, { status: 401 });
  }

  // Proje dosyalarını agent tool'larına yükle
  let projectFiles: { path: string; content: string }[] = [];
  if (projectId) {
    const files = await db.file.findMany({ where: { projectId } });
    projectFiles = files.map((f) => ({ path: f.path, content: f.content }));
  }

  const fileTools = createFileTools();
  // Pre-load existing files
  for (const f of projectFiles) {
    await fileTools[0].execute({ path: f.path, content: f.content }); // write_file
  }

  const agent = new ReActAgent(client);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const finalAnswer = await agent.run(input, {
          model,
          maxSteps,
          tools: fileTools,
          onStep: (step) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(step)}\n\n`)
            );
          },
        });

        // Final answer'ı da yolla
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'final_answer', content: finalAnswer })}\n\n`
          )
        );

        // Agent'ın oluşturduğu dosyaları DB'ye kaydet
        if (projectId) {
          const listResult = await fileTools[2].execute({}); // list_files
          // Burada dosya senkronizasyonu yapılabilir
        }

        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
