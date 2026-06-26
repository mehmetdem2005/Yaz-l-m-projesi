/**
 * DeepSeek API Client — Çoklu model desteği
 *
 * Desteklenen modeller:
 * - deepseek-chat (V3.2) — genel amaçlı, hızlı, ucuz
 * - deepseek-reasoner (R1) — derin muhakeme, matematik, debug
 * - deepseek-v4-pro — yeni premium model, kurumsal karmaşık işler
 * - deepseek-v4-flash — yeni hızlı model, ucuz, basit istekler
 *
 * Özellikler:
 * - Streaming (SSE)
 * - Function calling
 * - Multi-turn conversation
 * - Fallback chain
 * - Token & cost tracking
 */

export type DeepSeekModel =
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'deepseek-v4-pro'
  | 'deepseek-v4-flash';

export interface ModelInfo {
  id: DeepSeekModel;
  name: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  inputPricePer1M: number; // USD
  outputPricePer1M: number; // USD
  tags: string[];
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsJsonMode: boolean;
  bestFor: string[];
  releaseDate: string;
  maturity: 'stable' | 'beta' | 'preview';
}

export const DEEPSEEK_MODELS: ModelInfo[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat (V3.2)',
    description: 'Genel amaçlı sohbet ve kod üretimi için dengeli model. Hızlı, ekonomik ve geniş kullanım alanına sahip.',
    contextWindow: 128_000,
    maxOutput: 8_192,
    inputPricePer1M: 0.27,
    outputPricePer1M: 1.10,
    tags: ['general', 'fast', 'cheap', 'code'],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    bestFor: ['Günlük kod üretimi', 'Hızlı prototip', 'Refactoring', 'Dokümantasyon'],
    releaseDate: '2025-09',
    maturity: 'stable',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner (R1)',
    description: 'Derin muhakeme için optimize edilmiş model. Karmaşık matematik, mimari tasarım ve zor debug senaryoları için ideal.',
    contextWindow: 128_000,
    maxOutput: 32_768,
    inputPricePer1M: 0.55,
    outputPricePer1M: 2.19,
    tags: ['reasoning', 'math', 'deep', 'expert'],
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsJsonMode: false,
    bestFor: ['Karmaşık mimari', 'Matematiksel hesap', 'Zor bug fixing', 'Algoritma tasarımı'],
    releaseDate: '2025-01',
    maturity: 'stable',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Yeni nesil premium model. Kurumsal standartlarda, en derin matematiksel işleri ve Google/Amazon ölçeğinde mimari sorunları çözebilen amiral model.',
    contextWindow: 256_000,
    maxOutput: 32_768,
    inputPricePer1M: 2.50,
    outputPricePer1M: 10.00,
    tags: ['premium', 'flagship', 'enterprise', 'reasoning', 'multimodal'],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    bestFor: ['Kurumsal mimari tasarımı', 'TOGAF/ISO uyumlu planlama', 'Multi-step agent', 'Karmaşık refactor'],
    releaseDate: '2026-Q1',
    maturity: 'beta',
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    description: 'Yeni nesil hızlı model. V4 Pro mimarisinin蒸馏 edilmiş versiyonu; yüksek throughput, düşük latency, ekonomik fiyat.',
    contextWindow: 128_000,
    maxOutput: 8_192,
    inputPricePer1M: 0.18,
    outputPricePer1M: 0.60,
    tags: ['fast', 'cheap', 'distilled', 'production'],
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsJsonMode: true,
    bestFor: ['Real-time autocomplete', 'Yüksek hacimli batch', 'CI/CD integration', 'Hızlı prototype'],
    releaseDate: '2026-Q1',
    maturity: 'preview',
  },
];

export function getModelInfo(id: DeepSeekModel): ModelInfo | undefined {
  return DEEPSEEK_MODELS.find((m) => m.id === id);
}

export function recommendModel(scenario: string): DeepSeekModel {
  const s = scenario.toLowerCase();
  if (s.includes('matematik') || s.includes('mimari') || s.includes('kurumsal') || s.includes('togaf')) {
    return 'deepseek-v4-pro';
  }
  if (s.includes('hızlı') || s.includes('autocomplete') || s.includes('batch') || s.includes('real-time')) {
    return 'deepseek-v4-flash';
  }
  if (s.includes('debug') || s.includes('muhakeme') || s.includes('algoritma')) {
    return 'deepseek-reasoner';
  }
  return 'deepseek-chat';
}

// ---------- API Client ----------

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionRequest {
  model: DeepSeekModel;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: FunctionTool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  response_format?: { type: 'json_object' };
  stop?: string[];
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekClientOptions {
  apiKey?: string;
  defaultModel?: DeepSeekModel;
  timeoutMs?: number;
  maxRetries?: number;
}

export class DeepSeekClient {
  private apiKey: string;
  private defaultModel: DeepSeekModel;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(opts: DeepSeekClientOptions = {}) {
    this.apiKey =
      opts.apiKey ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
      '';
    this.defaultModel = opts.defaultModel || 'deepseek-reasoner';
    this.timeoutMs = opts.timeoutMs || 120_000;
    this.maxRetries = opts.maxRetries || 2;
  }

  hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async chat(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.hasApiKey()) {
      throw new Error(
        'DeepSeek API key eksik. Lütfen Settings bölümünden API keyinizi girin.'
      );
    }

    const body: ChatCompletionRequest = {
      model: req.model || this.defaultModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      top_p: req.top_p ?? 1.0,
      stream: false,
      ...req,
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) {
          const text = await res.text();
          if (res.status === 429 && attempt < this.maxRetries) {
            // Exponential backoff
            await sleep(Math.pow(2, attempt) * 1000);
            continue;
          }
          throw new Error(`DeepSeek API ${res.status}: ${text}`);
        }
        return (await res.json()) as ChatCompletionResponse;
      } catch (err) {
        lastError = err as Error;
        if (attempt < this.maxRetries) {
          await sleep(Math.pow(2, attempt) * 500);
          continue;
        }
      }
    }
    throw lastError || new Error('DeepSeek API çağrısı başarısız');
  }

  /**
   * Streaming chat completion. SSE formatında chunk'lar üretir.
   * Her chunk: { delta: string, done: boolean, usage?: {...} }
   */
  async *chatStream(req: ChatCompletionRequest): AsyncGenerator<{
    delta: string;
    done: boolean;
    finishReason?: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  }> {
    if (!this.hasApiKey()) {
      throw new Error(
        'DeepSeek API key eksik. Lütfen Settings bölümünden API keyinizi girin.'
      );
    }

    const body: ChatCompletionRequest = {
      ...req,
      model: req.model || this.defaultModel,
      stream: true,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DeepSeek API ${res.status}: ${text}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Stream okunamıyor');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          yield { delta: '', done: true };
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            yield { delta: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices?.[0];
            const delta = choice?.delta?.content || '';
            const finishReason = choice?.finish_reason;
            const usage = parsed.usage;
            if (delta || finishReason) {
              yield {
                delta,
                done: false,
                finishReason,
                usage,
              };
            }
          } catch {
            // Geçersiz JSON, atla
          }
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Fallback chain: önce primary modeli dene, hata olursa sıradakine geç.
   */
  async chatWithFallback(
    req: Omit<ChatCompletionRequest, 'model'>,
    primary: DeepSeekModel,
    fallbacks: DeepSeekModel[] = []
  ): Promise<{ response: ChatCompletionResponse; modelUsed: DeepSeekModel }> {
    const chain = [primary, ...fallbacks];
    let lastError: Error | null = null;
    for (const model of chain) {
      try {
        const response = await this.chat({ ...req, model });
        return { response, modelUsed: model };
      } catch (err) {
        lastError = err as Error;
        continue;
      }
    }
    throw lastError || new Error('Tüm modeller başarısız');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Singleton client
let _client: DeepSeekClient | null = null;

export function getDeepSeekClient(): DeepSeekClient {
  if (!_client) {
    _client = new DeepSeekClient();
  }
  return _client;
}

export function resetDeepSeekClient(): void {
  _client = null;
}

// ---------- Maliyet hesaplama ----------

export function estimateCost(
  model: DeepSeekModel,
  tokensIn: number,
  tokensOut: number
): number {
  const info = getModelInfo(model);
  if (!info) return 0;
  return (
    (tokensIn / 1_000_000) * info.inputPricePer1M +
    (tokensOut / 1_000_000) * info.outputPricePer1M
  );
}
