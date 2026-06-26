/**
 * ReAct Agent Backend
 *
 * Thought → Action → Observation döngüsü
 * DeepSeek API + function calling + memory + planning
 */

import { DeepSeekClient, type ChatMessage, type FunctionTool, type DeepSeekModel } from './deepseek';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface AgentStep {
  step: number;
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  timestamp: Date;
}

export interface AgentRunOptions {
  model: DeepSeekModel;
  maxSteps: number;
  tools: AgentTool[];
  systemPrompt?: string;
  onStep?: (step: AgentStep) => void;
}

export class ReActAgent {
  private client: DeepSeekClient;
  private memory: ChatMessage[] = [];
  private steps: AgentStep[] = [];

  constructor(client: DeepSeekClient) {
    this.client = client;
  }

  getHistory(): ChatMessage[] {
    return [...this.memory];
  }

  getSteps(): AgentStep[] {
    return [...this.steps];
  }

  clearMemory() {
    this.memory = [];
    this.steps = [];
  }

  async run(input: string, opts: AgentRunOptions): Promise<string> {
    const systemPrompt =
      opts.systemPrompt ||
      `Sen bir ReAct agent'sın. Bir görevi tamamlamak için şu döngüyü izle:

1. THOUGHT: Görevi analiz et, bir sonraki adımı planla.
2. ACTION: Bir araç çağır (eğer gerekliyse). Format: { "tool": "isim", "args": {...} }
3. OBSERVATION: Araç çıktısını oku.
4. Tekrar THOUGHT... ya da FINAL_ANSWER.

JSON formatında cevap ver:
{ "thought": "...", "action": { "tool": "...", "args": {...} } | null, "final_answer": "..." | null }

Maksimum ${opts.maxSteps} adımda görevi tamamla.`;

    const tools: FunctionTool[] = opts.tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    this.memory.push({ role: 'user', content: input });

    for (let step = 1; step <= opts.maxSteps; step++) {
      // 1. LLM'den thought + action al
      const response = await this.client.chat({
        model: opts.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.memory,
        ],
        tools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 2000,
      });

      const assistantMsg = response.choices[0].message;
      this.memory.push(assistantMsg);

      // 2. Function call var mı?
      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        for (const call of assistantMsg.tool_calls) {
          const tool = opts.tools.find((t) => t.name === call.function.name);
          if (!tool) {
            const obs: AgentStep = {
              step,
              type: 'observation',
              content: `Bilinmeyen araç: ${call.function.name}`,
              timestamp: new Date(),
            };
            this.steps.push(obs);
            opts.onStep?.(obs);
            this.memory.push({
              role: 'tool',
              content: `Bilinmeyen araç: ${call.function.name}`,
              tool_call_id: call.id,
            });
            continue;
          }

          let args: Record<string, unknown>;
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            args = {};
          }

          // Action step
          const actionStep: AgentStep = {
            step,
            type: 'action',
            content: `${tool.name} çağrıldı`,
            toolName: tool.name,
            toolArgs: args,
            timestamp: new Date(),
          };
          this.steps.push(actionStep);
          opts.onStep?.(actionStep);

          // Execute
          const result = await tool.execute(args);

          // Observation step
          const obsStep: AgentStep = {
            step,
            type: 'observation',
            content: result,
            toolResult: result,
            timestamp: new Date(),
          };
          this.steps.push(obsStep);
          opts.onStep?.(obsStep);

          this.memory.push({
            role: 'tool',
            content: result,
            tool_call_id: call.id,
          });
        }
        continue; // döngü devam
      }

      // 3. Final answer
      const finalStep: AgentStep = {
        step,
        type: 'final',
        content: assistantMsg.content || '',
        timestamp: new Date(),
      };
      this.steps.push(finalStep);
      opts.onStep?.(finalStep);

      return assistantMsg.content || '';
    }

    throw new Error(`Agent ${opts.maxSteps} adımda görevi tamamlayamadı`);
  }
}

// ---------- Built-in Tools ----------

export function createFileTools(): AgentTool[] {
  const fileStore: Map<string, string> = new Map();

  return [
    {
      name: 'write_file',
      description: 'Belirtilen yola bir dosya yazar. Path mutlak ya da proje-relative olabilir.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Dosya yolu' },
          content: { type: 'string', description: 'Dosya içeriği' },
        },
        required: ['path', 'content'],
      },
      async execute(args) {
        const { path, content } = args as { path: string; content: string };
        fileStore.set(path, content);
        return `Yazıldı: ${path} (${content.length} karakter)`;
      },
    },
    {
      name: 'read_file',
      description: 'Belirtilen yoldaki dosyayı okur.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Dosya yolu' },
        },
        required: ['path'],
      },
      async execute(args) {
        const { path } = args as { path: string };
        const content = fileStore.get(path);
        if (!content) return `Dosya bulunamadı: ${path}`;
        return content;
      },
    },
    {
      name: 'list_files',
      description: 'Tüm kayıtlı dosyaları listeler.',
      parameters: { type: 'object', properties: {} },
      async execute() {
        const files = Array.from(fileStore.keys());
        return files.length === 0 ? 'Dosya yok' : files.join('\n');
      },
    },
    {
      name: 'delete_file',
      description: 'Belirtilen yoldaki dosyayı siler.',
      parameters: {
        type: 'object',
        properties: { path: { type: 'string' } },
        required: ['path'],
      },
      async execute(args) {
        const { path } = args as { path: string };
        if (fileStore.delete(path)) return `Silindi: ${path}`;
        return `Dosya yok: ${path}`;
      },
    },
  ];
}

export function createWebSearchTool(): AgentTool {
  return {
    name: 'web_search',
    description: 'Web araması yapar. Güncel bilgi gerektiğinde kullan.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Arama sorgusu' },
        max_results: { type: 'number', description: 'Maks. sonuç sayısı (varsayılan: 5)' },
      },
      required: ['query'],
    },
    async execute(args) {
      const { query } = args as { query: string };
      return `Web arama (simüle): "${query}" için sonuçlar. Gerçek API entegrasyonu gerekiyor.`;
    },
  };
}
