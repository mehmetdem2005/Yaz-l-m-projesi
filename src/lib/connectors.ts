/**
 * Connectors — Dış sistem entegrasyonları
 *
 * Connector tipleri:
 * - github (repo, issue, PR, action)
 * - gitlab (repo, MR)
 * - slack (mesaj, kanal)
 * - jira (issue, sprint)
 * - notion (sayfa, database)
 * - postgres (sorgu)
 * - mongodb (sorgu)
 * - redis (key/value)
 * - rest (generic REST API)
 * - graphql (generic GraphQL)
 * - webhook (incoming/outgoing)
 * - s3 (object storage)
 */

export type ConnectorType =
  | 'github'
  | 'gitlab'
  | 'slack'
  | 'jira'
  | 'notion'
  | 'postgres'
  | 'mongodb'
  | 'redis'
  | 'rest'
  | 'graphql'
  | 'webhook'
  | 's3'
  | 'vercel'
  | 'supabase'
  | 'render'
  | 'netlify'
  | 'cloudflare'
  | 'openai'
  | 'anthropic'
  | 'deepseek';

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface ConnectorConfig {
  id: string;
  type: ConnectorType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  status: ConnectorStatus;
  lastSync?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    required: boolean;
    description?: string;
  }>;
  returns: string;
}

export interface ConnectorSchema {
  type: ConnectorType;
  label: string;
  icon: string;
  description: string;
  category: 'devops' | 'communication' | 'database' | 'storage' | 'productivity' | 'custom' | 'ai' | 'cloud';
  authFields: Array<{
    key: string;
    label: string;
    type: 'string' | 'password' | 'url' | 'json';
    required: boolean;
    placeholder?: string;
    description?: string;
  }>;
  actions: ConnectorAction[];
  popular: boolean;
}

// ---------- Connector Catalog ----------

export const CONNECTOR_SCHEMAS: ConnectorSchema[] = [
  {
    type: 'github',
    label: `GitHub`,
    icon: 'Github',
    description: `GitHub repo, issue, PR, action yönetimi`,
    category: 'devops',
    authFields: [
      {
        key: 'token',
        label: `Personal Access Token`,
        type: 'password',
        required: true,
        placeholder: `ghp_xxx`,
        description: `Settings → Developer settings → Tokens`,
      },
      {
        key: 'owner',
        label: `Owner (kullanıcı/org)`,
        type: 'string',
        required: true,
        placeholder: `kullanıcı-adı`,
      },
    ],
    actions: [
      {
        id: 'create_issue',
        name: `Issue Oluştur`,
        description: `Belirtilen repo\da yeni issue açar`,
        parameters: [
          { name: 'repo', type: 'string', required: true, description: 'repo adı' },
          { name: 'title', type: 'string', required: true },
          { name: 'body', type: 'string', required: false },
          { name: 'labels', type: 'string', required: false, description: 'comma-separated' },
        ],
        returns: `issue object`,
      },
      {
        id: 'list_repos',
        name: `Repo Listesi`,
        description: `Kullanıcının tüm repolarını listeler`,
        parameters: [],
        returns: `repo[]`,
      },
      {
        id: 'create_pr',
        name: `Pull Request Oluştur`,
        description: `Yeni PR açar`,
        parameters: [
          { name: 'repo', type: 'string', required: true },
          { name: 'title', type: 'string', required: true },
          { name: 'head', type: 'string', required: true, description: 'kaynak branch' },
          { name: 'base', type: 'string', required: true, description: 'hedef branch' },
          { name: 'body', type: 'string', required: false },
        ],
        returns: `PR object`,
      },
    ],
    popular: true,
  },
  {
    type: 'slack',
    label: `Slack`,
    icon: 'MessageSquare',
    description: `Slack mesaj gönderme, kanal okuma`,
    category: 'communication',
    authFields: [
      {
        key: 'botToken',
        label: `Bot User OAuth Token`,
        type: 'password',
        required: true,
        placeholder: `xoxb-xxx`,
      },
    ],
    actions: [
      {
        id: 'send_message',
        name: `Mesaj Gönder`,
        description: `Belirtilen kanala mesaj gönderir`,
        parameters: [
          { name: 'channel', type: 'string', required: true },
          { name: 'text', type: 'string', required: true },
        ],
        returns: `message object`,
      },
      {
        id: 'list_channels',
        name: `Kanal Listesi`,
        description: `Tüm kanalları listeler`,
        parameters: [],
        returns: `channel[]`,
      },
    ],
    popular: true,
  },
  {
    type: 'postgres',
    label: `PostgreSQL`,
    icon: 'Database',
    description: `PostgreSQL veritabanı sorgulama`,
    category: 'database',
    authFields: [
      {
        key: 'connectionString',
        label: `Connection String`,
        type: 'password',
        required: true,
        placeholder: `postgresql://user:pass@host:5432/db`,
      },
    ],
    actions: [
      {
        id: 'query',
        name: `Sorgu Çalıştır`,
        description: `SQL sorgusu çalıştırır`,
        parameters: [{ name: 'sql', type: 'string', required: true }],
        returns: `rows[]`,
      },
      {
        id: 'list_tables',
        name: `Tablo Listesi`,
        description: `Tüm tabloları listeler`,
        parameters: [],
        returns: `table[]`,
      },
    ],
    popular: true,
  },
  {
    type: 'mongodb',
    label: `MongoDB`,
    icon: 'Database',
    description: `MongoDB koleksiyon sorgulama`,
    category: 'database',
    authFields: [
      {
        key: 'uri',
        label: `MongoDB URI`,
        type: 'password',
        required: true,
        placeholder: `mongodb+srv://...`,
      },
      { key: 'database', label: 'Veritabanı adı', type: 'string', required: true },
    ],
    actions: [
      {
        id: 'find',
        name: `Find`,
        description: `Koleksiyonda sorgu`,
        parameters: [
          { name: 'collection', type: 'string', required: true },
          { name: 'filter', type: 'object', required: false },
        ],
        returns: `docs[]`,
      },
    ],
    popular: false,
  },
  {
    type: 'rest',
    label: `REST API`,
    icon: 'Globe',
    description: `Generic REST API connector`,
    category: 'custom',
    authFields: [
      { key: 'baseUrl', label: 'Base URL', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { key: 'apiKey', label: 'API Key (opsiyonel)', type: 'password', required: false },
      { key: 'headers', label: 'Ek Header\'lar (JSON)', type: 'json', required: false },
    ],
    actions: [
      {
        id: 'get',
        name: `GET`,
        description: `HTTP GET isteği`,
        parameters: [
          { name: 'path', type: 'string', required: true },
          { name: 'query', type: 'object', required: false },
        ],
        returns: `response`,
      },
      {
        id: 'post',
        name: `POST`,
        description: `HTTP POST isteği`,
        parameters: [
          { name: 'path', type: 'string', required: true },
          { name: 'body', type: 'object', required: true },
        ],
        returns: `response`,
      },
    ],
    popular: true,
  },
  {
    type: 'jira',
    label: `Jira`,
    icon: 'ClipboardList',
    description: `Jira issue ve sprint yönetimi`,
    category: 'productivity',
    authFields: [
      { key: 'host', label: 'Jira Host', type: 'url', required: true, placeholder: 'https://yourteam.atlassian.net' },
      { key: 'email', label: 'Email', type: 'string', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
    ],
    actions: [
      {
        id: 'create_issue',
        name: `Issue Oluştur`,
        description: `Jira issue oluşturur`,
        parameters: [
          { name: 'project', type: 'string', required: true },
          { name: 'summary', type: 'string', required: true },
          { name: 'description', type: 'string', required: false },
          { name: 'type', type: 'string', required: true, description: 'Task, Bug, Story' },
        ],
        returns: `issue`,
      },
    ],
    popular: false,
  },
  {
    type: 'notion',
    label: `Notion`,
    icon: 'FileText',
    description: `Notion sayfa ve database`,
    category: 'productivity',
    authFields: [
      { key: 'token', label: 'Integration Token', type: 'password', required: true },
    ],
    actions: [
      {
        id: 'create_page',
        name: `Sayfa Oluştur`,
        description: `Yeni Notion sayfası`,
        parameters: [
          { name: 'parent', type: 'string', required: true },
          { name: 'title', type: 'string', required: true },
        ],
        returns: `page`,
      },
    ],
    popular: false,
  },
  {
    type: 's3',
    label: `AWS S3`,
    icon: 'Cloud',
    description: `S3 bucket dosya yönetimi`,
    category: 'storage',
    authFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'string', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'region', label: 'Region', type: 'string', required: true, placeholder: 'us-east-1' },
      { key: 'bucket', label: 'Bucket Name', type: 'string', required: true },
    ],
    actions: [
      {
        id: 'upload',
        name: `Dosya Yükle`,
        description: `S3 bucket\a dosya yükler`,
        parameters: [
          { name: 'key', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
        ],
        returns: `url`,
      },
      {
        id: 'download',
        name: `Dosya İndir`,
        description: `S3 bucket\tan dosya indirir`,
        parameters: [{ name: 'key', type: 'string', required: true }],
        returns: `content`,
      },
    ],
    popular: false,
  },

  // ---------- YENİ: Vercel ----------
  {
    type: 'vercel',
    label: `Vercel`,
    icon: 'Rocket',
    description: `Vercel deploy, project, domain yönetimi (gerçek API)`,
    category: 'devops',
    authFields: [
      {
        key: 'apiKey',
        label: `Vercel API Token`,
        type: 'password',
        required: true,
        placeholder: `vercel_xxx`,
        description: `vercel.com/account/tokens adresinden alın`,
      },
      {
        key: 'teamId',
        label: `Team ID (opsiyonel)`,
        type: 'string',
        required: false,
        description: `Team deployları için`,
      },
    ],
    actions: [
      {
        id: 'deploy',
        name: `Deploy Oluştur`,
        description: `Yeni deployment oluştur`,
        parameters: [
          { name: 'name', type: 'string', required: true },
          { name: 'files', type: 'object', required: true },
          { name: 'target', type: 'string', required: false, description: 'production | preview' },
        ],
        returns: `deployment`,
      },
      {
        id: 'status',
        name: `Deploy Status`,
        description: `Deployment durumunu sorgula`,
        parameters: [{ name: 'deploymentId', type: 'string', required: true }],
        returns: `status`,
      },
      {
        id: 'list_projects',
        name: `Projeleri Listele`,
        description: `Vercel hesabınızdaki projeleri listeler`,
        parameters: [],
        returns: `project[]`,
      },
      {
        id: 'cancel',
        name: `Deploy İptal`,
        description: `Devam eden deployu iptal et`,
        parameters: [{ name: 'deploymentId', type: 'string', required: true }],
        returns: `void`,
      },
      {
        id: 'set_env',
        name: `Env Var Ayarla`,
        description: `Project environment variable ekle`,
        parameters: [
          { name: 'projectId', type: 'string', required: true },
          { name: 'key', type: 'string', required: true },
          { name: 'value', type: 'string', required: true },
        ],
        returns: `void`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: Supabase ----------
  {
    type: 'supabase',
    label: `Supabase`,
    icon: 'Database',
    description: `Supabase PostgreSQL + Auth + Storage + Realtime`,
    category: 'database',
    authFields: [
      {
        key: 'url',
        label: `Project URL`,
        type: 'url',
        required: true,
        placeholder: `https://xxx.supabase.co`,
      },
      {
        key: 'anonKey',
        label: `Anon Key`,
        type: 'password',
        required: true,
        description: `supabase.com/dashboard → Settings → API`,
      },
      {
        key: 'serviceRoleKey',
        label: `Service Role Key (admin)`,
        type: 'password',
        required: false,
        description: `Tüm yetkiler için (dikkatli kullanın)`,
      },
    ],
    actions: [
      {
        id: 'query',
        name: `Veritabanı Sorgusu`,
        description: `PostgreSQL sorgusu çalıştır`,
        parameters: [
          { name: 'table', type: 'string', required: true },
          { name: 'select', type: 'string', required: false },
          { name: 'filter', type: 'object', required: false },
        ],
        returns: `rows[]`,
      },
      {
        id: 'insert',
        name: `Kayıt Ekle`,
        description: `Tabloya yeni kayıt ekle`,
        parameters: [
          { name: 'table', type: 'string', required: true },
          { name: 'data', type: 'object', required: true },
        ],
        returns: `row`,
      },
      {
        id: 'auth_signup',
        name: `Kullanıcı Kaydı`,
        description: `Yeni kullanıcı oluştur (email + password)`,
        parameters: [
          { name: 'email', type: 'string', required: true },
          { name: 'password', type: 'string', required: true },
        ],
        returns: `user`,
      },
      {
        id: 'storage_upload',
        name: `Storage Upload`,
        description: `Supabase Storagea dosya yükle`,
        parameters: [
          { name: 'bucket', type: 'string', required: true },
          { name: 'path', type: 'string', required: true },
          { name: 'file', type: 'string', required: true },
        ],
        returns: `url`,
      },
      {
        id: 'realtime_subscribe',
        name: `Realtime Subscribe`,
        description: `Tablo değişikliklerini dinle`,
        parameters: [{ name: 'table', type: 'string', required: true }],
        returns: `subscription`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: Render ----------
  {
    type: 'render',
    label: `Render`,
    icon: 'Server',
    description: `Render.com deploy, service, environment yönetimi`,
    category: 'devops',
    authFields: [
      {
        key: 'apiKey',
        label: `Render API Key`,
        type: 'password',
        required: true,
        placeholder: `rnd_xxx`,
        description: `dashboard.render.com → Account Settings → API Keys`,
      },
    ],
    actions: [
      {
        id: 'list_services',
        name: `Servisleri Listele`,
        description: `Tüm Render servislerini listele`,
        parameters: [],
        returns: `service[]`,
      },
      {
        id: 'create_service',
        name: `Servis Oluştur`,
        description: `Yeni web service oluştur`,
        parameters: [
          { name: 'name', type: 'string', required: true },
          { name: 'repo', type: 'string', required: true },
          { name: 'branch', type: 'string', required: false },
        ],
        returns: `service`,
      },
      {
        id: 'deploy',
        name: `Deploy Trigger`,
        description: `Servis için yeni deploy tetikle`,
        parameters: [
          { name: 'serviceId', type: 'string', required: true },
          { name: 'commitId', type: 'string', required: false },
        ],
        returns: `deploy`,
      },
      {
        id: 'status',
        name: `Servis Status`,
        description: `Servis durumunu sorgula`,
        parameters: [{ name: 'serviceId', type: 'string', required: true }],
        returns: `status`,
      },
      {
        id: 'restart',
        name: `Servis Yeniden Başlat`,
        description: `Servisi restart et`,
        parameters: [{ name: 'serviceId', type: 'string', required: true }],
        returns: `void`,
      },
      {
        id: 'set_env',
        name: `Env Var Ayarla`,
        description: `Servis environment variable ekle`,
        parameters: [
          { name: 'serviceId', type: 'string', required: true },
          { name: 'key', type: 'string', required: true },
          { name: 'value', type: 'string', required: true },
        ],
        returns: `void`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: Netlify ----------
  {
    type: 'netlify',
    label: `Netlify`,
    icon: 'Rocket',
    description: `Netlify deploy + site yönetimi`,
    category: 'devops',
    authFields: [
      {
        key: 'accessToken',
        label: `Personal Access Token`,
        type: 'password',
        required: true,
        description: `app.netlify.com/user/applications`,
      },
    ],
    actions: [
      {
        id: 'list_sites',
        name: `Siteleri Listele`,
        description: `Tüm Netlify sitelerini listele`,
        parameters: [],
        returns: `site[]`,
      },
      {
        id: 'deploy',
        name: `Deploy Oluştur`,
        description: `Sitea yeni deploy gönder`,
        parameters: [
          { name: 'siteId', type: 'string', required: true },
          { name: 'files', type: 'object', required: true },
        ],
        returns: `deploy`,
      },
    ],
    popular: false,
  },

  // ---------- YENİ: Cloudflare ----------
  {
    type: 'cloudflare',
    label: `Cloudflare`,
    icon: 'Cloud',
    description: `Cloudflare Workers, Pages, R2, DNS`,
    category: 'cloud',
    authFields: [
      {
        key: 'apiToken',
        label: `API Token`,
        type: 'password',
        required: true,
        description: `dash.cloudflare.com/profile/api-tokens`,
      },
      { key: 'accountId', label: 'Account ID', type: 'string', required: true },
    ],
    actions: [
      {
        id: 'worker_deploy',
        name: `Worker Deploy`,
        description: `Cloudflare Workera deploy`,
        parameters: [
          { name: 'name', type: 'string', required: true },
          { name: 'script', type: 'string', required: true },
        ],
        returns: `url`,
      },
      {
        id: 'pages_deploy',
        name: `Pages Deploy`,
        description: `Cloudflare Pagese deploy`,
        parameters: [
          { name: 'projectName', type: 'string', required: true },
          { name: 'files', type: 'object', required: true },
        ],
        returns: `url`,
      },
      {
        id: 'r2_upload',
        name: `R2 Upload`,
        description: `R2 bucketa dosya yükle`,
        parameters: [
          { name: 'bucket', type: 'string', required: true },
          { name: 'key', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
        ],
        returns: `url`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: OpenAI ----------
  {
    type: 'openai',
    label: `OpenAI`,
    icon: 'Bot',
    description: `GPT-4, DALL-E, Whisper, Embeddings`,
    category: 'ai',
    authFields: [
      {
        key: 'apiKey',
        label: `API Key`,
        type: 'password',
        required: true,
        placeholder: `sk-xxx`,
        description: `platform.openai.com/api-keys`,
      },
      { key: 'organization', label: 'Organization ID', type: 'string', required: false },
    ],
    actions: [
      {
        id: 'chat',
        name: `Chat Completion`,
        description: `GPT-4 sohbet`,
        parameters: [
          { name: 'model', type: 'string', required: true },
          { name: 'messages', type: 'object', required: true },
        ],
        returns: `response`,
      },
      {
        id: 'image',
        name: `Image Generation`,
        description: `DALL-E ile görsel üret`,
        parameters: [
          { name: 'prompt', type: 'string', required: true },
          { name: 'size', type: 'string', required: false },
        ],
        returns: `url`,
      },
      {
        id: 'transcribe',
        name: `Whisper Transcribe`,
        description: `Ses → metin`,
        parameters: [{ name: 'file', type: 'string', required: true }],
        returns: `text`,
      },
      {
        id: 'embeddings',
        name: `Embeddings`,
        description: `Metin → vektör`,
        parameters: [
          { name: 'input', type: 'string', required: true },
          { name: 'model', type: 'string', required: false },
        ],
        returns: `vector`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: Anthropic ----------
  {
    type: 'anthropic',
    label: `Anthropic`,
    icon: 'Bot',
    description: `Claude 3.5 Sonnet, Haiku, Opus`,
    category: 'ai',
    authFields: [
      {
        key: 'apiKey',
        label: `API Key`,
        type: 'password',
        required: true,
        placeholder: `sk-ant-xxx`,
        description: `console.anthropic.com`,
      },
    ],
    actions: [
      {
        id: 'chat',
        name: `Claude Chat`,
        description: `Claude ile sohbet`,
        parameters: [
          { name: 'model', type: 'string', required: true },
          { name: 'messages', type: 'object', required: true },
          { name: 'maxTokens', type: 'number', required: false },
        ],
        returns: `response`,
      },
    ],
    popular: true,
  },

  // ---------- YENİ: DeepSeek ----------
  {
    type: 'deepseek',
    label: `DeepSeek`,
    icon: 'Bot',
    description: `DeepSeek V4 Pro, Flash, Reasoner — tüm yetkiler`,
    category: 'ai',
    authFields: [
      {
        key: 'apiKey',
        label: `API Key`,
        type: 'password',
        required: true,
        placeholder: `sk-xxx`,
        description: `platform.deepseek.com/api_keys`,
      },
    ],
    actions: [
      {
        id: 'chat',
        name: `Chat Completion`,
        description: `DeepSeek sohbet (streaming)`,
        parameters: [
          { name: 'model', type: 'string', required: true },
          { name: 'messages', type: 'object', required: true },
          { name: 'stream', type: 'boolean', required: false },
        ],
        returns: `response`,
      },
      {
        id: 'function_calling',
        name: `Function Calling`,
        description: `Tool use ile agent`,
        parameters: [
          { name: 'model', type: 'string', required: true },
          { name: 'messages', type: 'object', required: true },
          { name: 'tools', type: 'object', required: true },
        ],
        returns: `response`,
      },
      {
        id: 'list_models',
        name: `Modelleri Listele`,
        description: `Tüm DeepSeek modelleri`,
        parameters: [],
        returns: `model[]`,
      },
    ],
    popular: true,
  },
];

export function getConnectorSchema(type: ConnectorType): ConnectorSchema | undefined {
  return CONNECTOR_SCHEMAS.find((c) => c.type === type);
}

// ---------- Connector Client ----------

export class ConnectorClient {
  private connectors: Map<string, ConnectorConfig> = new Map();

  async add(config: Omit<ConnectorConfig, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ConnectorConfig> {
    const id = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const connector: ConnectorConfig = {
      ...config,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Try connecting
    try {
      await this.test(connector);
      connector.status = 'connected';
      connector.lastSync = now;
    } catch (err) {
      connector.status = 'error';
      connector.error = (err as Error).message;
    }

    this.connectors.set(id, connector);
    return connector;
  }

  async test(connector: ConnectorConfig): Promise<boolean> {
    // Simülasyon: gerçek impl'de connector tipine göre test yapılır
    await new Promise((r) => setTimeout(r, 500));
    if (connector.type === 'github' && !connector.config.token) {
      throw new Error('GitHub token gerekli');
    }
    return true;
  }

  async execute(connectorId: string, actionId: string, params: Record<string, unknown>): Promise<unknown> {
    const connector = this.connectors.get(connectorId);
    if (!connector) throw new Error('Connector bulunamadı');
    if (connector.status !== 'connected') throw new Error('Connector bağlı değil');

    // Simülasyon
    return {
      connector: connector.name,
      action: actionId,
      params,
      result: 'Simülasyon — gerçek connector entegrasyonu gerekiyor',
      timestamp: new Date().toISOString(),
    };
  }

  list(): ConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  get(id: string): ConnectorConfig | undefined {
    return this.connectors.get(id);
  }

  async delete(id: string): Promise<void> {
    this.connectors.delete(id);
  }
}

let _client: ConnectorClient | null = null;

export function getConnectorClient(): ConnectorClient {
  if (!_client) _client = new ConnectorClient();
  return _client;
}
