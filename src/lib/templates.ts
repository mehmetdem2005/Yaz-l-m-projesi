/**
 * Proje Şablonları Kütüphanesi
 * AI stüdyo için hazır başlangıç noktaları
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'api' | 'mobile' | 'data' | 'infra' | 'ai';
  icon: string; // lucide icon name
  files: { path: string; content: string; language: string }[];
  recommendedStandards: string[];
  recommendedModels: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description:
      'Multi-tenant SaaS yönetim paneli. Kullanıcı yönetimi, billing, analytics ve ayarlar modülleri içerir.',
    category: 'web',
    icon: 'LayoutDashboard',
    recommendedStandards: ['soc2', 'iso-27001', 'gdpr'],
    recommendedModels: ['deepseek-chat', 'deepseek-v4-pro'],
    estimatedTime: '2-3 saat',
    difficulty: 'intermediate',
    files: [
      {
        path: 'src/app/page.tsx',
        language: 'tsx',
        content:
          '// SaaS Dashboard\nexport default function Dashboard() {\n  return <div>Dashboard</div>;\n}',
      },
      {
        path: 'src/lib/auth.ts',
        language: 'ts',
        content: '// Multi-tenant auth\nexport function getTenantId() {}',
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Platform',
    description:
      'Ürün kataloğu, sepet, ödeme (Stripe), sipariş yönetimi. PCI-DSS uyumlu ödeme akışı.',
    category: 'web',
    icon: 'ShoppingCart',
    recommendedStandards: ['pci-dss', 'gdpr', 'iso-27001'],
    recommendedModels: ['deepseek-chat', 'deepseek-v4-flash'],
    estimatedTime: '4-6 saat',
    difficulty: 'advanced',
    files: [
      {
        path: 'src/app/checkout/page.tsx',
        language: 'tsx',
        content: '// PCI-compliant checkout\n// Stripe Elements kullanır',
      },
    ],
  },
  {
    id: 'blog-cms',
    name: 'Blog / CMS',
    description: 'Markdown tabanlı blog, admin paneli, SEO optimizasyonu, RSS feed.',
    category: 'web',
    icon: 'FileText',
    recommendedStandards: ['iso-25010', 'iso-9001'],
    recommendedModels: ['deepseek-chat', 'deepseek-v4-flash'],
    estimatedTime: '1-2 saat',
    difficulty: 'beginner',
    files: [
      {
        path: 'src/app/blog/[slug]/page.tsx',
        language: 'tsx',
        content: '// SSG blog post',
      },
    ],
  },
  {
    id: 'admin-panel',
    name: 'Admin Panel',
    description: 'CRUD operasyonları, rol yönetimi, audit log. Internal tool için ideal.',
    category: 'web',
    icon: 'Settings',
    recommendedStandards: ['iso-27001', 'cobit'],
    recommendedModels: ['deepseek-chat'],
    estimatedTime: '2-3 saat',
    difficulty: 'intermediate',
    files: [
      {
        path: 'src/app/admin/users/page.tsx',
        language: 'tsx',
        content: '// User management',
      },
    ],
  },
  {
    id: 'rest-api',
    name: 'REST API Backend',
    description: 'Express/Fastify REST API, JWT auth, rate limiting, OpenAPI dokümantasyonu.',
    category: 'api',
    icon: 'Server',
    recommendedStandards: ['owasp-top10', 'iso-27001'],
    recommendedModels: ['deepseek-chat', 'deepseek-v4-flash'],
    estimatedTime: '3-4 saat',
    difficulty: 'intermediate',
    files: [
      {
        path: 'src/server.ts',
        language: 'ts',
        content: '// Fastify server\nimport Fastify from "fastify";',
      },
    ],
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Conversion-optimized landing page, A/B test ready, analytics entegre.',
    category: 'web',
    icon: 'Rocket',
    recommendedStandards: ['iso-25010'],
    recommendedModels: ['deepseek-v4-flash'],
    estimatedTime: '30 dk',
    difficulty: 'beginner',
    files: [
      {
        path: 'src/app/page.tsx',
        language: 'tsx',
        content: '// Landing page',
      },
    ],
  },
  {
    id: 'ai-agent',
    name: 'AI Agent Backend',
    description: 'ReAct pattern agent, function calling, memory, tool use. DeepSeek entegre.',
    category: 'ai',
    icon: 'Bot',
    recommendedStandards: ['eu-ai-act', 'nist-ai-rmf', 'iso-42001'],
    recommendedModels: ['deepseek-v4-pro', 'deepseek-reasoner'],
    estimatedTime: '5-8 saat',
    difficulty: 'advanced',
    files: [
      {
        path: 'src/agent/Agent.ts',
        language: 'ts',
        content: '// ReAct agent\nclass Agent {\n  async think(input: string) {}\n}',
      },
    ],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline, Airflow/Prefect, data validation, lineage tracking.',
    category: 'data',
    icon: 'Database',
    recommendedStandards: ['iso-9001', 'gdpr'],
    recommendedModels: ['deepseek-chat'],
    estimatedTime: '4-5 saat',
    difficulty: 'advanced',
    files: [
      {
        path: 'pipelines/etl.py',
        language: 'python',
        content: '# ETL pipeline\nimport prefect',
      },
    ],
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
