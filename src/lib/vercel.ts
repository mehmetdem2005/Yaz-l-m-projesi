/**
 * Vercel API Client — gerçek deploy entegrasyonu
 *
 * https://vercel.com/docs/rest-api
 *
 * Endpoint'ler:
 * - POST /v13/deployments — yeni deploy oluştur
 * - GET /v6/deployments/{id} — deploy status
 * - GET /v9/projects — projeleri listele
 * - POST /v10/projects — yeni project oluştur
 * - GET /v2/user — user info
 */

export interface VercelConfig {
  apiKey: string;
  teamId?: string;
  projectId?: string;
}

export interface VercelDeployment {
  id: string;
  url: string;
  state: 'QUEUED' | 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'READY' | 'CANCELED';
  createdAt: number;
  meta: Record<string, string>;
  target?: 'production' | 'preview';
  source?: string;
  name: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  latestDeployment?: VercelDeployment;
}

export class VercelClient {
  private apiKey: string;
  private teamId?: string;
  private baseUrl = 'https://api.vercel.com';

  constructor(config: VercelConfig) {
    this.apiKey = config.apiKey;
    this.teamId = config.teamId;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private get teamQuery() {
    return this.teamId ? `?teamId=${this.teamId}` : '';
  }

  /**
   * User info — API key doğrula
   */
  async getUser(): Promise<{ user: { email: string; name: string; username: string }; team?: any }> {
    const res = await fetch(`${this.baseUrl}/v2/user${this.teamQuery}`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Vercel API ${res.status}: ${text}`);
    }
    return res.json();
  }

  /**
   * Projeleri listele
   */
  async listProjects(limit: number = 20): Promise<VercelProject[]> {
    const res = await fetch(`${this.baseUrl}/v9/projects?limit=${limit}${this.teamQuery ? '&' + this.teamQuery.slice(1) : ''}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
    const data = await res.json();
    return data.projects || [];
  }

  /**
   * Deploy oluştur — dosya listesi ile
   */
  async createDeployment(opts: {
    name: string;
    files: Array<{ file: string; data: string }>;
    target?: 'production' | 'preview';
    projectSettings?: {
      framework?: string;
      buildCommand?: string;
      outputDirectory?: string;
      installCommand?: string;
    };
  }): Promise<VercelDeployment> {
    const body: any = {
      name: opts.name,
      files: opts.files.map((f) => ({ file: f.file, data: f.data, encoding: 'utf-8' })),
      target: opts.target || 'production',
      projectSettings: opts.projectSettings || {
        framework: 'nextjs',
      },
    };

    const res = await fetch(`${this.baseUrl}/v13/deployments${this.teamQuery ? this.teamQuery + '&skipAutoDetectionConfirmation=1' : '?skipAutoDetectionConfirmation=1'}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Vercel deploy failed ${res.status}: ${text}`);
    }

    return res.json();
  }

  /**
   * Deploy status — poll için
   */
  async getDeployment(deploymentId: string): Promise<VercelDeployment> {
    const res = await fetch(`${this.baseUrl}/v13/deployments/${deploymentId}${this.teamQuery}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
    return res.json();
  }

  /**
   * Deploy log'ları
   */
  async getDeploymentLogs(deploymentId: string, buildId?: string): Promise<{ logs: Array<{ type: string; message: string; created: number }> }> {
    const res = await fetch(
      `${this.baseUrl}/v3/deployments/${deploymentId}/events?buildId=${buildId || ''}&types=stderr,stdout,command${this.teamQuery ? '&' + this.teamQuery.slice(1) : ''}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
    return res.json();
  }

  /**
   * Deploy'u cancel et
   */
  async cancelDeployment(deploymentId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/v13/deployments/${deploymentId}/cancel${this.teamQuery}`, {
      method: 'PATCH',
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
  }

  /**
   * Environment variables yönetimi
   */
  async getEnvVars(projectId: string): Promise<Array<{ id: string; key: string; value: string; type: string; target: string[] }>> {
    const res = await fetch(`${this.baseUrl}/v9/projects/${projectId}/env${this.teamQuery}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
    const data = await res.json();
    return data.envs || [];
  }

  async setEnvVar(projectId: string, key: string, value: string, target: string[] = ['production', 'preview', 'development']): Promise<void> {
    const res = await fetch(`${this.baseUrl}/v10/projects/${projectId}/env${this.teamQuery}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ key, value, type: 'encrypted', target }),
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
  }

  /**
   * Domain'leri listele
   */
  async getDomains(projectId: string): Promise<Array<{ name: string; verified: boolean }>> {
    const res = await fetch(`${this.baseUrl}/v9/projects/${projectId}/domains${this.teamQuery}`, {
      headers: this.headers,
    });
    if (!res.ok) throw new Error(`Vercel API ${res.status}`);
    const data = await res.json();
    return data.domains || [];
  }
}

let _client: VercelClient | null = null;

export function getVercelClient(): VercelClient | null {
  return _client;
}

export function initVercelClient(config: VercelConfig): VercelClient {
  _client = new VercelClient(config);
  return _client;
}
