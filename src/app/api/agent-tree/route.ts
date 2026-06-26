import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  type AgentNode,
  type AgentEdge,
  topologicalSort,
  resolveInputs,
  BUILTIN_AGENT_TEMPLATES,
} from '@/lib/agent-tree';
import { getDeepSeekClient, type DeepSeekModel } from '@/lib/deepseek';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/agent-tree/run
 * Bir agent ağacını çalıştır (streaming SSE)
 *
 * Body: { name, nodes, edges, userInput, model, projectId }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    nodes,
    edges,
    userInput,
    model = 'deepseek-v4-pro',
    projectId,
  } = body as {
    name: string;
    nodes: AgentNode[];
    edges: AgentEdge[];
    userInput: string;
    model?: DeepSeekModel;
    projectId?: string;
  };

  if (!nodes || !userInput) {
    return NextResponse.json({ error: 'nodes ve userInput gerekli' }, { status: 400 });
  }

  // DB'de tree kaydı oluştur
  const tree = await db.agentTree.create({
    data: {
      name: name || 'Runtime Tree',
      projectId: projectId || null,
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges),
      status: 'running',
      startedAt: new Date(),
    },
  });

  const setting = await db.setting.findUnique({ where: { key: 'deepseek_api_key' } });
  const client = getDeepSeekClient();
  if (setting?.value) client.setApiKey(setting.value);

  // Topolojik sıralama
  const order = topologicalSort(nodes, edges);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outputs: Record<string, string> = {};

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: 'start', treeId: tree.id, order });

      try {
        for (const nodeId of order) {
          const node = nodeMap.get(nodeId);
          if (!node) continue;

          // Node başlıyor
          send({
            type: 'node_start',
            nodeId,
            node: { label: node.data.label, type: node.data.type, systemPrompt: node.data.systemPrompt },
          });

          // Input resolve et
          const resolvedInput = resolveInputs(node.data.inputs, {
            user_input: userInput,
            nodeOutputs: outputs,
          });

          if (!client.hasApiKey()) {
            // API key yoksa simülasyon modu
            await new Promise((r) => setTimeout(r, 800));
            const simOutput = `[SIMÜLASYON — API KEY GEREKLİ] ${node.data.label} node'u çalıştı.
Girdi: ${resolvedInput.slice(0, 200)}
System prompt: ${node.data.systemPrompt.slice(0, 200)}...`;
            outputs[nodeId] = simOutput;
            send({
              type: 'node_complete',
              nodeId,
              output: simOutput,
              tokensUsed: 0,
              cost: 0,
            });
            continue;
          }

          // API call
          try {
            const response = await client.chat({
              model: model as DeepSeekModel,
              messages: [
                { role: 'system', content: node.data.systemPrompt },
                { role: 'user', content: resolvedInput },
              ],
              temperature: node.data.temperature,
              max_tokens: node.data.maxTokens,
            });
            const output = response.choices[0].message.content || '';
            outputs[nodeId] = output;
            const tokensUsed = response.usage.total_tokens;
            send({
              type: 'node_complete',
              nodeId,
              output,
              tokensUsed,
              modelUsed: model,
            });
          } catch (err) {
            const errorMsg = (err as Error).message;
            send({ type: 'node_error', nodeId, error: errorMsg });
            outputs[nodeId] = `[HATA] ${errorMsg}`;
          }
        }

        // Tree tamamlandı
        await db.agentTree.update({
          where: { id: tree.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            results: JSON.stringify(outputs),
          },
        });

        send({ type: 'tree_complete', treeId: tree.id, outputs });
        controller.close();
      } catch (err) {
        send({ type: 'tree_error', error: (err as Error).message });
        await db.agentTree.update({
          where: { id: tree.id },
          data: { status: 'error' },
        });
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

/** GET — Built-in templates + runtime trees */
export async function GET() {
  const trees = await db.agentTree.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({
    builtin: BUILTIN_AGENT_TEMPLATES,
    runtime: trees.map((t) => ({
      ...t,
      nodes: JSON.parse(t.nodes || '[]'),
      edges: JSON.parse(t.edges || '[]'),
      results: t.results ? JSON.parse(t.results) : null,
    })),
  });
}
