/**
 * Agent Memory — Gelişmiş bellek yönetimi
 *
 * 4 katmanlı bellek:
 * 1. Working Memory (kısa süreli — mevcut sohbet context)
 * 2. Episodic Memory (olay bazlı — geçmiş etkileşimler)
 * 3. Semantic Memory (kalıcı bilgi — kullanıcı tercihleri, proje bilgisi)
 * 4. Procedural Memory (prosedür — öğrenilmiş pattern'ler, skill'ler)
 */

export interface MemoryItem {
  id: string;
  type: 'working' | 'episodic' | 'semantic' | 'procedural';
  content: string;
  embedding?: number[];
  importance: number; // 0-1
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  decay: number; // 0-1, 1 = no decay
  metadata?: Record<string, unknown>;
  tags?: string[];
}

export interface MemoryQuery {
  type?: MemoryItem['type'];
  tags?: string[];
  content?: string; // Semantic search
  limit?: number;
  minImportance?: number;
}

export interface MemoryStats {
  total: number;
  byType: Record<MemoryItem['type'], number>;
  totalSize: number;
  avgImportance: number;
}

/**
 * Time-based decay (önem azalması)
 */
function applyDecay(item: MemoryItem): number {
  const ageHours = (Date.now() - new Date(item.lastAccessedAt).getTime()) / (1000 * 60 * 60);
  const decayFactor = Math.exp(-ageHours / 168); // 1 hafta half-life
  return item.importance * item.decay * decayFactor;
}

/**
 * In-memory store (production'da vector DB ile değiştirilebilir)
 */
export class AgentMemory {
  private items: Map<string, MemoryItem> = new Map();
  private maxItems: number;

  constructor(maxItems: number = 1000) {
    this.maxItems = maxItems;
  }

  add(item: Omit<MemoryItem, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>): MemoryItem {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const fullItem: MemoryItem = {
      ...item,
      id,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 0,
      decay: item.decay ?? 1,
    };
    this.items.set(id, fullItem);
    this.evict();
    return fullItem;
  }

  get(id: string): MemoryItem | null {
    const item = this.items.get(id);
    if (!item) return null;
    item.lastAccessedAt = new Date();
    item.accessCount++;
    return item;
  }

  search(query: MemoryQuery): MemoryItem[] {
    let results = Array.from(this.items.values());

    if (query.type) {
      results = results.filter((r) => r.type === query.type);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((r) => query.tags!.some((t) => r.tags?.includes(t)));
    }

    if (query.minImportance !== undefined) {
      results = results.filter((r) => applyDecay(r) >= query.minImportance!);
    }

    if (query.content) {
      // Basit keyword search (production'da embedding)
      const tokens = query.content.toLowerCase().split(/\s+/);
      results = results
        .map((r) => {
          const contentTokens = r.content.toLowerCase().split(/\s+/);
          let overlap = 0;
          for (const t of tokens) {
            if (contentTokens.some((ct) => ct.includes(t))) overlap++;
          }
          return { item: r, score: overlap / tokens.length + applyDecay(r) };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item);
    } else {
      results = results.sort((a, b) => applyDecay(b) - applyDecay(a));
    }

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // Update access
    results.forEach((r) => {
      r.lastAccessedAt = new Date();
      r.accessCount++;
    });

    return results;
  }

  /**
   * Working memory'ye ekle (geçici, otomatik temizlenir)
   */
  addToWorkingMemory(content: string, tags?: string[]): MemoryItem {
    return this.add({
      type: 'working',
      content,
      importance: 0.5,
      decay: 0.7, // hızlı decay
      tags,
    });
  }

  /**
   * Episodic memory'ye ekle (olay)
   */
  addEpisode(content: string, importance: number = 0.7, tags?: string[]): MemoryItem {
    return this.add({
      type: 'episodic',
      content,
      importance,
      decay: 0.95,
      tags,
    });
  }

  /**
   * Semantic memory'ye ekle (kalıcı bilgi)
   */
  addFact(content: string, importance: number = 0.9, tags?: string[]): MemoryItem {
    return this.add({
      type: 'semantic',
      content,
      importance,
      decay: 1.0, // no decay
      tags,
    });
  }

  /**
   * Procedural memory'ye ekle (öğrenilmiş pattern)
   */
  addProcedure(content: string, importance: number = 0.8, tags?: string[]): MemoryItem {
    return this.add({
      type: 'procedural',
      content,
      importance,
      decay: 0.98,
      tags,
    });
  }

  /**
   * Eski/düşük öneme sahip item'ları temizle
   */
  private evict(): void {
    if (this.items.size <= this.maxItems) return;

    const sorted = Array.from(this.items.entries())
      .map(([id, item]) => ({ id, score: applyDecay(item) }))
      .sort((a, b) => a.score - b.score);

    const toRemove = sorted.slice(0, this.items.size - this.maxItems);
    for (const { id } of toRemove) {
      this.items.delete(id);
    }
  }

  /**
   * Reflection — geçmiş olaylardan öğrenme
   * Episodic memory'deki benzer olayları gruplar, semantic memory'ye yükseltir
   */
  async reflect(): Promise<MemoryItem[]> {
    const episodes = this.search({ type: 'episodic', limit: 50 });
    const promoted: MemoryItem[] = [];

    // Basit clustering: benzer içeriği olan olayları grupla
    const clusters: Map<string, MemoryItem[]> = new Map();
    for (const ep of episodes) {
      // İlk 5 kelimeye göre cluster
      const key = ep.content.split(/\s+/).slice(0, 5).join(' ');
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(ep);
    }

    // 3+ olay aynı cluster'daysa semantic memory'ye yükselt
    for (const [key, items] of clusters) {
      if (items.length >= 3) {
        const fact = this.addFact(
          `Pattern öğrenildi: "${key}..." — ${items.length} kez karşılaşıldı. Örnek: ${items[0].content}`,
          0.85,
          ['learned', 'reflection']
        );
        promoted.push(fact);
      }
    }

    return promoted;
  }

  /**
   * Context window için özet — son N önemli item
   */
  getContextSummary(maxItems: number = 10, maxChars: number = 2000): string {
    const items = this.search({ limit: maxItems });
    let context = '';
    for (const item of items) {
      const line = `[${item.type}] ${item.content}\n`;
      if (context.length + line.length > maxChars) break;
      context += line;
    }
    return context;
  }

  clear(type?: MemoryItem['type']): void {
    if (!type) {
      this.items.clear();
      return;
    }
    for (const [id, item] of this.items) {
      if (item.type === type) this.items.delete(id);
    }
  }

  getStats(): MemoryStats {
    const items = Array.from(this.items.values());
    const byType: Record<MemoryItem['type'], number> = {
      working: 0,
      episodic: 0,
      semantic: 0,
      procedural: 0,
    };
    let totalImportance = 0;
    let totalSize = 0;

    for (const item of items) {
      byType[item.type]++;
      totalImportance += item.importance;
      totalSize += item.content.length;
    }

    return {
      total: items.length,
      byType,
      totalSize,
      avgImportance: items.length ? totalImportance / items.length : 0,
    };
  }
}

// Singleton per session
const _memories: Map<string, AgentMemory> = new Map();

export function getAgentMemory(sessionId: string = 'default'): AgentMemory {
  if (!_memories.has(sessionId)) {
    _memories.set(sessionId, new AgentMemory());
  }
  return _memories.get(sessionId)!;
}
