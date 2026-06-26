import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VercelClient } from '@/lib/vercel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/deploy/vercel
 * Body: { projectId, files, target }
 * Gerçek Vercel deploy
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId: localProjectId, files, target, name } = body as {
    projectId?: string;
    files: Array<{ file: string; data: string }>;
    target?: 'production' | 'preview';
    name: string;
  };

  if (!name || !files || files.length === 0) {
    return NextResponse.json({ error: 'name ve files gerekli' }, { status: 400 });
  }

  // Vercel API key DB'den al
  const setting = await db.setting.findUnique({ where: { key: 'vercel_api_key' } });
  if (!setting?.value) {
    return NextResponse.json(
      { error: 'Vercel API key yok. Ayarlar\'dan girin.' },
      { status: 401 }
    );
  }

  const teamSetting = await db.setting.findUnique({ where: { key: 'vercel_team_id' } });

  const client = new VercelClient({
    apiKey: setting.value,
    teamId: teamSetting?.value || undefined,
  });

  try {
    // Önce user doğrula
    const user = await client.getUser();
    // Deploy oluştur
    const deployment = await client.createDeployment({
      name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 52),
      files,
      target: target || 'production',
    });

    return NextResponse.json({
      deploymentId: deployment.id,
      url: deployment.url,
      state: deployment.state,
      user: user.user.email,
      inspectUrl: `https://vercel.com/${deployment.url}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deploy/vercel?deploymentId=...
 * Deploy status polling
 */
export async function GET(req: NextRequest) {
  const deploymentId = req.nextUrl.searchParams.get('deploymentId');
  const action = req.nextUrl.searchParams.get('action') || 'status';

  const setting = await db.setting.findUnique({ where: { key: 'vercel_api_key' } });
  if (!setting?.value) {
    return NextResponse.json({ error: 'Vercel API key yok' }, { status: 401 });
  }

  const teamSetting = await db.setting.findUnique({ where: { key: 'vercel_team_id' } });
  const client = new VercelClient({
    apiKey: setting.value,
    teamId: teamSetting?.value || undefined,
  });

  try {
    if (action === 'projects') {
      const projects = await client.listProjects();
      return NextResponse.json({ projects });
    }

    if (action === 'user') {
      const user = await client.getUser();
      return NextResponse.json(user);
    }

    if (!deploymentId) {
      return NextResponse.json({ error: 'deploymentId gerekli' }, { status: 400 });
    }

    if (action === 'logs') {
      const logs = await client.getDeploymentLogs(deploymentId);
      return NextResponse.json(logs);
    }

    // Default: status
    const deployment = await client.getDeployment(deploymentId);
    return NextResponse.json(deployment);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
