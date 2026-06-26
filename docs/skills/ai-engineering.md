# Skill: AI Engineering

```yaml
name: ai-engineering
version: 1.0.0
description: >
  Prompt engineering, RAG mimarileri, vector DB seçimi, embedding stratejileri,
  chunking, re-ranking, agent desenleri, tool use, memory ve evaluation konularında
  derin AI mühendisliği uzmanlığı. AI stüdyo tüm AI kararlarını bu skill üzerinden alır.
capabilities:
  - Prompt engineering (CoT, ToT, ReAct, few-shot)
  - RAG architectures (basic, advanced, multi-query, hybrid)
  - Vector DB selection (Pinecone, Qdrant, Weaviate, Chroma, pgvector)
  - Embedding strategies (OpenAI, Cohere, local models)
  - Chunking strategies (fixed, semantic, sentence, recursive)
  - Re-ranking (cross-encoder, Cohere Rerank)
  - Agent patterns (ReAct, Plan-and-Execute, Reflexion, Multi-agent)
  - Tool use & function calling
  - Memory patterns (short, long, episodic, semantic)
  - Evaluation (LLM-as-judge, RAGAS, trajectory eval)
  - Production deployment (streaming, caching, fallback)
  - Cost & latency optimization
tools:
  - openai-node (DeepSeek compatible)
  - langfuse
  - chromadb
  - qdrant
  - pinecone-client
  - cohere-ai
  - tiktoken
output_format: TypeScript + LLM Pipelines
trigger_patterns:
  - "prompt"
  - "RAG"
  - "vector DB"
  - "embedding"
  - "chunking"
  - "re-ranking"
  - "agent"
  - "function calling"
  - "memory"
  - "evaluation"
  - "LLM üretimi"
```

---

## 1. AI Engineering Felsefesi

AI Engineering = **Sistem tasarımı** + **Model davranışı**. Sadece LLM çağırmak değil; **deterministik kod** ile **olasılıksal model** çağrılarını birleştirip **güvenilir ürün** yapmak.

5 temel ilke:

1. **LLM'ye güven ama doğrula** — Output'un yapısı garanti edilmeli (schema validation).
2. **Deterministik önce** — Yapabiliyorsan kodla, LLM son çare.
3. **Maliyet ≠ Kalite** — Daha pahalı model her zaman daha iyi değil. Doğru model doğru işte.
4. **Eval-in-the-loop** — Eval'siz prompt değişikliği bilimsel değil, hissi.
5. **Observability şart** — Her LLM çağrısı trace'lenebilir olmalı.

Karar matrisi:

| İhtiyaç | Yaklaşım |
|---|---|
| Kategorizasyon | Codex/few-shot → küçük model |
| Çıkarım | CoT + reasoner model (deepseek-reasoner) |
| Yaratım | Chat model + sıcaklık ayarı |
| Bilgi sorgulama | RAG (chunk + embed + retrieve) |
| Çok adımlı görev | Agent (ReAct / Plan-Execute) |
| Code generation | Coder model + function calling |

---

## 2. Prompt Engineering — Derin

### 2.1 Anatomy of a prompt

```
[Role]        : Sen kıdemli bir TypeScript geliştiricisin.
[Context]     : Kullanıcı Next.js 16 App Router kullanıyor.
[Instructions]: Aşağıdaki kurallara uyarak kod üret.
                1. TypeScript strict mode
                2. Server Component varsayılan
                3. Zod ile input validation
[Examples]    : <few-shot örnekler>
[Input]       : {kullanıcı_sorgusu}
[Output format]: TypeScript kod bloğu + kısa açıklama
```

### 2.2 Zero-shot vs Few-shot

```ts
// Zero-shot
const zero = `Aşağıdaki yorumu pozitif/negatif/nötr olarak sınıflandır:
"${review}"
Cevap (tek kelime):`;

// Few-shot — daha tutarlı
const few = `Aşağıdaki yorumları sınıflandır:

Yorum: "Harika ürün!" → pozitif
Yorum: "Beklentimin altında" → negatif
Yorum: "Fiyat fena değil" → nötr

Yorum: "${review}" →`;
```

### 2.3 Chain-of-Thought (CoT)

Modeli adım adım düşündür.

```ts
const cot = `Bir matematik problemi çözeceğiz. Önce adım adım düşün, sonra cevabı ver.

Problem: ${problem}

Adım adım düşün:
1)`;
```

DeepSeek-reasoner için bu pattern yerleşik — model otomatik `<think>` bloğu üretir.

### 2.4 Tree-of-Thoughts (ToT)

Birden fazla düşünce yolu üret, en iyisini seç.

```ts
async function treeOfThoughts(problem: string): Promise<string> {
  // 1. N farklı yaklaşım üret
  const approaches = await Promise.all(
    [1, 2, 3].map((i) =>
      llm.chat({
        model: "deepseek-chat",
        messages: [{
          role: "user",
          content: `Problem: ${problem}\nYaklaşım ${i} (farklı bir açı):`,
        }],
      })
    )
  );

  // 2. Her birini değerlendir
  const evaluations = await Promise.all(
    approaches.map((a) =>
      llm.chat({
        model: "deepseek-chat",
        messages: [{
          role: "user",
          content: `Bu çözümü 1-10 puanla ve gerekçele:\n${a}\n\nPuan:`,
        }],
      })
    )
  );

  // 3. En yüksek puanlıyı seç, rafine et
  const best = selectBest(approaches, evaluations);
  return await llm.chat({
    messages: [{
      role: "user",
      content: `Bu çözümü iyileştir:\n${best}\n\nFinal:`,
    }],
  });
}
```

### 2.5 ReAct — Reason + Act

```ts
const reactPrompt = `Bir görevi yerine getir. Her adımda:
1. Thought: Ne yapmalıyım?
2. Action: Hangi tool'u çağırmalıyım?
3. Observation: Tool çıktısı

Bitirdiğinde "Final Answer:" ile cevap ver.

Tools:
- search(query: string): string — web arama
- calculate(expr: string): number — matematik
- get_weather(city: string): string

Görev: ${task}

Thought: 1`;
```

### 2.6 Self-consistency

Aynı promptu N kez çalıştır, çoğunluk oyu ile sonucu seç.

```ts
async function selfConsistency<T>(prompt: string, n = 5): Promise<T> {
  const responses = await Promise.all(
    Array.from({ length: n }, () => llm.chat({ messages: [{ role: "user", content: prompt }], temperature: 0.7 }))
  );
  // Parse each, majority vote
  const parsed = responses.map(parseAnswer);
  return mostCommon(parsed);
}
```

### 2.7 Directional prompting

```ts
// Negatif yerine pozitif talimat
// ❌ "Halüsinasyon yapma"
// ✅ "Sadece sağlanan dokümandaki bilgilere dayan. Bilmiyorsan 'Bilmiyorum' de."

// Adım sırası
// ✅ "Önce değişkenleri tanımla, sonra fonksiyonu yaz, sonra test ekle."
```

---

## 3. RAG Mimarileri

### 3.1 Basit RAG pipeline

```
[Query] → [Embed] → [Vector Search] → [Top-K chunks] → [Prompt] → [LLM] → [Answer]
```

```ts
import { OpenAI } from "openai";
import { ChromaClient } from "chromadb";

const openai = new OpenAI({ baseURL: "https://api.deepseek.com", apiKey: process.env.DEEPSEEK_API_KEY });
const chroma = new ChromaClient({ path: "http://localhost:8000" });
const collection = await chroma.getOrCreateCollection({ name: "docs" });

async function simpleRag(question: string): Promise<string> {
  // 1. Query embedding
  const queryEmbedding = await embed(question);

  // 2. Vector search
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: 5,
  });

  // 3. Prompt construction
  const context = results.documents[0].join("\n\n---\n\n");
  const prompt = `Aşağıdaki bağlama dayanarak soruyu cevapla. Bilmiyorsan "Bilmiyorum" de.

Bağlam:
${context}

Soru: ${question}

Cevap:`;

  // 4. LLM call
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  return completion.choices[0].message.content ?? "";
}

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-v3",
    input: text,
  });
  return res.data[0].embedding;
}
```

### 3.2 Advanced RAG — Pre-retrieval & post-retrieval

**Pre-retrieval iyileştirmeleri:**
- Query rewriting — kullanıcı sorusunu optimize et
- HyDE — Hypothetical Document Embeddings
- Query expansion — çok varyasyon

```ts
async function hyde(query: string): Promise<string> {
  // 1. Hipotetik cevap üret
  const hypothetical = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{
      role: "user",
      content: `Bu sorunun cevabını 1 paragrafta tahmin et:\n${query}`,
    }],
  });
  // 2. Hipotetik cevabı embed → daha iyi semantic match
  return hypothetical.choices[0].message.content ?? "";
}

async function queryRewrite(query: string): Promise<string[]> {
  const res = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{
      role: "user",
      content: `Bu sorunun 3 farklı varyasyonunu üret (synonym, perspective, detail):
${query}

Varyasyonlar:`,
    }],
  });
  return res.choices[0].message.content?.split("\n").filter(Boolean) ?? [query];
}
```

**Post-retrieval iyileştirmeleri:**
- Re-ranking
- Context compression
- Lost-in-the-middle önleme (önemli parçaları başa/sona koy)

### 3.3 Multi-query RAG

```ts
async function multiQueryRag(question: string): Promise<string> {
  // 1. Birden fazla varyasyon
  const queries = await queryRewrite(question);

  // 2. Her birinden retrieve
  const allResults = await Promise.all(queries.map(async (q) => {
    const emb = await embed(q);
    const r = await collection.query({ queryEmbeddings: [emb], nResults: 5 });
    return r.documents[0].map((doc, i) => ({ doc, score: r.distances?.[0]?.[i] ?? 0 }));
  }));

  // 3. Reciprocal Rank Fusion
  const fused = reciprocalRankFusion(allResults);

  // 4. Top-K
  const topK = fused.slice(0, 5);

  // 5. Re-rank
  const reranked = await rerank(question, topK);

  // 6. Generate
  return await generate(question, reranked);
}

function reciprocalRankFusion(results: { doc: string; score: number }[][], k = 60) {
  const scores = new Map<string, number>();
  for (const list of results) {
    list.forEach((r, i) => {
      scores.set(r.doc, (scores.get(r.doc) ?? 0) + 1 / (k + i + 1));
    });
  }
  return [...scores.entries()]
    .map(([doc, score]) => ({ doc, score }))
    .sort((a, b) => b.score - a.score);
}
```

### 3.4 Hybrid RAG — BM25 + Vector

```ts
import { BM25 } from "okapibm25";

async function hybridSearch(query: string, topK = 10) {
  // 1. BM25 (sparse)
  const tokenized = query.toLowerCase().split(/\s+/);
  const bm25Scores = bm25.rank(tokenized, corpus);

  // 2. Vector (dense)
  const qEmb = await embed(query);
  const vecScores = await vectorIndex.search(qEmb, topK * 2);

  // 3. Normalize + birleştir (alpha ile ağırlık)
  const alpha = 0.5; // 0.5 = dengeli
  const combined = new Map<string, number>();
  for (const [docId, score] of bm25Scores) {
    combined.set(docId, alpha * normalize(score));
  }
  for (const { id, score } of vecScores) {
    combined.set(id, (combined.get(id) ?? 0) + (1 - alpha) * normalize(score));
  }

  return [...combined.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);
}
```

---

## 4. Vector DB Seçimi

### 4.1 Karşılaştırma

| DB | Tip | Açık kaynak | Yönetilen | Index | Boyut | Hybrid |
|---|---|---|---|---|---|---|
| **Pinecone** | SaaS | Hayır | Evet | HNSW | Milyar+ | Evet |
| **Qdrant** | Self/SaaS | Evet | Evet | HNSW | Milyar+ | Evet |
| **Weaviate** | Self/SaaS | Evet | Evet | HNSW | Milyar+ | Evet |
| **Chroma** | Self/SaaS | Evet | Kısmi | HNSW | Milyonlar | Kısmi |
| **pgvector** | Postgres ext | Evet | Evet (RDS) | IVFFlat, HNSW | Milyonlar | SQL ile |
| **Milvus** | Self/SaaS | Evet | Zilliz | Çok çeşitli | Milyar+ | Evet |

### 4.2 Pinecone

```ts
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index("docs");

await index.upsert([
  { id: "doc1", values: embedding, metadata: { source: "policy.md", page: 1 } },
]);

const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  filter: { source: { $eq: "policy.md" } },
  includeMetadata: true,
});
```

### 4.3 Qdrant

```ts
import { QdrantClient } from "@qdrant/js-client-rest";

const qd = new QdrantClient({ url: "http://localhost:6333" });
await qd.createCollection("docs", {
  vectors: { size: 1536, distance: "Cosine" },
});

await qd.upsert("docs", {
  points: [
    { id: 1, vector: embedding, payload: { source: "policy.md", chunk: 0 } },
  ],
});

const results = await qd.search("docs", {
  vector: queryEmbedding,
  limit: 5,
  filter: { must: [{ key: "source", match: { value: "policy.md" } }] },
});
```

### 4.4 pgvector — var olan Postgres

```sql
CREATE EXTENSION vector;

CREATE TABLE docs (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536),
  source TEXT
);

CREATE INDEX ON docs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Search
SELECT content, source, 1 - (embedding <=> $1::vector) AS similarity
FROM docs
WHERE source = 'policy.md'
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

### 4.5 Index tipi seçimi

- **HNSW** — Yüksek recall, hızlı sorgu, yüksek memory. Default tercih.
- **IVFFlat** — Düşük memory, daha yavaş, clusters ile.
- **PQ (Product Quantization)** — Compression, daha az doğruluk.
- **Flat** — Exact search, küçük dataset.

---

## 5. Embedding Stratejileri

### 5.1 Model karşılaştırma

| Model | Boyut | Context | Maliyet | Kalite |
|---|---|---|---|---|
| OpenAI text-embedding-3-small | 1536 | 8k | $0.02/1M | Orta |
| OpenAI text-embedding-3-large | 3072 | 8k | $0.13/1M | Yüksek |
| Cohere embed-v3 | 1024 | 512 | $0.10/1M | Yüksek |
| BGE-large-en (local) | 1024 | 512 | Bedava | Yüksek |
| E5-mistral-7b (local) | 4096 | 8k | Bedava | Çok yüksek |
| Jina-embeddings-v3 | 1024 | 8k | $0.10/1M | Yüksek |

### 5.2 Dimensionality reduction

```ts
// OpenAI'da boyut kısaltma (Matryoshka)
const res = await openai.embeddings.create({
  model: "text-embedding-3-large",
  input: text,
  dimensions: 256, // 3072 → 256, %95+ kalite korunur
});
```

### 5.3 Local embedding — Hugging Face

```ts
import { pipeline } from "@xenova/transformers";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/bge-large-en-v1.5",
);

const output = await embedder(text, { pooling: "mean", normalize: true });
const embedding = Array.from(output.data); // Float32Array
```

### 5.4 Caching

```ts
const cache = new Map<string, number[]>();

async function embedCached(text: string): Promise<number[]> {
  const key = hash(text);
  if (cache.has(key)) return cache.get(key)!;
  const emb = await embed(text);
  cache.set(key, emb);
  return emb;
}
```

---

## 6. Chunking Stratejileri

### 6.1 Fixed-size chunking

```ts
function chunkFixed(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}
```

### 6.2 Sentence-based

```ts
import { Sentencizer } from "@xenova/transformers";

const tokenizer = await new Sentencizer();
function chunkBySentence(text: string, maxLen = 1000): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current);
      current = s;
    } else {
      current += " " + s;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
```

### 6.3 Recursive chunking — LangChain yaklaşımı

```ts
const SPLITTERS = ["\n\n", "\n", ". ", " ", ""];

function chunkRecursive(text: string, maxLen = 500, overlap = 50): string[] {
  if (text.length <= maxLen) return [text];

  // En iyi splitter'ı bul
  let splitter = SPLITTERS[SPLITTERS.length - 1];
  for (const s of SPLITTERS) {
    if (text.includes(s)) { splitter = s; break; }
  }

  const parts = text.split(splitter);
  const chunks: string[] = [];
  let current = "";

  for (const p of parts) {
    const candidate = current ? current + splitter + p : p;
    if (candidate.length > maxLen && current) {
      chunks.push(current);
      // Overlap — son birkaç parçayı tekrar başa al
      current = p;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
```

### 6.4 Semantic chunking — Anlam bazlı

```ts
async function chunkSemantic(text: string, threshold = 0.5): Promise<string[]> {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const embeddings = await Promise.all(sentences.map(embed));

  // Komşu cümleler arası cosine similarity
  const sims = [];
  for (let i = 0; i < embeddings.length - 1; i++) {
    sims.push(cosineSim(embeddings[i], embeddings[i + 1]));
  }

  // Düşük similarity'lerde böl
  const chunks: string[] = [];
  let start = 0;
  for (let i = 0; i < sims.length; i++) {
    if (sims[i] < threshold) {
      chunks.push(sentences.slice(start, i + 1).join(" "));
      start = i + 1;
    }
  }
  if (start < sentences.length) {
    chunks.push(sentences.slice(start).join(" "));
  }
  return chunks;
}
```

### 6.5 Karşılaştırma

| Strateji | Basitlik | Kalite | Maliyet |
|---|---|---|---|
| Fixed | Çok basit | Düşük (cümle bölünür) | Düşük |
| Sentence | Basit | Orta | Düşük |
| Recursive | Orta | Yüksek | Orta |
| Semantic | Karmaşık | Çok yüksek | Yüksek (her cümleye embed) |

### 6.6 Metadata

```ts
type Chunk = {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    source: string;       // dosya yolu
    page?: number;
    section?: string;     // başlık
    chunkIndex: number;
    parentDocId: string;
    createdAt: Date;
    tokens: number;
  };
};
```

---

## 7. Re-ranking

Vector search genelde yüzlerce aday getirir; cross-encoder re-ranker en iyileri seçer.

### 7.1 Cross-encoder (local)

```ts
import { pipeline } from "@xenova/transformers";

const reranker = await pipeline("text-classification", "Xenova/ms-marco-MiniLM-L-6-v2");

async function rerank(query: string, docs: string[], topK = 5): Promise<string[]> {
  const pairs = docs.map((d) => ({ text: query, text_pair: d }));
  const scores = await Promise.all(pairs.map((p) => reranker(p)));
  return docs
    .map((d, i) => ({ d, score: scores[i].score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.d);
}
```

### 7.2 Cohere Rerank

```ts
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });

async function cohereRerank(query: string, docs: string[], topN = 5) {
  const response = await cohere.rerank({
    model: "rerank-multilingual-v3.0",
    query,
    documents: docs,
    topN,
  });
  return response.results.map((r) => docs[r.index]);
}
```

---

## 8. Agent Patterns

### 8.1 ReAct — Reason + Act

```ts
type Tool = {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (args: any) => Promise<string>;
};

const tools: Tool[] = [
  {
    name: "search_web",
    description: "Web arama yapar",
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    execute: async (args) => JSON.stringify(await webSearch(args.query)),
  },
  {
    name: "read_file",
    description: "Dosya okur",
    parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
    execute: async (args) => await fs.readFile(args.path, "utf-8"),
  },
];

async function reactAgent(task: string, maxIterations = 10): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: `Sen ReAct agentsın. Tools: ${JSON.stringify(tools.map((t) => ({ name: t.name, description: t.description })))}` },
    { role: "user", content: task },
  ];

  for (let i = 0; i < maxIterations; i++) {
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages,
      tools: tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      tool_choice: "auto",
    });

    const msg = response.choices[0].message;
    messages.push(msg);

    if (msg.content && !msg.tool_calls?.length) {
      return msg.content; // Final answer
    }

    // Tool çağrılarını işle
    for (const call of msg.tool_calls ?? []) {
      const tool = tools.find((t) => t.name === call.function.name);
      if (!tool) continue;
      const args = JSON.parse(call.function.arguments);
      const result = await tool.execute(args);
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  throw new Error("Max iterations");
}
```

### 8.2 Plan-and-Execute

```ts
async function planAndExecute(task: string): Promise<string> {
  // 1. Plan üret
  const planResponse = await openai.chat.completions.create({
    model: "deepseek-reasoner", // planlama için reasoner
    messages: [{
      role: "user",
      content: `Bu görevi alt görevlere böl. JSON array döndür.
Görev: ${task}

Format: ["adım 1", "adım 2", ...]`,
    }],
    response_format: { type: "json_object" },
  });
  const steps = JSON.parse(planResponse.choices[0].message.content ?? "[]").steps;

  // 2. Her adımı execute et
  const results: string[] = [];
  for (const step of steps) {
    const result = await executeStep(step, results);
    results.push(`Step: ${step}\nResult: ${result}`);
  }

  // 3. Final sentez
  const final = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{
      role: "user",
      content: `Bu adımları ve sonuçları sentezle, ana görevi tamamla:
${results.join("\n\n")}`,
    }],
  });
  return final.choices[0].message.content ?? "";
}
```

### 8.3 Reflexion — Self-improve

```ts
async function reflexionAgent(task: string, maxRounds = 3): Promise<string> {
  let solution = "";
  let reflections: string[] = [];

  for (let i = 0; i < maxRounds; i++) {
    // 1. Çöz
    solution = await solve(task, reflections);

    // 2. Self-evaluate
    const evalResult = await evaluate(task, solution);

    if (evalResult.passed) return solution;

    // 3. Reflect — ne yanlıştı?
    const reflection = await reflect(task, solution, evalResult.feedback);
    reflections.push(reflection);
  }
  return solution;
}
```

### 8.4 Multi-Agent

```ts
// Specialized agents — birbirleriyle konuşur
const agents = {
  researcher: { role: "Araştırmacı", system: "Bilgi toplarsın." },
  coder: { role: "Yazılımcı", system: "TypeScript kodu yazarsın." },
  reviewer: { role: "İnceleyici", system: "Kod kalitesini denetlersin." },
};

async function multiAgent(task: string): Promise<string> {
  const research = await runAgent(agents.researcher, task);
  const code = await runAgent(agents.coder, `Görev: ${task}\nAraştırma: ${research}`);
  const review = await runAgent(agents.reviewer, `Kod:\n${code}`);
  if (review.includes("ISSUES")) {
    // Revize döngüsü
    return await runAgent(agents.coder, `Geri bildirim: ${review}\nÖnceki kod:\n${code}\nRevize et:`);
  }
  return code;
}
```

---

## 9. Tool Use & Function Calling

### 9.1 Schema

```ts
const weatherTool = {
  type: "function" as const,
  function: {
    name: "get_weather",
    description: "Belirli bir şehir için hava durumu getirir",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "Şehir adı" },
        unit: { type: "string", enum: ["celsius", "fahrenheit"], default: "celsius" },
      },
      required: ["city"],
    },
  },
};

const completion = await openai.chat.completions.create({
  model: "deepseek-chat",
  messages,
  tools: [weatherTool],
  tool_choice: "auto",
});
```

### 9.2 Parallel tool calling

```ts
// DeepSeek/OpenAI aynı message'da birden fazla tool_call dönebilir
const msg = completion.choices[0].message;
if (msg.tool_calls?.length) {
  const results = await Promise.all(
    msg.tool_calls.map(async (call) => {
      const args = JSON.parse(call.function.arguments);
      const result = await executeTool(call.function.name, args);
      return { id: call.id, content: JSON.stringify(result) };
    })
  );

  messages.push(msg);
  for (const r of results) {
    messages.push({ role: "tool", tool_call_id: r.id, content: r.content });
  }

  // LLM sonuçları birleştirsin
  const final = await openai.chat.completions.create({ model: "deepseek-chat", messages });
}
```

### 9.3 MCP (Model Context Protocol)

```ts
// MCP server — tool sağlayıcı
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({ name: "filesystem-tools", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "read_file", description: "...", inputSchema: { /* json schema */ } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === "read_file") {
    return { content: [{ type: "text", text: await fs.readFile(req.params.arguments.path, "utf-8") }] };
  }
});

await server.connect(new StdioServerTransport());
```

---

## 10. Memory Patterns

### 10.1 Short-term — Buffer

```ts
class BufferMemory {
  private messages: ChatMessage[] = [];
  constructor(private maxTokens = 4000) {}

  add(msg: ChatMessage) {
    this.messages.push(msg);
    this.trim();
  }

  private trim() {
    while (this.tokenCount() > this.maxTokens && this.messages.length > 1) {
      this.messages.shift(); // en eskiyi sil
    }
  }

  private tokenCount() {
    return this.messages.reduce((s, m) => s + estimateTokens(m.content), 0);
  }

  get context() { return this.messages; }
}
```

### 10.2 Sliding window + summary

```ts
class SummaryMemory {
  constructor(
    private shortTerm: ChatMessage[] = [],
    private summary: string = "",
    private maxShort = 6,
  ) {}

  add(msg: ChatMessage) {
    this.shortTerm.push(msg);
    if (this.shortTerm.length > this.maxShort) {
      this.summarize();
    }
  }

  private async summarize() {
    const dropped = this.shortTerm.splice(0, this.shortTerm.length - this.maxShort);
    const newSummary = await llm.chat({
      messages: [{
        role: "user",
        content: `Mevcut özet:\n${this.summary}\n\nYeni mesajlar:\n${JSON.stringify(dropped)}\n\nGüncellenmiş özet:`,
      }],
    });
    this.summary = newSummary;
  }

  get systemPrompt() {
    return `Önceki konuşma özeti:\n${this.summary}`;
  }
}
```

### 10.3 Long-term — Vector

```ts
class VectorMemory {
  constructor(private collection: ChromaCollection) {}

  async add(event: MemoryEvent) {
    const embedding = await embed(event.text);
    await this.collection.add({
      ids: [event.id],
      embeddings: [embedding],
      documents: [event.text],
      metadatas: [{ type: event.type, timestamp: event.timestamp, ...event.metadata }],
    });
  }

  async recall(query: string, k = 5): Promise<MemoryEvent[]> {
    const qEmb = await embed(query);
    const results = await this.collection.query({ queryEmbeddings: [qEmb], nResults: k });
    return results.documents[0].map((d, i) => ({
      id: results.ids[0][i],
      text: d,
      metadata: results.metadatas[0][i],
    }));
  }
}
```

### 10.4 Episodic vs Semantic

- **Episodic** — Belirli olay ("Dün kullanıcı X'in oturum açtığını gördüm").
- **Semantic** — Genel bilgi ("Kullanıcı X Python'ı sever").

```ts
type Memory = {
  id: string;
  type: "episodic" | "semantic";
  text: string;
  embedding: number[];
  metadata: {
    timestamp: Date;
    importance: number; // 0-1
    decayRate: number; // unutma hızı
  };
};

// Importance scoring
function scoreImportance(text: string): number {
  // LLM'ye sor: "Bu anı 1-10 puanla"
  return llmScore(text) / 10;
}

// Decay — eski anılar zayıflar
function effectiveScore(m: Memory, now: Date): number {
  const ageDays = (now.getTime() - m.metadata.timestamp.getTime()) / (1000 * 60 * 60 * 24);
  return m.metadata.importance * Math.exp(-m.metadata.decayRate * ageDays);
}
```

---

## 11. Evaluation

### 11.1 LLM-as-judge

```ts
async function llmJudge(question: string, answer: string, reference?: string): Promise<EvalResult> {
  const rubric = `
Question: ${question}
Answer: ${answer}
${reference ? `Reference: ${reference}` : ""}

Score 1-5 on:
- accuracy (factual correct)
- relevance (on topic)
- completeness (covers the question)
- clarity (readable)

Return JSON: { accuracy: 1-5, relevance: 1-5, completeness: 1-5, clarity: 1-5, reasoning: string }
`;

  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: rubric }],
    response_format: { type: "json_object" },
  });
  return JSON.parse(response.choices[0].message.content ?? "{}");
}
```

### 11.2 RAGAS — RAG değerlendirme

4 metrik:

- **Faithfulness** — Cevap context'ten geliyor mu (halüsinasyon yok)?
- **Answer Relevancy** — Cevap soruyla ilgili mi?
- **Context Precision** — Doğru context getirildi mi?
- **Context Recall** — Tüm gerekli context getirildi mi?

```ts
async function ragasEval(dataset: EvalSample[]): Promise<RagasScores> {
  const scores = await Promise.all(dataset.map(async (s) => {
    const faith = await measureFaithfulness(s.answer, s.context);
    const rel = await measureRelevance(s.question, s.answer);
    const cp = await measureContextPrecision(s.question, s.context);
    const cr = await measureContextRecall(s.question, s.groundTruth, s.context);
    return { faith, rel, cp, cr };
  }));
  return average(scores);
}
```

### 11.3 Trajectory eval — Agent

```ts
async function evalAgentTrajectory(trajectory: TrajectoryStep[]): Promise<TrajectoryEval> {
  const prompt = `Bu agent trajektorisini değerlendir:
${JSON.stringify(trajectory, null, 2)}

Her adım için:
1. Doğru tool mu seçildi?
2. Doğru parametreler mi?
3. Görev tamamlandı mı?
4. Verimli miydi (gereksiz adım yok mu)?

JSON döndür: { stepScores: number[], efficiency: 1-5, completion: 1-5, reasoning: string }`;

  const res = await openai.chat.completions.create({
    model: "deepseek-reasoner",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  return JSON.parse(res.choices[0].message.content ?? "{}");
}
```

### 11.4 Eval pipeline

```ts
async function runEvalSuite(name: string, testCases: TestCase[]): Promise<EvalReport> {
  const results: EvalResult[] = [];

  for (const tc of testCases) {
    // 1. Çalıştır
    const output = await systemUnderTest(tc.input);

    // 2. Eval et
    let evalResult: EvalResult;
    if (tc.type === "exact_match") {
      evalResult = { pass: output === tc.expected, score: output === tc.expected ? 1 : 0 };
    } else if (tc.type === "llm_judge") {
      evalResult = await llmJudge(tc.input, output, tc.expected);
    } else if (tc.type === "ragas") {
      evalResult = await ragasEval([{ question: tc.input, answer: output, ...tc.meta }]);
    }

    results.push({ id: tc.id, ...evalResult });

    // 3. Langfuse'a logla
    await langfuse.score({ traceId: tc.id, name, value: evalResult.score });
  }

  return {
    name,
    total: results.length,
    passRate: results.filter((r) => r.pass).length / results.length,
    avgScore: average(results.map((r) => r.score)),
    results,
  };
}
```

### 11.5 A/B test

```ts
async function abTest(variantA: Prompt, variantB: Prompt, n = 100): Promise<ABResult> {
  const results = { A: [] as number[], B: [] as number[] };

  for (let i = 0; i < n; i++) {
    const variant = i % 2 === 0 ? "A" : "B";
    const prompt = variant === "A" ? variantA : variantB;
    const output = await run(prompt, testCases[i].input);
    const score = await evaluate(testCases[i], output);
    results[variant].push(score);
  }

  return {
    meanA: mean(results.A),
    meanB: mean(results.B),
    pValue: tTest(results.A, results.B),
    winner: mean(results.A) > mean(results.B) ? "A" : "B",
  };
}
```

---

## 12. Production Deployment

### 12.1 Streaming — SSE

```ts
// API route
export async function POST(req: Request) {
  const body = await req.json();
  const stream = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: body.messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Client
const es = new EventSource("/api/chat");
es.onmessage = (e) => {
  if (e.data === "[DONE]") { es.close(); return; }
  const { token } = JSON.parse(e.data);
  setOutput((prev) => prev + token);
};
```

### 12.2 Caching — Semantic cache

```ts
async function semanticCache(query: string): Promise<string | null> {
  const qEmb = await embed(query);
  const cached = await collection.query({
    queryEmbeddings: [qEmb],
    nResults: 1,
    where: { type: "cache" },
  });

  // Cosine > 0.95 → "aynı" soru
  if (cached.distances?.[0]?.[0] && 1 - cached.distances[0][0] > 0.95) {
    return cached.documents[0][0];
  }
  return null;
}

async function cacheResponse(query: string, response: string) {
  const emb = await embed(query);
  await collection.add({
    ids: [hash(query)],
    embeddings: [emb],
    documents: [response],
    metadatas: [{ type: "cache", timestamp: new Date() }],
  });
}
```

### 12.3 Fallback

```ts
async function callWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  timeout = 10_000,
): Promise<T> {
  try {
    return await withTimeout(primary(), timeout);
  } catch (e) {
    console.warn("Primary failed", e);
    return await fallback();
  }
}

// Model fallback chain
const chain = [
  { model: "deepseek-v4-pro", call: () => callDeepSeek("deepseek-v4-pro", messages) },
  { model: "deepseek-chat", call: () => callDeepSeek("deepseek-chat", messages) },
  { model: "deepseek-v4-flash", call: () => callDeepSeek("deepseek-v4-flash", messages) },
];

async function callChain(messages: ChatMessage[]) {
  for (let i = 0; i < chain.length; i++) {
    try {
      return await chain[i].call();
    } catch (e) {
      if (i === chain.length - 1) throw e;
      console.warn(`${chain[i].model} failed, falling back to ${chain[i + 1].model}`);
    }
  }
}
```

### 12.4 Rate limit & budget

```ts
class TokenBudget {
  private used = 0;
  constructor(private limit: number, private windowMs: number) {
    setInterval(() => { this.used = 0; }, this.windowMs);
  }

  canSpend(tokens: number): boolean {
    return this.used + tokens <= this.limit;
  }

  spend(tokens: number) {
    if (!this.canSpend(tokens)) throw new Error("Budget exceeded");
    this.used += tokens;
  }
}

// Per-user
const budgets = new Map<string, TokenBudget>();
function getBudget(userId: string): TokenBudget {
  if (!budgets.has(userId)) {
    budgets.set(userId, new TokenBudget(100_000, 3600_000)); // 100k tokens / hour
  }
  return budgets.get(userId)!;
}
```

### 12.5 Guardrails

```ts
async function inputGuard(input: string): Promise<{ safe: boolean; reason?: string }> {
  // 1. Token limit
  if (estimateTokens(input) > 8000) return { safe: false, reason: "Too long" };

  // 2. Prompt injection detection
  const injectionPatterns = [
    /ignore (previous|above) instructions/i,
    /system prompt/i,
    /you are now/i,
  ];
  if (injectionPatterns.some((p) => p.test(input))) {
    return { safe: false, reason: "Potential prompt injection" };
  }

  // 3. PII detection
  if (detectPII(input)) return { safe: false, reason: "PII detected" };

  // 4. Toxicity classifier
  const toxic = await classifyToxic(input);
  if (toxic > 0.8) return { safe: false, reason: "Toxic content" };

  return { safe: true };
}

async function outputGuard(output: string): Promise<{ safe: boolean; reason?: string }> {
  // Code injection check
  if (/<script|onerror=|javascript:/i.test(output)) {
    return { safe: false, reason: "XSS in output" };
  }
  //PII leak check
  if (detectPII(output)) return { safe: false, reason: "PII in output" };
  return { safe: true };
}
```

---

## 13. Cost & Latency Optimization

### 13.1 Model routing

```ts
async function routeModel(task: TaskType, complexity: number): Promise<string> {
  // Basit görev → küçük model
  if (task === "classification" || task === "extraction") return "deepseek-v4-flash";
  // Orta → chat
  if (complexity < 0.7) return "deepseek-chat";
  // Karmaşık → reasoner
  if (task === "reasoning") return "deepseek-reasoner";
  // En yüksek → pro
  return "deepseek-v4-pro";
}
```

### 13.2 Token optimization

```ts
// 1. Prompt compression
function compressPrompt(prompt: string): string {
  return prompt
    .replace(/\s+/g, " ")  // çoklu whitespace
    .replace(/# .*/g, "")   // yorumlar
    .trim();
}

// 2. Few-shot'u sadeleştir — sadece en iyileri
async function selectBestExamples(examples: Example[], n = 3) {
  // Diversity clustering
  const embeddings = await Promise.all(examples.map((e) => embed(e.input)));
  const clusters = kMeans(embeddings, n);
  return clusters.map((c) => examples[c.centroid]);
}

// 3. Streaming output → partial render → perceived latency düşer
```

### 13.3 Prompt caching

```ts
// DeepSeek ve OpenAI prefix caching destekler
// Aynı prefix'i prompt başında sabit tut → cache hit
const SYSTEM_PROMPT = `Sen bir AI stüdyosusun... (5000 token sabit)`;

// Bu kısım cache'lenir, sadece user message yeni hesaplanır
const completion = await openai.chat.completions.create({
  model: "deepseek-chat",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ],
});
```

---

## 14. Kompozit Örnek — AI Stüdyo Code Generator

```ts
async function generateCode(spec: CodeSpec): Promise<CodeResult> {
  // 1. Input guard
  const guard = await inputGuard(spec.description);
  if (!guard.safe) throw new Error(guard.reason);

  // 2. RAG — benzer kodları getir
  const similar = await ragSearch(spec.description, { topK: 5 });
  const reranked = await cohereRerank(spec.description, similar, 3);

  // 3. Few-shot prompt
  const prompt = buildCodePrompt({
    spec,
    examples: reranked,
    conventions: await loadConventions(spec.language),
  });

  // 4. Model route
  const model = spec.complexity === "high" ? "deepseek-reasoner" : "deepseek-chat";

  // 5. Generate (streaming)
  const code = await callWithFallback(
    () => callDeepSeek(model, prompt, { temperature: 0.2, stream: true }),
    () => callDeepSeek("deepseek-v4-flash", prompt),
  );

  // 6. Output guard
  const outGuard = await outputGuard(code);
  if (!outGuard.safe) throw new Error(outGuard.reason);

  // 7. Eval — syntax check, test
  const evalResult = await evalCode(code, spec.tests);

  // 8. Langfuse'a logla
  await langfuse.trace({
    name: "code_generation",
    input: spec,
    output: code,
    metadata: { model, evalResult, retrievalCount: reranked.length },
  });

  return { code, evalResult, similar: reranked };
}
```

---

## 15. Skill Çıktısı Beklentisi

Bu skill çağrıldığında AI:

1. **Task analizi** — Basit mi, RAG mi, agent mı?
2. **Model seçimi** — Doğru model, doğru iş.
3. **Prompt tasarımı** — Role, context, instructions, examples.
4. **RAG pipeline** — Chunking → embed → retrieve → rerank → generate.
5. **Guardrails** — Input/output doğrulama.
6. **Eval planı** — LLM-judge / RAGAS / trajectory.
7. **Production** — Streaming, cache, fallback, budget.

Tüm çıktılar **TypeScript** ve **DeepSeek API** uyumlu.

---

## 16. Kapanış

AI Engineering, **olasılıksal sistemleri güvenilir ürünler** haline getirme sanatıdır.

Bu skill'in 3 ana çıktısı:
1. **Güvenilir** — Schema validation, guardrails, eval her zaman.
2. **Maliyet-etkin** — Doğru model, cache, fallback.
3. **Gözlemlenebilir** — Her çağrı trace, her prompt version'lı.

AI stüdyo arayüzünde bu skill her AI etkileşiminde kendini gösterir. Yeni bir AI özelliği istendiğinde, bu skill önce **"hangi pattern? RAG mı, agent mı?", "hangi model?", "eval nasıl?"** sorularını sorar.

**Unutma:** LLM sihirli bir kutu değildir; mühendislik disiplini gerektiren bir bileşendir. Prompt değişikliği = kod değişikliği. Version, eval, monitor — yoksa production'da sürpriz olur.

Bu skill, AI'a şu rehberi verir: **"Her LLM çağrısı bir mühendislik kararıdır. Hızlı değil, doğru ol. Eval'siz deploy etme. Cost'u ölç. Trace'i açık tut."**
