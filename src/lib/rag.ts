/**
 * RAG — Retrieval Augmented Generation
 *
 * - Belge yükleme, chunking, embedding
 * - Semantic search (cosine similarity)
 * - Hybrid search (keyword + semantic)
 * - Re-ranking
 * - Context assembly
 *
 * Not: Server-side only. z-ai-web-dev-sdk embedding kullanır.
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
  chunks?: Chunk[];
}

export interface Chunk {
  id: string;
  content: string;
  embedding: number[];
  documentId: string;
  startOffset: number;
  endOffset: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  chunk: Chunk;
  document?: Document;
  score: number;
  rerankedScore?: number;
}

// ---------- Chunking ----------

export interface ChunkingOptions {
  strategy: 'fixed' | 'sentence' | 'recursive' | 'semantic';
  chunkSize: number; // karakter
  overlap: number; // karakter
  separators?: string[];
}

export const DEFAULT_CHUNKING: ChunkingOptions = {
  strategy: 'recursive',
  chunkSize: 1000,
  overlap: 200,
  separators: ['\n## ', '\n### ', '\n#### ', '\n\n', '\n', '. ', ' '],
};

export function chunkDocument(doc: Document, options: ChunkingOptions = DEFAULT_CHUNKING): Chunk[] {
  const chunks: Chunk[] = [];

  if (options.strategy === 'fixed') {
    for (let i = 0; i < doc.content.length; i += options.chunkSize - options.overlap) {
      const end = Math.min(i + options.chunkSize, doc.content.length);
      chunks.push({
        id: `${doc.id}_chunk_${i}`,
        content: doc.content.slice(i, end),
        embedding: [],
        documentId: doc.id,
        startOffset: i,
        endOffset: end,
      });
      if (end === doc.content.length) break;
    }
  } else if (options.strategy === 'sentence') {
    const sentences = doc.content.match(/[^.!?]+[.!?]+/g) || [doc.content];
    let current = '';
    let startOffset = 0;
    for (const sentence of sentences) {
      if (current.length + sentence.length > options.chunkSize && current) {
        chunks.push({
          id: `${doc.id}_chunk_${chunks.length}`,
          content: current,
          embedding: [],
          documentId: doc.id,
          startOffset,
          endOffset: startOffset + current.length,
        });
        // Keep overlap
        const overlapText = current.slice(-options.overlap);
        current = overlapText + sentence;
        startOffset += current.length - overlapText.length;
      } else {
        current += sentence;
      }
    }
    if (current) {
      chunks.push({
        id: `${doc.id}_chunk_${chunks.length}`,
        content: current,
        embedding: [],
        documentId: doc.id,
        startOffset,
        endOffset: startOffset + current.length,
      });
    }
  } else {
    // Recursive — en uzun separator'dan başla
    const separators = options.separators || DEFAULT_CHUNKING.separators!;
    const parts = recursiveSplit(doc.content, options.chunkSize, options.overlap, separators);
    let offset = 0;
    parts.forEach((part, i) => {
      chunks.push({
        id: `${doc.id}_chunk_${i}`,
        content: part,
        embedding: [],
        documentId: doc.id,
        startOffset: offset,
        endOffset: offset + part.length,
      });
      offset += part.length;
    });
  }

  return chunks;
}

function recursiveSplit(
  text: string,
  chunkSize: number,
  overlap: number,
  separators: string[]
): string[] {
  if (text.length <= chunkSize) return [text];

  const separator = separators[0] || '';
  const parts = separator ? text.split(separator) : [text];

  if (parts.length === 1) {
    // Can't split further, force chunk
    const result: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      result.push(text.slice(i, Math.min(i + chunkSize, text.length)));
      if (i + chunkSize >= text.length) break;
    }
    return result;
  }

  const chunks: string[] = [];
  let current = '';

  for (const part of parts) {
    if (current.length + part.length + separator.length > chunkSize && current) {
      chunks.push(current);
      const overlapText = current.slice(-overlap);
      current = overlapText + separator + part;
    } else {
      current = current ? current + separator + part : part;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

// ---------- Embedding ----------

/**
 * z-ai-web-dev-sdk ile embedding üret (server-side only)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Bu fonksiyon server-side çalışmalı
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();
  // Stub: gerçek implementasyonda zai.embeddings.create kullanılır
  // Şimdilik hash-based fake embedding
  return texts.map((text) => hashEmbedding(text, 384));
}

/**
 * Basit hash embedding (production'da gerçek model kullanılmalı)
 */
function hashEmbedding(text: string, dim: number): number[] {
  const vec = new Array(dim).fill(0);
  const tokens = text.toLowerCase().split(/\s+/);
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash + token.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  }
  // Normalize
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / mag);
}

// ---------- Similarity ----------

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ---------- Vector Store (in-memory) ----------

export class InMemoryVectorStore {
  private chunks: Chunk[] = [];
  private documents: Map<string, Document> = new Map();

  async addDocument(doc: Document, chunkingOptions?: ChunkingOptions): Promise<void> {
    this.documents.set(doc.id, doc);
    const chunks = chunkDocument(doc, chunkingOptions || DEFAULT_CHUNKING);

    // Embeddings üret
    const embeddings = await generateEmbeddings(chunks.map((c) => c.content));
    chunks.forEach((chunk, i) => {
      chunk.embedding = embeddings[i];
      this.chunks.push(chunk);
    });
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = (await generateEmbeddings([query]))[0];

    const scored = this.chunks
      .map((chunk) => ({
        chunk,
        document: this.documents.get(chunk.documentId),
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }

  async hybridSearch(query: string, topK: number = 5): Promise<SearchResult[]> {
    const semantic = await this.search(query, topK * 2);

    // Keyword search (BM25-like basit)
    const queryTokens = query.toLowerCase().split(/\s+/);
    const keywordScored = this.chunks
      .map((chunk) => {
        const contentTokens = chunk.content.toLowerCase().split(/\s+/);
        let score = 0;
        for (const qt of queryTokens) {
          for (const ct of contentTokens) {
            if (ct.includes(qt)) score += 1;
          }
        }
        return { chunk, document: this.documents.get(chunk.documentId), score: score / queryTokens.length };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK * 2);

    // Merge & re-rank
    const merged = new Map<string, SearchResult>();
    for (const r of semantic) {
      merged.set(r.chunk.id, { ...r, rerankedScore: r.score * 0.7 });
    }
    for (const r of keywordScored) {
      const existing = merged.get(r.chunk.id);
      if (existing) {
        existing.rerankedScore! += r.score * 0.3;
      } else {
        merged.set(r.chunk.id, { ...r, rerankedScore: r.score * 0.3 });
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => (b.rerankedScore || 0) - (a.rerankedScore || 0))
      .slice(0, topK);
  }

  clear(): void {
    this.chunks = [];
    this.documents.clear();
  }

  getStats(): { documentCount: number; chunkCount: number } {
    return { documentCount: this.documents.size, chunkCount: this.chunks.length };
  }
}

// Singleton
let _store: InMemoryVectorStore | null = null;

export function getVectorStore(): InMemoryVectorStore {
  if (!_store) {
    _store = new InMemoryVectorStore();
  }
  return _store;
}

// ---------- Context Assembly ----------

export interface RAGContext {
  query: string;
  results: SearchResult[];
  assembledContext: string;
  tokenEstimate: number;
}

export function assembleContext(
  query: string,
  results: SearchResult[],
  maxTokens: number = 4000
): RAGContext {
  const parts: string[] = [];
  let tokenEstimate = 0;

  for (const r of results) {
    const chunk = r.chunk;
    const doc = r.document;
    const header = doc ? `## ${doc.title}\nKaynak: ${doc.source || 'internal'}\n\n` : '';
    const part = `${header}${chunk.content}\n\n--- (Skor: ${r.score.toFixed(3)}) ---\n\n`;
    const partTokens = Math.ceil(part.length / 4);

    if (tokenEstimate + partTokens > maxTokens) break;

    parts.push(part);
    tokenEstimate += partTokens;
  }

  return {
    query,
    results,
    assembledContext: parts.join('\n'),
    tokenEstimate,
  };
}
