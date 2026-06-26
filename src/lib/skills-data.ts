/**
 * Skill Registry — AI'a öğretilen yetkinlikler
 *
 * Her skill:
 * - Belirli bir alanda uzmanlık (motion, ux, security, vb.)
 * - Markdown doküman olarak saklanır
 * - AI'a sistem prompt'a enjekte edilir
 * - Kullanıcı kendi skill'ini ekleyebilir
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  file: string; // markdown path
  enabled: boolean;
  version: string;
  tags: string[];
  icon: string;
  capabilities: string[];
  estimatedTokens: number;
  popular: boolean;
}

export type SkillCategory =
  | 'motion'
  | 'ux'
  | 'security'
  | 'code-quality'
  | 'enterprise'
  | 'ai'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'custom';

export const SKILL_CATEGORIES: { id: SkillCategory; label: string; color: string; icon: string }[] = [
  { id: 'motion', label: 'Motion & Animasyon', color: '#ec4899', icon: 'Sparkles' },
  { id: 'ux', label: 'UX Devrimi', color: '#a855f7', icon: 'Wand2' },
  { id: 'security', label: 'Güvenlik', color: '#ef4444', icon: 'Shield' },
  { id: 'code-quality', label: 'Kod Kalitesi', color: '#10b981', icon: 'Code2' },
  { id: 'enterprise', label: 'Enterprise Mimari', color: '#3b82f6', icon: 'Building2' },
  { id: 'ai', label: 'AI Engineering', color: '#06b6d4', icon: 'Bot' },
  { id: 'frontend', label: 'Frontend', color: '#f59e0b', icon: 'Layout' },
  { id: 'backend', label: 'Backend', color: '#84cc16', icon: 'Server' },
  { id: 'devops', label: 'DevOps', color: '#8b5cf6', icon: 'GitBranch' },
  { id: 'custom', label: 'Özel', color: '#64748b', icon: 'Box' },
];

// ---------- Built-in Skills ----------

export const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'motion-design',
    name: 'Motion Design & Animasyon',
    description:
      'Framer Motion ile ileri animasyon teknikleri. Spring physics, gesture, page transition, micro-interaction, scroll-driven animasyon.',
    category: 'motion',
    file: 'docs/skills/motion-design.md',
    enabled: true,
    version: '1.0.0',
    tags: ['framer-motion', 'animation', 'spring', 'gesture'],
    icon: 'Sparkles',
    capabilities: [
      'Spring physics animasyonlar',
      'Page transition (route-level)',
      'Micro-interactions (hover, tap, focus)',
      'Scroll-driven animasyon (parallax, reveal)',
      'Stagger animations',
      'Layout animations (AnimatePresence)',
      'Performance: will-change, transform optimizasyonu',
      'Accessibility: prefers-reduced-motion',
    ],
    estimatedTokens: 2500,
    popular: true,
  },
  {
    id: 'ux-revolution',
    name: 'UX Devrimi',
    description:
      'Modern UX pattern\'leri: spatial UI, glassmorphism, adaptive interfaces, magnetic interactions, voice-first, gesture-driven.',
    category: 'ux',
    file: 'docs/skills/ux-revolution.md',
    enabled: true,
    version: '1.0.0',
    tags: ['ux', 'spatial', 'glassmorphism', 'adaptive', 'voice'],
    icon: 'Wand2',
    capabilities: [
      'Spatial computing & 3D UI',
      'Glassmorphism, neomorphism derin uygulama',
      'Adaptive UI (context-aware)',
      'Predictive UX (AI-driven)',
      'Skeleton → content morphing',
      'Magnetic buttons, elastic interactions',
      'Custom cursor, magnetic hover',
      'Page transitions (slide, fade, scale, blur)',
    ],
    estimatedTokens: 2200,
    popular: true,
  },
  {
    id: 'code-quality',
    name: 'Kod Kalitesi',
    description:
      'SOLID, Clean Code, refactoring patterns, TypeScript strict, React 19 patterns, performance optimization, testing.',
    category: 'code-quality',
    file: 'docs/skills/code-quality.md',
    enabled: true,
    version: '1.0.0',
    tags: ['solid', 'clean-code', 'refactoring', 'typescript', 'react-19'],
    icon: 'Code2',
    capabilities: [
      'SOLID principles derin uygulama',
      'Clean Code (Robert Martin)',
      'Refactoring patterns',
      'TypeScript strict mode best practices',
      'React 19 (Server Components, Suspense)',
      'Performance optimization',
      'Testing (Vitest, Playwright, MSW)',
      'Design patterns',
    ],
    estimatedTokens: 2800,
    popular: true,
  },
  {
    id: 'security-hardening',
    name: 'Güvenlik Hardening',
    description:
      'OWASP Top 10 mitigation, input validation, XSS/CSRF/SSRF prevention, auth best practices, cryptography, secrets management.',
    category: 'security',
    file: 'docs/skills/security-hardening.md',
    enabled: true,
    version: '1.0.0',
    tags: ['owasp', 'xss', 'csrf', 'auth', 'crypto'],
    icon: 'Shield',
    capabilities: [
      'OWASP Top 10 mitigation kod örnekleri',
      'Input validation (zod, valibot)',
      'SQL injection prevention',
      'XSS prevention (CSP, sanitization)',
      'CSRF prevention (SameSite, tokens)',
      'SSRF prevention',
      'Authentication best practices',
      'Cryptography & secrets management',
    ],
    estimatedTokens: 3000,
    popular: true,
  },
  {
    id: 'enterprise-architecture',
    name: 'Enterprise Architecture',
    description:
      'DDD, CQRS, Event Sourcing, microservices patterns, hexagonal architecture, API design, observability.',
    category: 'enterprise',
    file: 'docs/skills/enterprise-architecture.md',
    enabled: true,
    version: '1.0.0',
    tags: ['ddd', 'cqrs', 'microservices', 'hexagonal', 'observability'],
    icon: 'Building2',
    capabilities: [
      'Domain-Driven Design (DDD)',
      'CQRS + Event Sourcing',
      'Microservices patterns (Saga, Outbox)',
      'Hexagonal Architecture',
      'API design (REST, GraphQL, gRPC)',
      'Message queue patterns',
      'Database design & sharding',
      'Caching strategies',
      'Observability (OpenTelemetry)',
    ],
    estimatedTokens: 3200,
    popular: true,
  },
  {
    id: 'ai-engineering',
    name: 'AI Engineering',
    description:
      'Prompt engineering, RAG architectures, vector DBs, embeddings, chunking, re-ranking, agent patterns, evaluation.',
    category: 'ai',
    file: 'docs/skills/ai-engineering.md',
    enabled: true,
    version: '1.0.0',
    tags: ['rag', 'embeddings', 'vector-db', 'agents', 'evaluation'],
    icon: 'Bot',
    capabilities: [
      'Prompt engineering (CoT, ToT, ReAct)',
      'RAG architectures (basic, advanced, hybrid)',
      'Vector DB selection',
      'Embedding strategies',
      'Chunking strategies',
      'Re-ranking (cross-encoder)',
      'Agent patterns (ReAct, Plan-and-Execute)',
      'Memory patterns',
      'Evaluation (LLM-as-judge, RAGAS)',
    ],
    estimatedTokens: 3500,
    popular: true,
  },
];

export function getSkillById(id: string): Skill | undefined {
  return BUILTIN_SKILLS.find((s) => s.id === id);
}

export function getSkillsByCategory(cat: SkillCategory): Skill[] {
  return BUILTIN_SKILLS.filter((s) => s.category === cat);
}

/**
 * AI'a enjekte edilecek skill özet prompt'u
 */
export function buildSkillPrompt(skillIds: string[]): string {
  const skills = skillIds
    .map((id) => getSkillById(id))
    .filter(Boolean) as Skill[];

  if (skills.length === 0) return '';

  const parts = skills.map((s) => {
    return `## Skill: ${s.name}
Kategori: ${s.category}
Yetkinlikler:
${s.capabilities.map((c) => `- ${c}`).join('\n')}

Bu skill'deki prensiplere uyarak kod üret.`;
  });

  return `\n\n=== AKTİF SKILLER ===\n${parts.join('\n\n')}\n=== SKILL SONU ===\n`;
}
