# AI Agent Backend Standartları — Kapsamlı Araştırma

> Bu doküman, AI Kod Üretici stüdyosu (DeepSeek App Studio) için agent backend mimarisini
> belirlemek amacıyla hazırlanmıştır. Hedef; ReAct + Function Calling + Memory + Planning
> pattern'lerini standartlara uygun şekilde birleştiren, production-ready bir backend
> tasarlamak için gereken tüm bilgileri tek yerde toplamaktır.

Tarih: 2026-06-21
Yazar: Research subagent (Agent backend)
Sürüm: 1.0

---

## 1. AI Agent Nedir?

### 1.1 Tanım

AI Agent, bir **hedefe ulaşmak için bağımsız olarak reasoning (akıl yürütme), planlama,
araç kullanımı ve karar verme** yeteneklerini sergileyen LLM-tabanlı bir sistemdir.
Temel bileşenleri:

1. **LLM çekirdeği** — Düşünme motoru (DeepSeek, GPT, Claude, vb.)
2. **Tools / Functions** — Dış dünya ile etkileşim (API çağrısı, dosya, DB, web search)
3. **Memory** — Kısa ve uzun süreli hafıza
4. **Planning modülü** — Görev ayrıştırma, planlama
5. **Loop / Orchestrator** — Kontrol akışını yöneten döngü
6. **Observability** — Trace, log, metrik

Resmi tanım (Anthropic): *"Agents ... dynamically direct their own processes and tool
usage, maintaining control over how they accomplish tasks."*

### 1.2 LLM vs Agent Farkı

| Özellik | LLM (Chat Model) | Agent |
|---|---|---|
| Etkileşim | Tek seferlik prompt → response | Çok adımlı döngü |
| Karar verme | Pasif, kullanıcı yönlendirir | Otonom, kendi karar verir |
| Araç kullanımı | Yok | Function calling, tool use |
| Hafıza | Sadece context window | Short + long-term memory |
| Durum yönetimi | Stateless | Stateful (session, task state) |
| Hata yönetimi | Tekrar deneme yok | Retry, fallback, self-correction |
| Maliyet | Tek inference | Multi-step → token maliyeti yüksek |
| Latency | Saniyeler | Dakikalar (task'a göre) |
| Use case | Soru-cevap, summarization | Otonom görev gerçekleştirme |

**Kural:** Bir kullanıcı tek bir istek yapıp tek bir cevap bekliyorsa bu LLM'dir.
Sistem kendi başına bir hedefe ulaşmak için birden fazla adım atıyorsa bu agent'tır.

### 1.3 Agent Architectures Overview

Yaygın mimariler (karmaşıklığa göre sıralı):

1. **Single-step / Stateless LLM Call** — En basit, agent değil
2. **ReAct Loop** — Thought → Action → Observation döngüsü
3. **Plan-and-Execute** — Önce plan, sonra sıralı execute
4. **Reflexion** — Self-evaluation ile gelişen agent
5. **Tree of Thoughts** — Branching ile arama
6. **Multi-Agent Systems** — Agent'lar arası iş birliği
7. **LATS** — MCTS + LLM kombinasyonu

Bu mimarilerin her biri farklı maliyet/performans/elevation trade-off'ları sunar.

---

## 2. Agent Mimari Patternleri

### 2.1 ReAct (Reasoning + Acting)

#### Thought → Action → Observation Döngüsü

ReAct, 2022'de Yao et al. tarafından önerilmiştir. LLM'in **sırasıyla reasoning ve
acting yapmasını** sağlar. Temel insight: sadece reasoning (Chain-of-Thought) dış dünya
ile etkileşimden yoksundur; sadece acting (tool use) ise hatalı kararlar verebilir.

Döngü:

```
1. Thought: Kullanıcı X istedi. Önce Y'yi bilmeliyim.
2. Action: search("Y")
3. Observation: Y = 42
4. Thought: Şimdi Z'yi hesaplayabilirim.
5. Action: calculate(42 * 2)
6. Observation: 84
7. Thought: Cevap hazır.
8. Final Answer: 84
```

#### Pseudocode Örneği

```typescript
interface ReActStep {
  thought: string;
  action?: { name: string; input: string };
  observation?: string;
}

async function reactLoop(
  query: string,
  tools: Map<string, (input: string) => Promise<string>>,
  maxIterations: number = 10
): Promise<string> {
  const steps: ReActStep[] = [];
  let scratchpad = `Question: ${query}\n`;

  for (let i = 0; i < maxIterations; i++) {
    const prompt = buildReActPrompt(scratchpad);
    const response = await llm.complete(prompt);

    const step = parseReActResponse(response);
    steps.push(step);
    scratchpad += `Thought: ${step.thought}\n`;

    if (step.action) {
      const tool = tools.get(step.action.name);
      if (!tool) {
        scratchpad += `Observation: Tool '${step.action.name}' not found.\n`;
        continue;
      }
      const observation = await tool(step.action.input);
      scratchpad += `Action: ${step.action.name}(${step.action.input})\n`;
      scratchpad += `Observation: ${observation}\n`;
      step.observation = observation;
    } else {
      // Final answer
      return step.thought;
    }
  }

  throw new Error("Max iterations reached without final answer");
}
```

#### Avantaj / Dezavantaj

| Avantaj | Dezavantaj |
|---|---|
| Basit ve yorumlanabilir | Token israfı (thought'lar uzun) |
| Tool use ile reasoning birleşir | Loop'a girebilir (fixasyon) |
| İyileştirilmiş hata düzeltme | Latency yüksek |
| İnce ayar gerektirmez | Sub-optimal planlama |

### 2.2 Plan-and-Execute

#### Planning Phase → Execution Phase

Plan-and-Execute, ReAct'in zayıf yönü olan **uzun vadeli planlama** eksikliğini giderir.
İki aşamalı çalışır:

1. **Planner:** Görevi alt görevlere böl (tek seferlik)
2. **Executor:** Her alt görevi sırayla çalıştır
3. **Re-planner (opsiyonel):** Ara sonuçlara göre planı güncelle

```
User: "Build a todo app with auth"
Planner:
  1. Set up Next.js project
  2. Configure Prisma + SQLite
  3. Create User model + auth endpoints
  4. Create Todo model + CRUD endpoints
  5. Build UI components
  6. Test end-to-end

Executor: her adımı ReAct ile çalıştırır
```

#### LangChain Plan-and-Execute Agent

```python
from langchain_experimental.plan_and_execute import (
    PlanAndExecute, load_agent_executor, load_chat_planner
)

planner = load_chat_planner(llm)
executor = load_agent_executor(llm, tools, verbose=True)
agent = PlanAndExecute(planner=planner, executor=executor)
agent.invoke({"input": "Build a TODO app with auth"})
```

Avantaj: Azaltılmış token kullanımı, daha iyi uzun-vadeli planlama.
Dezavantaj: Hata durumunda tüm planı yeniden yapmak gerekir.

### 2.3 Reflexion

#### Self-Reflection Loop

Reflexion (Shinn et al., 2023), agent'ın **kendi performansını değerlendirmesi ve
hatalarından öğrenmesi** prensibine dayanır. Üç bileşeni vardır:

1. **Actor** — Görevi yapan (ReAct gibi)
2. **Evaluator** — Sonucu değerlendiren
3. **Self-Reflection** — Hatalardan ders çıkaran, memory'e yazan

```
Trial 1: Actor -> Fail
Evaluator: "Test X failed because missing null check"
Self-Reflection: "I should add null checks before method calls"
Trial 2: Actor (with reflection memory) -> Success
```

#### Memory-Enhanced Agent

```typescript
interface ReflectionMemory {
  trial: number;
  task: string;
  outcome: "success" | "failure";
  reflection: string;
  lesson: string;
}

async function reflexionLoop(task: string, maxTrials = 3) {
  const reflections: ReflectionMemory[] = [];

  for (let trial = 0; trial < maxTrials; trial++) {
    const trajectory = await actor(task, reflections);
    const score = await evaluator(task, trajectory);

    if (score.success) return trajectory;

    const reflection = await selfReflect(task, trajectory, score);
    reflections.push({
      trial, task,
      outcome: "failure",
      reflection: reflection.text,
      lesson: reflection.lesson,
    });
  }
}
```

### 2.4 Tree of Thoughts (ToT)

#### Branching Exploration

ToT (Yao et al., 2023), Chain-of-Thought'un genelleştirilmiş halidir. LLM aynı anda
**birden çok düşünce dalı** üretir, her dalı değerlendirir ve en umut verici olanı
genişletir (BFS/DFS ile).

```
                    [Problem]
                   /    |    \
              [Idea1] [Idea2] [Idea3]
              /   \      |
         [1a] [1b]   [2a]
              |
            [1b-i]   <- En iyi yol
```

Adımlar:
1. **Thought decomposition** — Problemi düşünce adımlarına böl
2. **Thought generation** — Her state için N aday düşünce üret
3. **State evaluation** — Her state'i puanla (value / vote)
4. **Search algorithm** — BFS, DFS, A* ile ara
5. **Termination** — Çözüm bulundu veya budget bitti

Maliyet: ToT, standart CoT'den 5-10x daha pahalıdır. Matematik, bulmaca gibi
**well-defined problems** için idealdir.

### 2.5 Multi-Agent

#### Patternler

| Pattern | Açıklama | Örnek |
|---|---|---|
| Hierarchical | Manager → workers | Manager agent, developer/reviewer agent'ları yönetir |
| Sequential | A → B → C | Yaz → Review → Test |
| Parallel | A, B, C aynı anda | 3 farklı perspektiften analiz |
| Peer-to-peer | Eşit agent'lar iletişimde | Debate, brainstorming |
| Debate | Karşıt görüşlü agent'lar | Red team vs Blue team |
| Swarm | Merkeziyetsiz koordinasyon | OpenAI Swarm handoff |

**Hierarchical örnek:**

```
         [Orchestrator]
         /      |      \
   [Researcher] [Coder] [Reviewer]
        |          |        |
   [Web]      [Exec]    [Linter]
```

**Sequential örnek (CrewAI):**

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Researcher",
    goal="Find relevant info",
    backstory="Expert researcher...",
    tools=[search_tool]
)
writer = Agent(
    role="Writer",
    goal="Write article based on research",
    backstory="Senior writer..."
)

research_task = Task(description="...", agent=researcher)
write_task = Task(description="...", agent=writer)

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task])
result = crew.kickoff()
```

### 2.6 LATS (Language Agent Tree Search)

#### MCTS + LLM

LATS (Zhou et al., 2023), Monte Carlo Tree Search (MCTS) ile LLM'leri birleştirir.
ReAct'in kararlı halidir.

Adımlar:
1. **Selection** — UCB ile node seç
2. **Expansion** — Yeni action'lar üret
3. **Simulation** — Roll-out (sonuna kadar git)
4. **Backpropagation** — Sonuçları yukarı taşı
5. **Reflection** — Hatalardan ders çıkar

LATS, kod tamirat (SWE-bench) gibi zor görevlerde ReAct'ten %20+ daha iyi performans
gösterir. Ancak maliyet 10-50x daha yüksektir.

---

## 3. Function Calling & Tool Use Standartları

### 3.1 OpenAI Function Calling

#### JSON Schema Based

OpenAI, Mart 2023'te function calling'ı standartlaştırdı. Model, JSON Schema ile
tanımlanmış fonksiyonları çağırabilir.

Ana parametreler:
- `tools` — Fonksiyon tanımları (JSON Schema)
- `tool_choice` — `"auto"`, `"none"`, `"required"`, veya `{"type": "function", "function": {"name": "..."}}`
- `parallel_tool_calls` — Birden fazla tool paralel

#### Kod Örneği (TypeScript)

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] }
        },
        required: ["city"],
        additionalProperties: false
      },
      strict: true  // Schema adherence
    }
  },
  {
    type: "function",
    function: {
      name: "execute_code",
      description: "Execute TypeScript code in sandbox",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string" },
          language: { type: "string", enum: ["typescript", "python"] }
        },
        required: ["code"],
        additionalProperties: false
      },
      strict: true
    }
  }
];

async function runAgent(query: string) {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: query }
  ];

  for (let i = 0; i < 10; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      parallel_tool_calls: true
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    if (!msg.tool_calls?.length) {
      return msg.content;
    }

    // Execute all tool calls in parallel
    const results = await Promise.all(
      msg.tool_calls.map(async (call) => {
        const args = JSON.parse(call.function.arguments);
        const result = await executeTool(call.function.name, args);
        return { id: call.id, result };
      })
    );

    for (const { id, result } of results) {
      messages.push({
        role: "tool",
        tool_call_id: id,
        content: JSON.stringify(result)
      });
    }
  }
}

async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_weather":
      return { city: args.city, temp: 22, unit: "celsius" };
    case "execute_code":
      return await runInSandbox(args.code, args.language);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

**Strict mode (2024):** `strict: true` ile model **kesin olarak** şemaya uyar — bu,
production'da zorunludur.

### 3.2 Anthropic Tool Use

#### Tool Use Blocks

Anthropic Claude, Mart 2024'te native tool use desteği duyurdu. OpenAI'den farkı:
- Mesaj içeriği **block'lardan** oluşur (text, tool_use, tool_result)
- `tool_choice` benzer ama syntax farklı
- Streaming tool use blocks desteği

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description: "Get current weather",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string" }
      },
      required: ["city"]
    }
  }
];

async function runClaudeAgent(query: string) {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: query }
  ];

  for (let i = 0; i < 10; i++) {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      tools,
      messages
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      return extractText(response.content);
    }

    const toolResults: Anthropic.MessageParam[] = [{
      role: "user",
      content: response.content
        .filter(c => c.type === "tool_use")
        .map(tc => ({
          type: "tool_result",
          tool_use_id: tc.id,
          content: JSON.stringify(executeTool(tc.name, tc.input))
        }))
    }];
    messages.push(...toolResults);
  }
}
```

**Beta headers:** Bazı özellikler `anthropic-beta: tools-2024-04-04` header'ı gerektirir.

### 3.3 DeepSeek Function Calling

#### DeepSeek'in Function Calling Desteği

DeepSeek-V3 ve sonrası modeller native function calling destekler. API, OpenAI ile
**tamamen uyumlu** (drop-in replacement), bu sayede `openai` SDK ile
`baseURL: "https://api.deepseek.com"` kullanılabilir.

DeepSeek'in avantajları:
- OpenAI API ile %100 uyumlu
- 10-100x daha ucuz (GPT-4'e göre)
- `deepseek-chat` ve `deepseek-reasoner` modelleri
- Tool use stable (V3+)

#### Kod Örneği

```typescript
import OpenAI from "openai";

// DeepSeek ile OpenAI SDK kullanımı
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: any) => Promise<any>;
}

class DeepSeekAgent {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  async run(query: string, maxIterations = 10): Promise<string> {
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful coding agent. Today: ${new Date().toISOString()}.`
      },
      { role: "user", content: query }
    ];

    for (let i = 0; i < maxIterations; i++) {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages,
        tools: Array.from(this.tools.values()).map(t => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters
          }
        })),
        tool_choice: "auto",
        temperature: 0.1  // Deterministik
      });

      const msg = response.choices[0].message;
      messages.push(msg);

      console.log(`[Iter ${i}] Tokens: ${response.usage.total_tokens}`);

      if (!msg.tool_calls?.length) {
        return msg.content ?? "";
      }

      // Paralel tool execution
      await Promise.all(
        msg.tool_calls.map(async (call) => {
          const tool = this.tools.get(call.function.name);
          if (!tool) throw new Error(`Unknown tool: ${call.function.name}`);

          const args = JSON.parse(call.function.arguments);
          const result = await tool.handler(args);

          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result)
          });
        })
      );
    }

    throw new Error("Max iterations reached");
  }
}

// Kullanım
const agent = new DeepSeekAgent();

agent.registerTool({
  name: "read_file",
  description: "Read a file from disk",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Absolute file path" }
    },
    required: ["path"]
  },
  handler: async (args) => {
    const fs = await import("fs/promises");
    return { content: await fs.readFile(args.path, "utf-8") };
  }
});

agent.registerTool({
  name: "write_file",
  description: "Write content to file",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
      content: { type: "string" }
    },
    required: ["path", "content"]
  },
  handler: async (args) => {
    const fs = await import("fs/promises");
    await fs.writeFile(args.path, args.content, "utf-8");
    return { success: true, bytes: args.content.length };
  }
});

agent.registerTool({
  name: "exec_command",
  description: "Execute shell command (sandboxed)",
  parameters: {
    type: "object",
    properties: {
      command: { type: "string" },
      cwd: { type: "string" }
    },
    required: ["command"]
  },
  handler: async (args) => {
    const { execa } = await import("execa");
    const result = await execa(args.command, {
      shell: true,
      cwd: args.cwd,
      timeout: 30000
    });
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode
    };
  }
});

const result = await agent.run("Create a hello world Express app in /tmp/hello");
console.log(result);
```

**DeepSeek-Reasoner ile tool use:** Reasoner model, function calling'i destekler ama
**düşünme adımları** (`reasoning_content`) ekstra token tüketir. Tool use senaryolarında
`deepseek-chat` tercih edilir, complex reasoning için `deepseek-reasoner`.

---

## 4. Protokol Standartları

### 4.1 MCP (Model Context Protocol) — Anthropic

MCP, Kasım 2024'te Anthropic tarafından开源landı. **"AI uygulamaları için USB-C"**
olarak tanımlanır — her LLM'in her tool ile standart yolla konuşmasını sağlar.

#### Server / Client Mimari

```
┌─────────────┐      JSON-RPC 2.0      ┌─────────────┐
│  MCP Client │ ◄───────────────────► │  MCP Server │
│  (LLM app)  │   stdio / HTTP+SSE    │  (tools)    │
└─────────────┘                        └─────────────┘
        │
        ▼
   [LLM Core]
```

- **MCP Host** — AI uygulaması (Claude Desktop, Cursor, kendi app'iniz)
- **MCP Client** — Host içinde, server ile protokol konuşan modül
- **MCP Server** — Tools, resources, prompts sunan bağımsız süreç

#### Resources, Tools, Prompts Primitives

| Primitive | Açıklama | Kontrol | Örnek |
|---|---|---|---|
| **Resources** | Veri kaynakları (read-only) | User-controlled | `/file/path`, `db://schema` |
| **Tools** | Fonksiyonlar (side-effect'li) | Model-controlled | `search_web`, `send_email` |
| **Prompts** | Hazır prompt şablonları | User-controlled | `/summarize`, `/debug` |

#### JSON-RPC 2.0

MCP, JSON-RPC 2.0 kullanır:

```json
// Client → Server (request)
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "city": "Istanbul" }
  }
}

// Server → Client (response)
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "22°C, sunny" }
    ]
  }
}
```

#### Transport: stdio, HTTP+SSE

| Transport | Kullanım | Avantaj | Dezavantaj |
|---|---|---|---|
| **stdio** | Local process | Basit, hızlı | Sadece local |
| **HTTP+SSE** | Remote | Ağ üzerinden, dağıtık | Daha karmaşık |
| **Streamable HTTP** (yeni) | Remote | Tek connection | Yeni standart |

#### Örnek MCP Server Kodu (TypeScript)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

const server = new Server(
  { name: "filesystem-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Tool listeleme
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "read_file",
      description: "Read a file from the filesystem",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Absolute path to file" }
        },
        required: ["path"]
      }
    },
    {
      name: "list_directory",
      description: "List directory contents",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" }
        },
        required: ["path"]
      }
    },
    {
      name: "write_file",
      description: "Write content to a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" }
        },
        required: ["path", "content"]
      }
    }
  ]
}));

// Tool çağırma
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "read_file": {
      const content = await fs.readFile(args.path, "utf-8");
      return {
        content: [{ type: "text", text: content }]
      };
    }
    case "list_directory": {
      const entries = await fs.readdir(args.path, { withFileTypes: true });
      const listing = entries.map(e => 
        `${e.isDirectory() ? "📁" : "📄"} ${e.name}`
      ).join("\n");
      return {
        content: [{ type: "text", text: listing }]
      };
    }
    case "write_file": {
      await fs.mkdir(path.dirname(args.path), { recursive: true });
      await fs.writeFile(args.path, args.content, "utf-8");
      return {
        content: [{ type: "text", text: `Written ${args.content.length} bytes to ${args.path}` }]
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Server'ı başlat
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Filesystem MCP Server running on stdio");
```

#### Örnek MCP Client Kodu

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function createMCPClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./mcp-server.js"]
  });

  const client = new Client(
    { name: "my-ai-app", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  // Tool'ları listele
  const { tools } = await client.listTools();
  console.log("Available tools:", tools.map(t => t.name));

  // Tool çağır
  const result = await client.callTool({
    name: "read_file",
    arguments: { path: "/tmp/test.txt" }
  });

  console.log("Result:", result.content[0].text);

  await client.close();
  return client;
}
```

#### MCP Registry, Official Servers List

Anthropic resmi server'ları (github.com/modelcontextprotocol/servers):
- **filesystem** — Dosya sistemi
- **git** — Git repo işlemleri
- **github** — GitHub API
- **postgres** — PostgreSQL sorgu
- **sqlite** — SQLite sorgu
- **puppeteer** — Browser automation
- **brave-search** — Web search
- **google-maps** — Harita
- **slack** — Slack API
- **memory** — Knowledge graph memory

Topluluk server'ları: 1000+ server MCP registry'lerinde mevcut (mcp.so, smithery.ai).

### 4.2 A2A (Agent-to-Agent) Protocol — Google

A2A, Nisan 2025'te Google tarafından açıklandı. MCP **agent-tool** iletişimini
standartlaştırırken, A2A **agent-agent** iletişimini standartlaştırır.

#### Agent Cards

Her agent bir **Agent Card** yayınlar — JSON formatında capability ilanı:

```json
{
  "name": "research-agent",
  "description": "Researches topics using web search",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "push_notifications": true,
    "state_transition": true
  },
  "skills": [
    {
      "id": "web_research",
      "name": "Web Research",
      "description": "Search and synthesize web content",
      "tags": ["research", "web", "search"],
      "input_modes": ["text"],
      "output_modes": ["text", "file"]
    }
  ],
  "authentication": {
    "schemes": ["bearer", "api_key"]
  },
  "endpoints": {
    "tasks": "https://agent.example.com/a2a/tasks",
    "stream": "https://agent.example.com/a2a/stream"
  }
}
```

#### Tasks Lifecycle

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ submitted │ → │ working  │ → │ input-  │ → │ completed │
└─────────┘     └──────────┘     │ required │     └──────────┘
                     │           └─────────┘
                     ▼
                ┌──────────┐
                │  failed   │
                └──────────┘
```

State'ler: `submitted`, `working`, `input-required`, `completed`, `failed`, `canceled`.

#### Streaming Support

```typescript
// A2A streaming (SSE)
async function streamA2ATask(taskId: string) {
  const response = await fetch(`https://agent.example.com/a2a/tasks/${taskId}/stream`, {
    headers: { "Accept": "text/event-stream" }
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // SSE formatında parça parça
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        console.log("Update:", event);
      }
    }
  }
}
```

#### Örnek Implementasyon

```python
# Python A2A server örneği (google-a2a SDK)
from a2a.server import A2AServer
from a2a.types import AgentCard, AgentSkill

skill = AgentSkill(
    id="code_review",
    name="Code Review",
    description="Reviews code for bugs and best practices"
)

card = AgentCard(
    name="code-reviewer-agent",
    description="Reviews code",
    skills=[skill],
    capabilities={"streaming": True}
)

server = A2AServer(card)

@server.on_task
async def handle_task(task):
    # Task işle
    yield {"status": "working"}
    result = await review_code(task.input)
    yield {"status": "completed", "result": result}

server.run(port=8080)
```

### 4.3 AGNTCY / Agent Network Protocol

AGNTCY (Agent Network Protocol), Cisco, LangChain, Galileo tarafından desteklenen
açık kaynak bir multi-vendor agent mesh standardıdır. Amaç: farklı vendor'ların
agent'larının (OpenAI, Google, Anthropic, kendi agent'lar) birbiriyle konuşabilmesi.

Bileşenler:
- **Agent Directory** — Agent discovery, capability search
- **Agent Mesh** — Routing, load balancing
- **Identity & Auth** — Agent kimlik doğrulama (OIDC tabanlı)
- **Schema Registry** — Ortak mesaj şemaları

```
[Vendor A Agent] ────┐
[Vendor B Agent] ────┼──► [AGNTCY Mesh] ────► [Vendor C Agent]
[Custom Agent]  ────┘
```

AGNTCY hala erken aşamada ama EEA (Enterprise Ethereum Alliance) benzeri bir governance
modeliyle ilerliyor.

### 4.4 OpenAI Swarm (experimental)

OpenAI Swarm, Ekim 2024'te **experimental** olarak yayınlandı. Lightweight multi-agent
orchestration için minimal bir framework. Production için **değil**, eğitim amaçlı.

#### Handoff Function

```python
from swarm import Swarm, Agent

client = Swarm()

def transfer_to_billing():
    return billing_agent

def transfer_to_tech_support():
    return tech_agent

triage_agent = Agent(
    name="Triage Agent",
    instructions="Route users to correct department",
    functions=[transfer_to_billing, transfer_to_tech_support]
)

billing_agent = Agent(
    name="Billing Agent",
    instructions="Handle billing inquiries"
)

tech_agent = Agent(
    name="Tech Support",
    instructions="Handle technical issues"
)

response = client.run(
    agent=triage_agent,
    messages=[{"role": "user", "content": "I have a billing question"}]
)

print(response.messages[-1]["content"])
# Triage → otomatik olarak billing_agent'a handoff yapar
```

**Not:** Swarm yerine Mart 2025'te **OpenAI Agents SDK** (production) yayınlandı.

---

## 5. Agent Framework'leri

### 5.1 LangGraph

LangGraph (LangChain), **graph tabanlı** agent orkestrasyonudur. State makinesi olarak
agent davranışını modelleyerek karmaşık workflow'lar kurmaya olanak tanır.

#### StateGraph

```typescript
import { StateGraph, END, START } from "@langchain/langgraph";

interface AgentState {
  messages: BaseMessage[];
  tools: Tool[];
  iterations: number;
}

// Node tanımları
const callModel = async (state: AgentState) => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const callTools = async (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const results = await Promise.all(
    lastMessage.tool_calls.map(call => executeTool(call))
  );
  return { messages: results };
};

// Conditional routing
const shouldContinue = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  return lastMessage.tool_calls?.length ? "tools" : END;
};

// Graph kurulumu
const workflow = new StateGraph({
  channels: agentStateSchema
});

workflow.addNode("agent", callModel);
workflow.addNode("tools", callTools);

workflow.addEdge(START, "agent");
workflow.addConditionalEdges("agent", shouldContinue);
workflow.addEdge("tools", "agent");

const app = workflow.compile({
  checkpointer: memoryCheckpointer
});
```

#### Nodes, Edges, Conditional Routing

- **Nodes** — Fonksiyonlar (state alır, state döner)
- **Edges** — Node'lar arası geçişler
- **Conditional edges** — State'e göre dinamik routing
- **Parallel fan-out** — Aynı anda birden çok node

#### Memory (Checkpointer)

```typescript
import { MemorySaver } from "@langchain/langgraph";

const memorySaver = new MemorySaver();
const app = workflow.compile({ checkpointer: memorySaver });

// Konfigürasyon ile thread ID
const config = { configurable: { thread_id: "user-123-session-1" } };

await app.invoke({ messages: [{ role: "user", content: "Merhaba!" }] }, config);
// Sonraki çağrı önceki mesajları hatırlar
await app.invoke({ messages: [{ role: "user", content: "Adımı hatırlıyor musun?" }] }, config);
```

Checkpointer backend'leri: In-memory, SQLite, Postgres, Redis.

#### Human-in-the-loop

```typescript
const app = workflow.compile({
  checkpointer: memory,
  interrupt_before: ["sensitive_action"]  // Bu node'da durur
});

const result = await app.invoke(input, config);

// İnsan onayı
const approval = await askHuman(result);
if (approval) {
  await app.invoke(null, config);  // Devam et
}
```

### 5.2 OpenAI Agents SDK (2025)

Mart 2025'te Swarm'ın yerini aldı. Production-ready, dört ana kavram:
**Agents, Handoffs, Guardrails, Tools, Sessions, Tracing**.

```python
from agents import Agent, Runner, function_tool, handoff

@function_tool
def get_weather(city: str) -> str:
    """Get weather for a city"""
    return f"Weather in {city}: 22°C, sunny"

@function_tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email"""
    # SMTP logic
    return f"Email sent to {to}"

# Billing agent'a handoff
def billing_handoff():
    return billing_agent

triage = Agent(
    name="Triage",
    instructions="You triage user requests. Hand off to billing when needed.",
    tools=[get_weather],
    handoffs=[billing_handoff]
)

billing = Agent(
    name="Billing",
    instructions="You handle billing.",
    tools=[send_email]
)

# Guardrails
from agents import GuardrailFunctionOutput, InputGuardrail

async def check_toxicity(ctx, agent, input):
    is_toxic = await toxicity_classifier(input)
    return GuardrailFunctionOutput(
        output_info={"toxic": is_toxic},
        tripwire_triggered=is_toxic
    )

agent = Agent(
    name="Safe Agent",
    instructions="...",
    input_guardrails=[check_toxicity]
)

# Runner
result = await Runner.run(triage, "What's the weather in Istanbul?")
print(result.final_output)
```

Özellikler:
- **Tracing** — Built-in OpenTelemetry tracing
- **Sessions** — Stateful conversation management
- **Streamed output** — Token-by-token streaming
- **Tool use** — `@function_tool` decorator ile kolay tanım

### 5.3 AutoGen (Microsoft)

AutoGen, Microsoft Research tarafından geliştirilen **multi-agent conversation**
framework'üdür.

```python
from autogen import ConversableAgent, GroupChatManager, config_list_from_json

config_list = config_list_from_json("OAI_CONFIG_LIST")

# Researcher agent
researcher = ConversableAgent(
    name="Researcher",
    system_message="You research topics and provide data.",
    llm_config={"config_list": config_list},
    human_input_mode="NEVER"
)

# Coder agent
coder = ConversableAgent(
    name="Coder",
    system_message="You write Python code based on research.",
    llm_config={"config_list": config_list},
    human_input_mode="NEVER"
)

# Critic agent
critic = ConversableAgent(
    name="Critic",
    system_message="You review code and suggest improvements.",
    llm_config={"config_list": config_list},
    human_input_mode="NEVER"
)

# Group chat
group_chat = GroupChatManager(
    agents=[researcher, coder, critic],
    messages=[],
    max_round=10
)

# Başlat
coder.initiate_chat(
    group_chat,
    message="Build a sentiment analysis script"
)
```

**Code Executor:** AutoGen, kodu Docker container içinde çalıştırabilir:

```python
from autogen.coding import DockerCommandLineCodeExecutor

executor = DockerCommandLineCodeExecutor(
    image="python:3.11-slim",
    timeout=60,
    work_dir="/tmp/coding"
)
await executor.start()
# ... kod çalıştır ...
await executor.stop()
```

### 5.4 CrewAI

CrewAI, **role-based multi-agent** framework'üdür. "Ekibin (crew) içinde herkesin rolü
vardır" felsefesi.

```python
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool

@tool
def search_web(query: str) -> str:
    """Search the web"""
    return duckduckgo_search(query)

@tool
def write_file(path: str, content: str) -> str:
    """Write file to disk"""
    with open(path, "w") as f:
        f.write(content)
    return f"Written {path}"

researcher = Agent(
    role="Senior Researcher",
    goal="Uncover cutting-edge developments in AI agents",
    backstory="You are a meticulous researcher with 20 years experience.",
    tools=[search_web],
    verbose=True,
    allow_delegation=False
)

writer = Agent(
    role="Tech Writer",
    goal="Write engaging blog posts about AI",
    backstory="You are a Pulitzer-nominated tech writer.",
    tools=[write_file],
    verbose=True
)

research_task = Task(
    description="Research the latest agent frameworks in 2025",
    expected_output="A bullet list of 5 frameworks with pros/cons",
    agent=researcher
)

write_task = Task(
    description="Write a 1000-word blog post based on the research",
    expected_output="A markdown file at /tmp/blog.md",
    agent=writer,
    output_file="/tmp/blog.md"
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff()
```

Process tipleri: `sequential`, `hierarchical`, `consensual`.

### 5.5 LlamaIndex Agents

```python
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import FunctionTool

def multiply(a: float, b: float) -> float:
    """Multiply two numbers"""
    return a * b

def add(a: float, b: float) -> float:
    """Add two numbers"""
    return a + b

multiply_tool = FunctionTool.from_defaults(fn=multiply)
add_tool = FunctionTool.from_defaults(fn=add)

llm = OpenAI(model="gpt-4o-mini")
agent = ReActAgent.from_tools(
    [multiply_tool, add_tool],
    llm=llm,
    verbose=True,
    max_iterations=10
)

response = agent.chat("What is (3 + 5) * 2?")
print(response)
```

**AgentWorker / AgentRunner pattern:** LlamaIndex, modüler agent tasarımı sunar.
`AgentRunner` orkestrasyonu yönetir, `AgentWorker` her bir adımı.

### 5.6 Karşılaştırma Tablosu

| Framework | Dil | Learning Curve | Multi-Agent | Memory | Streaming | Production | Maliyet |
|---|---|---|---|---|---|---|---|
| **LangGraph** | Py/TS | Orta-Yüksek | ✅ (graph) | ✅ (checkpointer) | ✅ | ✅ | Açık kaynak |
| **OpenAI Agents SDK** | Py | Düşük | ✅ (handoff) | ✅ (sessions) | ✅ | ✅ | Açık kaynak |
| **AutoGen** | Py | Orta | ✅ (group chat) | ✅ | ✅ | ✅ (v0.4) | Açık kaynak |
| **CrewAI** | Py | Düşük | ✅ (roles) | ⚠️ Sınırlı | ✅ | ✅ | Açık kaynak |
| **LlamaIndex** | Py/TS | Orta | ⚠️ Sınırlı | ✅ | ✅ | ✅ | Açık kaynak |
| **MCP** | Multi | Düşük | N/A | N/A | ✅ | ✅ | Açık kaynak |
| **Smolagents (HF)** | Py | Düşük | ⚠️ Sınırlı | ✅ | ✅ | ⚠️ Yeni | Açık kaynak |
| **Haystack 2.x** | Py | Orta-Yüksek | ⚠️ Sınırlı | ✅ | ✅ | ✅ | Açık kaynak |
| **Semantic Kernel** | Py/C#/Java | Yüksek | ✅ | ✅ | ✅ | ✅ | Açık kaynak |
| **PydanticAI** | Py | Düşük | ⚠️ Sınırlı | ✅ | ✅ | ✅ (yeni) | Açık kaynak |

**Seçim rehberi:**
- **Kolay başlangıç, prototip:** CrewAI, PydanticAI
- **Production, kontrol:** LangGraph, OpenAI Agents SDK
- **Multi-agent ekip çalışması:** AutoGen, CrewAI
- **Kod agent (code execution):** AutoGen, Smolagents
- **Standart tool entegrasyonu:** MCP

---

## 6. Memory & State Yönetimi

### 6.1 Short-term Memory

#### Conversation Buffer

En basit yöntem — tüm konuşmayı context window'da tut:

```typescript
class ConversationBuffer {
  private messages: Message[] = [];

  add(message: Message) {
    this.messages.push(message);
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear() {
    this.messages = [];
  }
}
```

Avantaj: Basit. Dezavantaj: Token limit dolunca kırılır.

#### Sliding Window

Son N mesajı tut:

```typescript
class SlidingWindow {
  constructor(private maxSize: number = 20) {}

  trim(messages: Message[]): Message[] {
    if (messages.length <= this.maxSize) return messages;
    // İlk system mesajı her zaman kalır
    const system = messages.filter(m => m.role === "system");
    const rest = messages.filter(m => m.role !== "system");
    return [...system, ...rest.slice(-this.maxSize + system.length)];
  }
}
```

#### Token-based Trimming

```typescript
import { encodingForModel } from "js-tiktoken";

class TokenTrimmer {
  constructor(
    private maxTokens: number = 8000,
    private model: string = "gpt-4o-mini"
  ) {}

  trim(messages: Message[]): Message[] {
    const encoder = encodingForModel(this.model);
    const system = messages.filter(m => m.role === "system");
    const rest = messages.filter(m => m.role !== "system").reverse();

    let tokenCount = system.reduce(
      (sum, m) => sum + encoder.encode(JSON.stringify(m)).length, 0
    );

    const kept: Message[] = [];
    for (const msg of rest) {
      const msgTokens = encoder.encode(JSON.stringify(msg)).length;
      if (tokenCount + msgTokens > this.maxTokens) break;
      kept.unshift(msg);
      tokenCount += msgTokens;
    }

    return [...system, ...kept];
  }
}
```

### 6.2 Long-term Memory

#### Vector DB (Pinecone, Qdrant, Chroma, Weaviate)

```typescript
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({ url: "http://localhost:6333" });

class VectorMemory {
  constructor(private collection: string = "agent_memory") {}

  async init() {
    await qdrant.createCollection(this.collection, {
      vectors: { size: 1536, distance: "Cosine" }
    });
  }

  async add(content: string, metadata: Record<string, any>) {
    const embedding = await embed(content);
    await qdrant.upsert(this.collection, {
      points: [{
        id: crypto.randomUUID(),
        vector: embedding,
        payload: { content, ...metadata, timestamp: Date.now() }
      }]
    });
  }

  async search(query: string, topK = 5) {
    const embedding = await embed(query);
    const results = await qdrant.search(this.collection, {
      vector: embedding,
      limit: topK,
      with_payload: true
    });
    return results.map(r => r.payload);
  }
}

// Kullanım
const memory = new VectorMemory();
await memory.add("Kullanıcı Python tercih ediyor", { type: "preference" });
const results = await memory.search("Hangi dil kullanmalıyım?");
```

| Vector DB | Tip | Kurulum | Performans | Hybrid Search | Lisans |
|---|---|---|---|---|---|
| Pinecone | SaaS | Kolay | Yüksek | ✅ | Commercial |
| Qdrant | Self/SaaS | Orta | Yüksek | ✅ | Apache 2.0 |
| Chroma | Embedded | Çok kolay | Orta | ⚠️ | Apache 2.0 |
| Weaviate | Self/SaaS | Orta | Yüksek | ✅ | BSD-3 |
| pgvector | Postgres | Orta | Orta | ✅ | PostgreSQL |
| Milvus | Self | Zor | Çok yüksek | ✅ | Apache 2.0 |

#### Knowledge Graph (Neo4j)

İlişkisel bilgi için ideal:

```cypher
// Kullanıcı tercih ekle
CREATE (u:User {id: "user-123"})-[:PREFERS]->(l:Language {name: "Python"})

// İlgili bilgi çek
MATCH (u:User {id: "user-123"})-[:PREFERS]->(l:Language)
MATCH (l)<-[:WRITTEN_IN]-(p:Project)
RETURN p
```

#### Hybrid Memory

Vector + keyword + graph kombinasyonu. **BM25 + vector + reranker** en yaygın pattern.

```typescript
async function hybridRetrieve(query: string) {
  const [vectorResults, keywordResults] = await Promise.all([
    vectorMemory.search(query, 20),
    bm25Search(query, 20)
  ]);

  // RRF (Reciprocal Rank Fusion) ile birleştir
  const fused = reciprocalRankFusion([vectorResults, keywordResults]);

  // Cross-encoder rerank
  const reranked = await crossEncoderRerank(query, fused, 5);
  return reranked;
}
```

### 6.3 Memory Patterns

| Pattern | İçerik | Kullanım |
|---|---|---|
| **Reflection memory** | "Geçen sefer hata yaptım çünkü..." | Reflexion agent |
| **Episodic memory** | Geçmiş olaylar | Deneyim aktarımı |
| **Semantic memory** | Genel bilgi | Knowledge base |
| **Procedural memory** | "Nasıl yapılır" | Skill library |

```typescript
interface MemoryEntry {
  type: "reflection" | "episodic" | "semantic" | "procedural";
  content: string;
  timestamp: number;
  relevance: number;
  metadata: Record<string, any>;
}
```

---

## 7. Planning & Task Decomposition

### 7.1 Chain-of-Thought (CoT)

"Let's think step by step" promptu ile reasoning adımlarını açığa çıkar:

```
Prompt: "If I have 3 apples and give 1 to friend, then buy 2 more,
         how many do I have? Let's think step by step."

Response:
  Step 1: Start with 3 apples
  Step 2: Give 1 → 3 - 1 = 2
  Step 3: Buy 2 → 2 + 2 = 4
  Answer: 4
```

**Zero-shot CoT:** Sadece "think step by step" ekleyin.
**Few-shot CoT:** Örneklerde adım adım düşünce gösterin.

### 7.2 Self-Ask

Model kendi alt sorularını sorar:

```
Q: When was the founder of Tesla born?
Self-Ask:
  Follow up: Who founded Tesla?
  Intermediate answer: Martin Eberhard and Marc Tarpenning (later Elon Musk)
  Follow up: When was Elon Musk born?
  Intermediate answer: June 28, 1971
Final answer: June 28, 1971 (Elon Musk)
```

### 7.3 Least-to-Most Prompting

Önce en basit alt problemi çöz, sonrakini önceki cevapla çöz:

```
Q: Bir restoranda 4 kişi için 200 TL hesap, %15 bahşiş,
   ve herkes eşit ödüyor. Her kişi ne kadar öder?

Sub-Q1: 200 TL'nin %15'i kaç?
  A1: 30 TL
Sub-Q2: Toplam (hesap + bahşiş)?
  A2: 230 TL
Sub-Q3: 4 kişiye böl?
  A3: 57.5 TL
```

### 7.4 Decomposition Prompting

Görevi parçalara böl:

```typescript
async function decompose(task: string): Promise<SubTask[]> {
  const prompt = `
Task: ${task}

Decompose this task into subtasks. Return JSON array.
Each subtask: { id, description, depends_on[] }
`;
  const response = await llm.complete(prompt);
  return JSON.parse(response);
}
```

### 7.5 Plan-of-Thought

Planlama sürecini explicit yap:

```
PLAN:
1. Identify required data sources
2. Fetch data from source A
3. Fetch data from source B
4. Cross-reference data
5. Generate report

EXECUTE:
Step 1: Need weather API and calendar API
Step 2: Call weather API...
```

---

## 8. Observability & Tracing

### 8.1 LangSmith

LangChain'in SaaS observability aracı. Otomatik trace, eval, dataset yönetimi.

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls__..."
os.environ["LANGCHAIN_PROJECT"] = "my-agent"

# Tüm LangChain çağrıları otomatik trace
```

### 8.2 Langfuse (Open Source)

Self-hostable observability:

```typescript
import Langfuse from "langfuse";

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL  // self-hosted URL
});

const trace = langfuse.trace({
  name: "agent-execution",
  userId: "user-123"
});

const generation = trace.generation({
  name: "llm-call",
  model: "deepseek-chat",
  input: query,
  metadata: { tools: ["read_file", "exec_command"] }
});

const response = await deepseek.chat.completions.create({...});

generation.end({
  output: response.choices[0].message,
  usage: response.usage,
  level: "DEBUG"
});

await langfuse.flushAsync();
```

### 8.3 OpenTelemetry for LLMs

OpenTelemetry standardı LLM observability için genişletildi (OpenInference, OpenLLMetry):

```typescript
import { trace, context } from "@opentelemetry/api";

const tracer = trace.getTracer("agent");

async function tracedLLMCall(prompt: string) {
  const span = tracer.startSpan("llm.chat", {
    attributes: {
      "llm.system": "deepseek",
      "llm.model": "deepseek-chat",
      "llm.prompts": JSON.stringify([prompt]),
      "gen_ai.operation.name": "chat"
    }
  });

  try {
    const response = await deepseek.chat.completions.create({...});
    span.setAttribute("llm.token_count.prompt", response.usage.prompt_tokens);
    span.setAttribute("llm.token_count.completion", response.usage.completion_tokens);
    span.setAttribute("llm.token_count.total", response.usage.total_tokens);
    return response;
  } catch (e) {
    span.recordException(e);
    span.setStatus({ code: 2, message: e.message });
    throw e;
  } finally {
    span.end();
  }
}
```

### 8.4 Arize Phoenix

Open-source LLM observability, OpenTelemetry-native. Local UI ile görselleştirme.

#### Trace, Span, Generation

- **Trace** — Bir kullanıcı isteğinin tüm yolculuğu
- **Span** — Bir fonksiyon çağrısı (LLM, tool, retrieval)
- **Generation** — LLM çağrısı span'ı (input, output, tokens, cost)

#### Cost Tracking

```typescript
const MODEL_PRICING = {
  "deepseek-chat": { input: 0.00027, output: 0.0011 },  // USD / 1K tokens
  "deepseek-reasoner": { input: 0.00055, output: 0.00219 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 }
};

function calculateCost(model: string, usage: { prompt_tokens: number; completion_tokens: number }) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (
    (usage.prompt_tokens / 1000) * pricing.input +
    (usage.completion_tokens / 1000) * pricing.output
  );
}
```

#### Quality Metrics

- **Faithfulness** — Cevap context'e sadık mı
- **Answer relevance** — Cevap soruyla ilgili mi
- **Context precision** — Doğru context çekildi mi
- **Context recall** — Tüm gerekli context var mı
- **Task success rate** — Görev başarıldı mı

---

## 9. Evaluation & Testing

### 9.1 LLM-as-Judge

Bir LLM, başka bir LLM'in çıktısını değerlendirir:

```typescript
async function llmJudge(question: string, answer: string, reference: string) {
  const prompt = `
You are evaluating an AI assistant's response.

Question: ${question}
Reference Answer: ${reference}
Assistant Answer: ${answer}

Score 1-5 on:
1. Correctness
2. Completeness
3. Clarity

Return JSON: { correctness, completeness, clarity, explanation }
`;
  const response = await llm.complete(prompt);
  return JSON.parse(response);
}
```

**Bias'lar:** Position bias (ilk cevabı tercih), length bias (uzun cevabı tercih),
self-preference (kendi türünü tercih). Mitigasyon: randomize, average, multiple judges.

### 9.2 RAG Metrics (faithfulness, relevance, context precision)

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness, answer_relevancy,
    context_precision, context_recall
)
from datasets import Dataset

dataset = Dataset.from_dict({
    "question": ["What is X?"],
    "answer": ["X is..."],
    "contexts": [["Context 1", "Context 2"]],
    "ground_truth": ["X is officially..."]
})

result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)
print(result)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88, ...}
```

### 9.3 AgentBench

Agent'ların **genel yeteneklerini** ölçen benchmark. Kategoriler:
- Reasoning (math, logic)
- Code generation (Python, SQL)
- Tool use (API çağrıları)
- Web browsing
- Game playing

### 9.4 SWE-bench

**Software engineering** tasks. Gerçek GitHub issue'ları + test'ler:
- 2294 task
- Model, patch üretir
- Test'ler geçerse başarılı

SWE-bench Lite (300 task) ve SWE-bench Verified (500 task) daha kolay varyantlar.

### 9.5 Trajectory Evaluation

Agent'ın tüm yolculuğunu (sıra ile yapılan aksiyonlar) değerlendirme:

```typescript
interface TrajectoryStep {
  thought: string;
  action: string;
  observation: string;
  timestamp: number;
}

async function evaluateTrajectory(
  trajectory: TrajectoryStep[],
  goal: string,
  expectedSteps: string[]
): Promise<TrajectoryEval> {
  return {
    efficiency: expectedSteps.length / trajectory.length,  // 0-1, 1 ideal
    success: await checkGoalAchieved(trajectory, goal),
    redundancy: countRepeatedActions(trajectory) / trajectory.length,
    cost: sumTokens(trajectory),
    duration: trajectory[trajectory.length - 1].timestamp - trajectory[0].timestamp
  };
}
```

---

## 10. Safety & Guardrails

### 10.1 NeMo Guardrails (NVIDIA)

```python
from nemoguardrails import LLMRails, RailsConfig

config = RailsConfig.from_path("./config")
rails = LLMRails(config)

# config/flows.co
define user ask about competitors
  "how does your product compare to X?"
  "is X better?"

define bot refuse competitor comparison
  "I can only discuss our own products."

# Kullanım
response = rails.generate(messages=[{
    "role": "user",
    "content": "How does X compare to your product?"
}])
# Otomatik refuse
```

### 10.2 Guardrails AI

```python
from guardrails import Guard
from guardrails.hub import ProfanityFree, ToxicLanguage

guard = Guard().use_many(
    ProfanityFree(),
    ToxicLanguage(threshold=0.8)
)

output = guard(
    llm_api=openai.chat.completions.create,
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "..."}]
)
```

### 10.3 Llama Guard

Meta'nın input/output classifier'ı:

```python
from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="meta-llama/LlamaGuard-7b",
    device="cuda"
)

result = classifier("User input here")
# {'label': 'safe', 'score': 0.99} veya {'label': 'unsafe', ...}
```

Kategoriler: Violence, Hate, Sexual, Harassment, Self-harm, vb.

### 10.4 Constitutional AI

Anthropic'in yaklaşımı — model kendi çıktısını bir **anayasa** ile değerlendirir:

```
Constitution:
1. Be helpful and harmless
2. Don't provide dangerous info
3. Be honest about uncertainty

Step 1: Generate response
Step 2: Critique against constitution
Step 3: Revise
Step 4: Final output
```

### 10.5 Red Teaming Strategies

- **Prompt injection test** — "Ignore previous instructions..."
- **Jailbreak attempts** — DAN, role-play, encoding tricks
- **PII leakage** — Kişisel veri sızdırma
- **Hallucination probing** — Uydurma bilgi
- **Bias testing** — Demografik bias
- **Adversarial examples** — Edge case'ler
- **Tool abuse** — Tool'ları kötüye kullanma

---

## 11. Production Patterns

### 11.1 Streaming Responses

```typescript
async function* streamAgent(query: string) {
  const stream = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: query }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

// SSE endpoint
app.get("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of streamAgent(req.query.q)) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  }
  res.end();
});
```

### 11.2 Async Execution

```typescript
// Long-running agent task
app.post("/api/agent/run", async (req, res) => {
  const taskId = crypto.randomUUID();
  
  // Hemen response dön
  res.json({ taskId, status: "queued" });

  // Background'da çalış
  setImmediate(async () => {
    await updateTaskStatus(taskId, "running");
    try {
      const result = await agent.run(req.body.query);
      await updateTaskStatus(taskId, "completed", result);
    } catch (e) {
      await updateTaskStatus(taskId, "failed", { error: e.message });
    }
  });
});

// Polling endpoint
app.get("/api/agent/status/:taskId", async (req, res) => {
  const task = await getTask(req.params.taskId);
  res.json(task);
});
```

### 11.3 Caching (Semantic Cache)

```typescript
class SemanticCache {
  constructor(private vectorDb: VectorMemory, private threshold = 0.95) {}

  async get(query: string): Promise<string | null> {
    const results = await this.vectorDb.search(query, 1);
    if (results.length && results[0].score >= this.threshold) {
      console.log(`Cache hit (score: ${results[0].score})`);
      return results[0].content;
    }
    return null;
  }

  async set(query: string, response: string) {
    await this.vectorDb.add(response, { query, type: "cache" });
  }
}

// Kullanım
const cache = new SemanticCache(vectorMemory);
const cached = await cache.get(query);
if (cached) return cached;
const response = await agent.run(query);
await cache.set(query, response);
```

### 11.4 Rate Limiting per Agent

```typescript
import RateLimiter from "rate-limiter-flexible";

const rateLimiters = new Map<string, RateLimiter>();

function getLimiter(agentId: string) {
  if (!rateLimiters.has(agentId)) {
    rateLimiters.set(agentId, new RateLimiter({
      points: 100,        // 100 requests
      duration: 3600,     // per hour
      keyPrefix: `agent:${agentId}`
    }));
  }
  return rateLimiters.get(agentId)!;
}

async function rateLimitedRun(agentId: string, query: string) {
  await getLimiter(agentId).consume("global", 1);
  return agent.run(query);
}
```

### 11.5 Fallback Chains (Model A → B → C)

```typescript
interface ModelConfig {
  model: string;
  maxTokens: number;
  timeout: number;
  costPer1K: number;
}

const FALLBACK_CHAIN: ModelConfig[] = [
  { model: "deepseek-chat", maxTokens: 8000, timeout: 30000, costPer1K: 0.00027 },
  { model: "deepseek-reasoner", maxTokens: 16000, timeout: 60000, costPer1K: 0.00055 },
  { model: "gpt-4o-mini", maxTokens: 16000, timeout: 45000, costPer1K: 0.00015 }
];

async function runWithFallback(prompt: string): Promise<string> {
  for (const config of FALLBACK_CHAIN) {
    try {
      return await withTimeout(
        callModel(config, prompt),
        config.timeout
      );
    } catch (e) {
      console.warn(`Model ${config.model} failed: ${e.message}`);
    }
  }
  throw new Error("All models failed");
}
```

### 11.6 Cost Optimization

- **Model routing** — Basit iş → küçük model, zor iş → büyük model
- **Prompt caching** — Anthropic, OpenAI'de 5dk-1sa cache
- **Semantic cache** — Benzer sorgular için
- **Batch API** — OpenAI, Anthropic %50 indirim
- **Output token budget** — `max_tokens` ile sınır
- **Tool result compression** — Uzun sonuçları özetle

### 11.7 Token Budgeting

```typescript
class TokenBudget {
  private spent = 0;
  constructor(private limit: number) {}

  canSpend(tokens: number): boolean {
    return this.spent + tokens <= this.limit;
  }

  spend(tokens: number) {
    if (!this.canSpend(tokens)) {
      throw new Error(`Token budget exceeded: ${this.spent + tokens} > ${this.limit}`);
    }
    this.spent += tokens;
  }

  remaining(): number {
    return this.limit - this.spent;
  }
}

const budget = new TokenBudget(100_000);
// Her LLM çağrısından sonra:
// budget.spend(usage.total_tokens);
```

### 11.8 Human-in-the-loop Checkpoints

```typescript
type CheckpointReason = "high_cost" | "destructive" | "sensitive_data" | "manual_approval";

async function checkpoint(reason: CheckpointReason, context: any) {
  const approval = await askHumanApproval(reason, context);
  if (!approval.approved) {
    throw new Error(`Checkpoint rejected: ${approval.reason}`);
  }
}

// Kullanım
if (estimatedCost > 1.0) {
  await checkpoint("high_cost", { cost: estimatedCost });
}
if (action === "delete_file") {
  await checkpoint("destructive", { path: args.path });
}
```

### 11.9 Idempotency

```typescript
class IdempotencyStore {
  private cache = new Map<string, any>();

  async run(key: string, fn: () => Promise<any>) {
    if (this.cache.has(key)) {
      console.log(`Idempotent hit: ${key}`);
      return this.cache.get(key);
    }
    const result = await fn();
    this.cache.set(key, result);
    return result;
  }
}

// Deterministic key oluşturma
function makeKey(toolName: string, args: any): string {
  return `${toolName}:${stableStringify(args)}`;
}

// Kullanım
const result = await idempotencyStore.run(
  makeKey("read_file", { path }),
  () => readFile(path)
);
```

### 11.10 Error Recovery

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    backoff: "linear" | "exponential";
    onRetry?: (error: Error, attempt: number) => void;
  }
): Promise<T> {
  let lastError: Error;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === options.maxAttempts) break;
      
      const delay = options.backoff === "exponential"
        ? Math.pow(2, attempt) * 1000
        : attempt * 1000;
      
      options.onRetry?.(e, attempt);
      await sleep(delay);
    }
  }
  throw lastError;
}

// Self-correction pattern
async function selfCorrect(agent: Agent, error: Error, context: any) {
  const correctionPrompt = `
Previous attempt failed with: ${error.message}

Context: ${JSON.stringify(context)}

Analyze the error and suggest a corrected approach.
`;
  const correction = await agent.llm.complete(correctionPrompt);
  return agent.run(correction);
}
```

---

## 12. AI Stüdyosu İçin Önerilen Mimari

### 12.1 Pattern Kombinasyonu

**ReAct + Plan-and-Execute Hybrid:**

```
User Request
    │
    ▼
[Planner LLM] ───► Plan (alt görevler listesi)
    │
    ▼
[ReAct Executor] ───► Her alt görev için:
    │                    Thought → Action → Observation
    │
    ▼
[Verifier] ───► Sub-task başarılı mı?
    │
    ├─ Yes ───► Sonraki alt görev
    │
    └─ No  ───► Re-planner (planı güncelle) → ReAct
    │
    ▼
[Final Summary]
```

### 12.2 DeepSeek ile Function Calling

- **Ana model:** `deepseek-chat` — Tool use, hızlı
- **Reasoning modeli:** `deepseek-reasoner` — Planlama, zor problem
- **API:** OpenAI SDK ile baseURL değişik (`https://api.deepseek.com`)
- **Cost:** GPT-4'ten 10-50x ucuz

### 12.3 Memory: SQLite + Vector

```
Short-term (SQLite):
  - conversations table (session_id, messages JSON)
  - task_state table (task_id, status, plan, current_step)
  - tool_results table (cache)

Long-term (Vector — Chroma embedded):
  - user preferences
  - project patterns
  - error lessons (reflexion)
```

### 12.4 Planning: ReAct + Plan-and-Execute Hybrid

```typescript
class HybridAgent {
  async run(goal: string): Promise<string> {
    const plan = await this.plan(goal);
    const results: string[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      try {
        const result = await this.reactExecute(step);
        results.push(result);
      } catch (e) {
        // Re-plan
        const newPlan = await this.replan(goal, plan, i, e);
        plan.steps = [...plan.steps.slice(0, i), ...newPlan.steps];
        i--;  // Retry current
      }
    }

    return this.summarize(results);
  }
}
```

### 12.5 Tools: File System, Code Execution, Web Search, Version Control

| Tool | Kullanım | Güvenlik |
|---|---|---|
| `read_file` | Dosya okuma | Chroot jail |
| `write_file` | Dosya yazma | Whitelist path |
| `exec_command` | Shell | Docker, timeout, seccomp |
| `web_search` | Web arama | Rate limit, domain filter |
| `git_commit` | Versiyon kontrol | Signed commits |
| `git_diff` | Diff görme | Read-only |
| `search_code` | Code search | Sadece workspace |

### 12.6 Observability: Langfuse (Self-hosted) veya Basit Log

Self-hosted Langfuse önerilir:
- Docker Compose ile tek komut kurulum
- PostgreSQL backend
- Trace + eval + dataset
- Türkçe UI desteği yok ama İngilizce yeterli

Alternatif basit log:
```typescript
const logger = {
  trace: (event: string, data: any) => {
    console.log(JSON.stringify({ ts: Date.now(), event, ...data }));
  }
};
```

### 12.7 Guardrails: Input/Output Filter

```typescript
class Guardrail {
  async checkInput(input: string): Promise<{ allowed: boolean; reason?: string }> {
    if (containsPII(input)) {
      return { allowed: false, reason: "PII detected" };
    }
    if (await isToxic(input)) {
      return { allowed: false, reason: "Toxic content" };
    }
    if (containsPromptInjection(input)) {
      return { allowed: false, reason: "Prompt injection detected" };
    }
    return { allowed: true };
  }

  async checkOutput(output: string): Promise<{ allowed: boolean; reason?: string }> {
    if (containsSecrets(output)) {
      return { allowed: false, reason: "Secrets leaked" };
    }
    return { allowed: true };
  }
}

// Pipeline
const inputCheck = await guardrail.checkInput(userQuery);
if (!inputCheck.allowed) throw new Error(inputCheck.reason);
const result = await agent.run(userQuery);
const outputCheck = await guardrail.checkOutput(result);
if (!outputCheck.allowed) return "Output filtered";
return result;
```

### 12.8 Final Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Kod Üretici Stüdyo                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 16)                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Chat UI     │  │ Code Editor │  │ File Tree   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket / SSE
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Next.js API Routes)               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Agent Orchestrator                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Planner  │→ │ ReAct    │→ │ Verifier │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Memory   │  │ Tools    │  │ Guard-   │  │ Observ-  │    │
│  │ SQLite + │  │ MCP      │  │ rails    │  │ ability  │    │
│  │ Chroma   │  │ Server   │  │          │  │ Langfuse │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   DeepSeek API         │
              │  - deepseek-chat       │
              │  - deepseek-reasoner   │
              └────────────────────────┘
```

---

## 13. Kod Örnekleri

### 13.1 DeepSeek + ReAct Agent Implementasyonu (TypeScript)

```typescript
// src/lib/agent/react-agent.ts
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com"
});

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: any) => Promise<string>;
}

export interface ReActStep {
  thought: string;
  action?: { name: string; arguments: string };
  observation?: string;
}

export class DeepSeekReActAgent {
  private tools: Map<string, Tool> = new Map();
  private maxIterations: number;

  constructor(maxIterations = 12) {
    this.maxIterations = maxIterations;
  }

  registerTool(tool: Tool): this {
    this.tools.set(tool.name, tool);
    return this;
  }

  async run(query: string): Promise<{ answer: string; trajectory: ReActStep[] }> {
    const trajectory: ReActStep[] = [];
    const systemPrompt = this.buildSystemPrompt();
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ];

    for (let i = 0; i < this.maxIterations; i++) {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages,
        tools: this.getToolSchemas(),
        tool_choice: "auto",
        temperature: 0.1,
        max_tokens: 2048
      });

      const msg = response.choices[0].message;
      messages.push(msg);

      const thought = msg.content ?? "";
      trajectory.push({ thought });

      if (!msg.tool_calls?.length) {
        return { answer: thought, trajectory };
      }

      // Paralel tool execution
      for (const call of msg.tool_calls) {
        const tool = this.tools.get(call.function.name);
        if (!tool) {
          const errMsg = `Tool '${call.function.name}' not found`;
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: errMsg })
          });
          continue;
        }

        let args: any;
        try {
          args = JSON.parse(call.function.arguments);
        } catch {
          args = {};
        }

        try {
          const observation = await tool.handler(args);
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: observation
          });
          trajectory[trajectory.length - 1].action = {
            name: call.function.name,
            arguments: call.function.arguments
          };
          trajectory[trajectory.length - 1].observation = observation;
        } catch (e: any) {
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: e.message })
          });
        }
      }
    }

    return {
      answer: "Max iterations reached without final answer.",
      trajectory
    };
  }

  private buildSystemPrompt(): string {
    const toolList = Array.from(this.tools.values())
      .map(t => `- ${t.name}: ${t.description}`)
      .join("\n");

    return `You are a ReAct agent. Think step by step.
Available tools:
${toolList}

Use tools when needed. When you have the final answer, respond without tool calls.
Always explain your reasoning before calling a tool.`;
  }

  private getToolSchemas() {
    return Array.from(this.tools.values()).map(t => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));
  }
}

// Kullanım
async function main() {
  const agent = new DeepSeekReActAgent();

  agent
    .registerTool({
      name: "read_file",
      description: "Read file from disk",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      },
      handler: async (args) => {
        const fs = await import("fs/promises");
        try {
          return await fs.readFile(args.path, "utf-8");
        } catch (e: any) {
          return `Error: ${e.message}`;
        }
      }
    })
    .registerTool({
      name: "list_files",
      description: "List files in directory",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      },
      handler: async (args) => {
        const fs = await import("fs/promises");
        const entries = await fs.readdir(args.path, { withFileTypes: true });
        return entries.map(e => e.name + (e.isDirectory() ? "/" : "")).join("\n");
      }
    })
    .registerTool({
      name: "write_file",
      description: "Write content to file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" }
        },
        required: ["path", "content"]
      },
      handler: async (args) => {
        const fs = await import("fs/promises");
        await fs.writeFile(args.path, args.content, "utf-8");
        return `Written ${args.content.length} bytes to ${args.path}`;
      }
    });

  const result = await agent.run(
    "Read package.json in current dir, then create a summary file at /tmp/summary.txt"
  );

  console.log("Answer:", result.answer);
  console.log("Steps:", result.trajectory.length);
}

main();
```

### 13.2 MCP Server Minimal Örnek

```typescript
// src/mcp-servers/mini-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "mini-tools", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "echo",
      description: "Echo back the input",
      inputSchema: {
        type: "object",
        properties: { message: { type: "string" } },
        required: ["message"]
      }
    },
    {
      name: "current_time",
      description: "Get current ISO timestamp",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "random_number",
      description: "Generate random number in range",
      inputSchema: {
        type: "object",
        properties: {
          min: { type: "number", default: 0 },
          max: { type: "number", default: 100 }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  switch (name) {
    case "echo":
      return {
        content: [{ type: "text", text: args.message }]
      };
    case "current_time":
      return {
        content: [{ type: "text", text: new Date().toISOString() }]
      };
    case "random_number":
      const min = args.min ?? 0;
      const max = args.max ?? 100;
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      return {
        content: [{ type: "text", text: String(n) }]
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

Çalıştırma:
```bash
# Build
npx tsc src/mcp-servers/mini-server.ts

# MCP inspector ile test et
npx @modelcontextprotocol/inspector node dist/mcp-servers/mini-server.js

# Claude Desktop config'ine ekle
# ~/Library/Application Support/Claude/claude_desktop_config.json:
{
  "mcpServers": {
    "mini-tools": {
      "command": "node",
      "args": ["/abs/path/to/mini-server.js"]
    }
  }
}
```

### 13.3 Memory-Enhanced Agent

```typescript
// src/lib/agent/memory-agent.ts
import { ChromaClient } from "chromadb";
import { DeepSeekReActAgent, Tool } from "./react-agent";

const chroma = new ChromaClient({ path: "http://localhost:8000" });

class AgentMemory {
  private collection: any;

  async init(userId: string) {
    this.collection = await chroma.getOrCreateCollection({
      name: `user_${userId}_memory`
    });
  }

  async remember(content: string, type: "fact" | "preference" | "lesson", metadata: Record<string, any> = {}) {
    await this.collection.add({
      ids: [crypto.randomUUID()],
      documents: [content],
      metadatas: [{ type, timestamp: Date.now(), ...metadata }]
    });
  }

  async recall(query: string, topK = 5) {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: topK
    });
    return results.documents[0].map((doc, i) => ({
      content: doc,
      metadata: results.metadatas[0][i]
    }));
  }
}

class MemoryEnhancedAgent {
  constructor(
    private agent: DeepSeekReActAgent,
    private memory: AgentMemory
  ) {
    // Memory recall tool
    this.agent.registerTool({
      name: "recall_memory",
      description: "Recall past memories relevant to a query",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "What to recall" }
        },
        required: ["query"]
      },
      handler: async (args) => {
        const memories = await this.memory.recall(args.query);
        if (!memories.length) return "No relevant memories found.";
        return memories.map(m => `[${m.metadata.type}] ${m.content}`).join("\n");
      }
    });

    // Memory store tool
    this.agent.registerTool({
      name: "remember",
      description: "Store a memory for future reference",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string" },
          type: { type: "string", enum: ["fact", "preference", "lesson"] }
        },
        required: ["content", "type"]
      },
      handler: async (args) => {
        await this.memory.remember(args.content, args.type);
        return `Memory stored: ${args.content}`;
      }
    });
  }

  async run(query: string): Promise<string> {
    // Otomatik context retrieval
    const relevantMemories = await this.memory.recall(query, 3);
    const contextPrefix = relevantMemories.length
      ? `Past memories:\n${relevantMemories.map(m => `- ${m.content}`).join("\n")}\n\n`
      : "";

    const result = await this.agent.run(contextPrefix + query);
    
    // Reflexion pattern — önemli kararları hatırla
    if (result.trajectory.length > 5) {
      await this.memory.remember(
        `Successfully completed: ${query}`,
        "lesson",
        { steps: result.trajectory.length }
      );
    }

    return result.answer;
  }
}

// Kullanım
async function main() {
  const memory = new AgentMemory();
  await memory.init("user-123");

  const baseAgent = new DeepSeekReActAgent();
  const enhancedAgent = new MemoryEnhancedAgent(baseAgent, memory);

  // İlk konuşma
  await enhancedAgent.run("I prefer TypeScript and PostgreSQL.");
  // Hafızaya kaydedilir

  // Sonraki konuşma
  await enhancedAgent.run("Build a hello world API.");
  // Agent, geçmişteki TypeScript + PostgreSQL tercihini hatırlayıp kullanır
}
```

---

## Ek: Kaynaklar ve Referanslar

### Akademik Makaleler
- Yao et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models"
- Shinn et al. (2023). "Reflexion: Language Agents with Verbal Reinforcement Learning"
- Yao et al. (2023). "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"
- Zhou et al. (2023). "Language Agent Tree Search Unifies Reasoning, Acting, and Planning"
- Wei et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"

### Standartlar ve Protokoller
- MCP spec: https://modelcontextprotocol.io/
- A2A spec: https://github.com/google/A2A
- OpenAI Agents SDK: https://github.com/openai/openai-agents-python
- OpenTelemetry GenAI: https://opentelemetry.io/docs/specs/gen/

### Framework'ler
- LangGraph: https://langchain-ai.github.io/langgraph/
- AutoGen: https://microsoft.github.io/autogen/
- CrewAI: https://docs.crewai.com/
- LlamaIndex Agents: https://docs.llamaindex.ai/en/stable/module_guides/modules/agents/
- PydanticAI: https://ai.pydantic.dev/

### Observability
- Langfuse: https://langfuse.com/
- LangSmith: https://smith.langchain.com/
- Arize Phoenix: https://phoenix.arize.com/
- OpenLLMetry: https://www.traceloop.com/openllmetry

### Eval & Test
- SWE-bench: https://www.swebench.com/
- AgentBench: https://github.com/THUDM/AgentBench
- RAGAS: https://docs.ragas.io/
- DeepEval: https://docs.confident-ai.com/

### Guardrails
- NeMo Guardrails: https://github.com/NVIDIA/NeMo-Guardrails
- Guardrails AI: https://www.guardrailsai.com/
- Llama Guard: https://huggingface.co/meta-llama/LlamaGuard-7b

### DeepSeek
- API Docs: https://api-docs.deepseek.com/
- Function Calling: https://api-docs.deepseek.com/guides/function_calling
- Pricing: https://api-docs.deepseek.com/quick_start/pricing

---

**Sonuç:** Bu araştırma, AI Kod Üretici stüdyosunun agent backend'i için **DeepSeek
üzerinden ReAct + Plan-and-Execute hybrid** mimarisini, **MCP uyumlu tool sunucularını**,
**SQLite + Chroma memory** yaklaşımını, **Langfuse** ile observability ve **basit
guardrail** katmanını önermektedir. Bu kombinasyon; maliyet etkin, production-ready,
genişletilebilir ve standartlara uyumlu bir mimari sunar.

Doküman toplam ~5000 kelime, 30+ kod örneği, 8 karşılaştırma tablosu içermektedir.
