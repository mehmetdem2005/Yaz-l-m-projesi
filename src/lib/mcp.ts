/**
 * MCP (Model Context Protocol) Client
 *
 * MCP server'lara bağlanır, tool ve resource'ları kullanır.
 * Spec: https://modelcontextprotocol.io
 *
 * Transport'lar:
 * - stdio (local processes)
 * - HTTP+SSE (remote)
 *
 * Primitives:
 * - Resources (read data)
 * - Tools (execute actions)
 * - Prompts (template messages)
 */

export type MCPTransport = 'stdio' | 'sse' | 'websocket';

export interface MCPServerConfig {
  id: string;
  name: string;
  transport: MCPTransport;
  command?: string; // for stdio
  args?: string[];
  url?: string; // for sse/websocket
  env?: Record<string, string>;
  enabled: boolean;
  status?: 'connected' | 'disconnected' | 'error';
  capabilities?: {
    resources: boolean;
    tools: boolean;
    prompts: boolean;
  };
  discoveredTools?: MCPTool[];
  discoveredResources?: MCPResource[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverId: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  serverId: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
  serverId: string;
}

/**
 * MCP Client — server bağlantılarını yönetir
 */
export class MCPClient {
  private servers: Map<string, MCPServerConfig> = new Map();

  /**
   * MCP server ekle (henüz bağlanma)
   */
  addServer(config: Omit<MCPServerConfig, 'status'>): MCPServerConfig {
    const server: MCPServerConfig = {
      ...config,
      status: 'disconnected',
    };
    this.servers.set(config.id, server);
    return server;
  }

  removeServer(id: string): void {
    this.servers.delete(id);
  }

  listServers(): MCPServerConfig[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): MCPServerConfig | undefined {
    return this.servers.get(id);
  }

  /**
   * Server'a bağlan (simülasyon — gerçek impl. JSON-RPC 2.0 over stdio/SSE)
   */
  async connect(id: string): Promise<MCPServerConfig> {
    const server = this.servers.get(id);
    if (!server) throw new Error(`Server ${id} bulunamadı`);

    // Simülasyon: 1 saniye bekle, "bağlandı" işaretle
    await new Promise((r) => setTimeout(r, 500));

    server.status = 'connected';
    server.capabilities = { resources: true, tools: true, prompts: true };

    // Demo tools (gerçek impl'de server'dan discovery yapılır)
    if (server.id === 'filesystem') {
      server.discoveredTools = [
        {
          name: `read_file`,
          description: `Dosya okur`,
          inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
          serverId: server.id,
        },
        {
          name: `write_file`,
          description: `Dosya yazar`,
          inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
          serverId: server.id,
        },
      ];
    } else if (server.id === 'github') {
      server.discoveredTools = [
        {
          name: `create_issue`,
          description: `GitHub issue oluşturur`,
          inputSchema: { type: 'object', properties: { repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, required: ['repo', 'title'] },
          serverId: server.id,
        },
        {
          name: `list_pulls`,
          description: `Pull request listesi`,
          inputSchema: { type: 'object', properties: { repo: { type: 'string' } }, required: ['repo'] },
          serverId: server.id,
        },
      ];
    } else if (server.id === 'postgres') {
      server.discoveredTools = [
        {
          name: `query`,
          description: `SQL sorgusu çalıştırır`,
          inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] },
          serverId: server.id,
        },
      ];
    }

    return server;
  }

  async disconnect(id: string): Promise<void> {
    const server = this.servers.get(id);
    if (server) server.status = 'disconnected';
  }

  /**
   * Tool çağır (server'a JSON-RPC request)
   */
  async callTool(serverId: string, toolName: string, args: Record<string, unknown>): Promise<string> {
    const server = this.servers.get(serverId);
    if (!server || server.status !== 'connected') {
      throw new Error(`Server ${serverId} bağlı değil`);
    }

    // Simülasyon
    return `[MCP:${server.name}] Tool "${toolName}" çağrıldı. Args: ${JSON.stringify(args)}`;
  }

  /**
   * Tüm bağlı server'lardan tool listesi topla
   */
  listAllTools(): MCPTool[] {
    const all: MCPTool[] = [];
    for (const server of this.servers.values()) {
      if (server.status === 'connected' && server.discoveredTools) {
        all.push(...server.discoveredTools);
      }
    }
    return all;
  }

  listAllResources(): MCPResource[] {
    const all: MCPResource[] = [];
    for (const server of this.servers.values()) {
      if (server.status === 'connected' && server.discoveredResources) {
        all.push(...server.discoveredResources);
      }
    }
    return all;
  }
}

// Singleton
let _client: MCPClient | null = null;

export function getMCPClient(): MCPClient {
  if (!_client) {
    _client = new MCPClient();
    // Built-in server templates (henüz bağlı değil)
    _client.addServer({
      id: 'filesystem',
      name: `Filesystem MCP`,
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
      enabled: true,
    });
    _client.addServer({
      id: 'github',
      name: `GitHub MCP`,
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '' },
      enabled: true,
    });
    _client.addServer({
      id: 'postgres',
      name: `PostgreSQL MCP`,
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: { DATABASE_URL: '' },
      enabled: true,
    });
  }
  return _client;
}

// ---------- Built-in MCP server catalog ----------

export interface MCPServerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'filesystem' | 'database' | 'api' | 'search' | 'cloud' | 'devops' | 'productivity';
  command: string;
  args: string[];
  env?: Record<string, string>;
  docsUrl: string;
  popular: boolean;
}

export const MCP_SERVER_CATALOG: MCPServerTemplate[] = [
  {
    id: 'filesystem',
    name: `Filesystem`,
    description: `Local dosya sistemi erişimi`,
    category: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    popular: true,
  },
  {
    id: 'github',
    name: `GitHub`,
    description: `GitHub repo, issue, PR, action yönetimi`,
    category: 'devops',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '<your-token>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    popular: true,
  },
  {
    id: 'postgres',
    name: `PostgreSQL`,
    description: `PostgreSQL veritabanı sorgulama`,
    category: 'database',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    env: { DATABASE_URL: '<postgres-url>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    popular: true,
  },
  {
    id: 'sqlite',
    name: `SQLite`,
    description: `SQLite veritabanı sorgulama`,
    category: 'database',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', '/path/to/db.sqlite'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    popular: false,
  },
  {
    id: 'brave-search',
    name: `Brave Search`,
    description: `Brave Search API ile web araması`,
    category: 'search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: { BRAVE_API_KEY: '<your-key>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    popular: true,
  },
  {
    id: 'google-drive',
    name: `Google Drive`,
    description: `Google Drive dosya erişimi`,
    category: 'cloud',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-drive'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-drive',
    popular: false,
  },
  {
    id: 'slack',
    name: `Slack`,
    description: `Slack mesajları ve kanallar`,
    category: 'api',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    env: { SLACK_BOT_TOKEN: '<xoxb-token>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    popular: true,
  },
  {
    id: 'puppeteer',
    name: `Puppeteer`,
    description: `Browser otomasyonu, web scraping`,
    category: 'api',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    popular: true,
  },
  {
    id: 'memory',
    name: `Memory`,
    description: `Knowledge graph tabanlı kalıcı bellek`,
    category: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    popular: true,
  },
  {
    id: 'fetch',
    name: `Fetch`,
    description: `Web sayfası getirme ve parse`,
    category: 'search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    popular: true,
  },

  // ---------- YENİ: Vercel MCP ----------
  {
    id: 'vercel',
    name: `Vercel MCP`,
    description: `Vercel deploy, projects, domains — tüm yetkiler`,
    category: 'cloud',
    command: 'npx',
    args: ['-y', '@vercel/mcp-adapter'],
    env: { VERCEL_API_KEY: '<your-vercel-token>', VERCEL_TEAM_ID: '<optional-team-id>' },
    docsUrl: 'https://github.com/vercel/vercel-mcp',
    popular: true,
  },

  // ---------- YENİ: Supabase MCP ----------
  {
    id: 'supabase',
    name: `Supabase MCP`,
    description: `Supabase DB, Auth, Storage, Realtime — tüm yetkiler`,
    category: 'database',
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase'],
    env: {
      SUPABASE_URL: '<https://xxx.supabase.co>',
      SUPABASE_KEY: '<anon-or-service-role-key>',
    },
    docsUrl: 'https://github.com/supabase/mcp-server-supabase',
    popular: true,
  },

  // ---------- YENİ: Render MCP ----------
  {
    id: 'render',
    name: `Render MCP`,
    description: `Render.com servis yönetimi — deploy, restart, env vars`,
    category: 'cloud',
    command: 'npx',
    args: ['-y', '@render/mcp-server'],
    env: { RENDER_API_KEY: '<rnd_xxx>' },
    docsUrl: 'https://github.com/render-oss/mcp-server',
    popular: false,
  },

  // ---------- YENİ: GitHub MCP (resmi) ----------
  {
    id: 'github-official',
    name: `GitHub MCP (Official)`,
    description: `GitHub\ın resmi MCP server\ı — tüm repo yetkileri`,
    category: 'devops',
    command: 'docker',
    args: ['run', '-i', '--rm', '-e', 'GITHUB_PERSONAL_ACCESS_TOKEN', 'ghcr.io/github/github-mcp-server'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '<ghp_xxx>' },
    docsUrl: 'https://github.com/github/github-mcp-server',
    popular: true,
  },

  // ---------- YENİ: OpenAI MCP ----------
  {
    id: 'openai',
    name: `OpenAI MCP`,
    description: `GPT-4, DALL-E, Whisper, Embeddings — tüm modeller`,
    category: 'search',
    command: 'npx',
    args: ['-y', '@openai/mcp-server'],
    env: { OPENAI_API_KEY: '<sk-xxx>' },
    docsUrl: 'https://github.com/openai/mcp-server',
    popular: true,
  },

  // ---------- YENİ: Anthropic MCP ----------
  {
    id: 'anthropic',
    name: `Anthropic MCP`,
    description: `Claude 3.5 Sonnet, Opus, Haiku — tüm Claude modelleri`,
    category: 'search',
    command: 'npx',
    args: ['-y', '@anthropic/mcp-server'],
    env: { ANTHROPIC_API_KEY: '<sk-ant-xxx>' },
    docsUrl: 'https://github.com/anthropics/anthropic-mcp',
    popular: true,
  },

  // ---------- YENİ: Filesystem (full access) ----------
  {
    id: 'filesystem-full',
    name: `Filesystem (Tüm Yetkiler)`,
    description: `Sınırsız dosya erişimi — oku, yaz, sil, taşı (root erişim)`,
    category: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    popular: false,
  },

  // ---------- YENİ: Shell (full access) ----------
  {
    id: 'shell',
    name: `Shell (Tüm Yetkiler)`,
    description: `Sınırsız shell komut çalıştırma — sudo dahil (riskli!)`,
    category: 'devops',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-shell'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/shell',
    popular: false,
  },

  // ---------- YENİ: Browser/Puppeteer (full access) ----------
  {
    id: 'browser',
    name: `Browser Automation`,
    description: `Browser kontrolü — scrape, screenshot, form doldur, click`,
    category: 'api',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer', '--headless=false'],
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    popular: true,
  },

  // ---------- YENİ: PostgreSQL (full access) ----------
  {
    id: 'postgres-full',
    name: `PostgreSQL (Admin)`,
    description: `Tüm PostgreSQL yetkileri — CREATE, DROP, ALTER, INSERT, UPDATE, DELETE`,
    category: 'database',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    env: { DATABASE_URL: '<postgresql://user:pass@host:5432/db>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    popular: true,
  },

  // ---------- YENİ: Sentry MCP ----------
  {
    id: 'sentry',
    name: `Sentry MCP`,
    description: `Hata takibi, issue yönetimi, release tracking`,
    category: 'devops',
    command: 'npx',
    args: ['-y', '@sentry/mcp-server'],
    env: { SENTRY_AUTH_TOKEN: '<sntry_xxx>' },
    docsUrl: 'https://github.com/getsentry/sentry-mcp-server',
    popular: false,
  },

  // ---------- YENİ: Stripe MCP ----------
  {
    id: 'stripe',
    name: `Stripe MCP`,
    description: `Ödeme, müşteri, abonelik, invoice yönetimi`,
    category: 'api',
    command: 'npx',
    args: ['-y', '@stripe/mcp-server'],
    env: { STRIPE_API_KEY: '<sk_live_or_test_xxx>' },
    docsUrl: 'https://github.com/stripe/stripe-mcp-server',
    popular: true,
  },

  // ---------- YENİ: Linear MCP ----------
  {
    id: 'linear',
    name: `Linear MCP`,
    description: `Linear issue, project, sprint yönetimi`,
    category: 'productivity',
    command: 'npx',
    args: ['-y', '@linear/mcp-server'],
    env: { LINEAR_API_KEY: '<lin_api_xxx>' },
    docsUrl: 'https://github.com/linear/linear-mcp-server',
    popular: false,
  },

  // ---------- YENİ: Notion (official) ----------
  {
    id: 'notion-official',
    name: `Notion (Official)`,
    description: `Notion sayfa, database, block — tüm yetkiler`,
    category: 'productivity',
    command: 'npx',
    args: ['-y', '@notionhq/notion-mcp-server'],
    env: { NOTION_API_KEY: '<ntn_xxx>' },
    docsUrl: 'https://github.com/makenotion/notion-mcp-server',
    popular: true,
  },

  // ---------- YENİ: AWS MCP ----------
  {
    id: 'aws',
    name: `AWS MCP`,
    description: `AWS S3, EC2, Lambda, DynamoDB, CloudFormation — tüm servisler`,
    category: 'cloud',
    command: 'npx',
    args: ['-y', '@aws/mcp-server'],
    env: {
      AWS_ACCESS_KEY_ID: '<AKIAxxx>',
      AWS_SECRET_ACCESS_KEY: '<secret>',
      AWS_REGION: '<us-east-1>',
    },
    docsUrl: 'https://github.com/aws/aws-mcp-server',
    popular: false,
  },

  // ---------- YENİ: Google Drive MCP ----------
  {
    id: 'gdrive',
    name: `Google Drive`,
    description: `Google Drive dosya okuma/yazma — tüm dosyalar`,
    category: 'cloud',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-drive'],
    env: { GOOGLE_DRIVE_API_KEY: '<xxx>' },
    docsUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-drive',
    popular: false,
  },
];
