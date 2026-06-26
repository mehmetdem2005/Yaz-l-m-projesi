import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/db/query
 * Body: { model: 'Project', operation: 'findMany' | 'findUnique' | 'create' | 'update' | 'delete', args: {} }
 *
 * Prisma'nın dynamic model access'i — sadece okuma işlemlerine izin ver
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { model, operation, args } = body as {
    model: string;
    operation: string;
    args?: Record<string, unknown>;
  };

  if (!model || !operation) {
    return NextResponse.json({ error: 'model ve operation gerekli' }, { status: 400 });
  }

  // Whitelist modeller
  const allowedModels = [
    'Project', 'File', 'Message', 'Version', 'AgentTemplate', 'AgentTree',
    'Connector', 'KnowledgeBase', 'KnowledgeDocument', 'ShareLink', 'Setting', 'Skill', 'AgentRun',
  ];
  if (!allowedModels.includes(model)) {
    return NextResponse.json({ error: 'Model izinli değil' }, { status: 403 });
  }

  // Whitelist operations
  const allowedOps = ['findMany', 'findUnique', 'findFirst', 'count', 'aggregate', 'create', 'update', 'updateMany', 'delete', 'deleteMany'];
  if (!allowedOps.includes(operation)) {
    return NextResponse.json({ error: 'Operation izinli değil' }, { status: 403 });
  }

  try {
    // @ts-ignore — dynamic model access
    const result = await (db as any)[model][operation](args || {});
    return NextResponse.json({ data: result });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message, stack: (err as Error).stack?.split('\n').slice(0, 5) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/db/query?model=Project — findMany
 */
export async function GET(req: NextRequest) {
  const model = req.nextUrl.searchParams.get('model');
  const take = parseInt(req.nextUrl.searchParams.get('take') || '50');
  const skip = parseInt(req.nextUrl.searchParams.get('skip') || '0');

  if (!model) {
    return NextResponse.json({ error: 'model param gerekli' }, { status: 400 });
  }

  const allowedModels = ['Project', 'File', 'Message', 'Version', 'AgentTemplate', 'AgentTree', 'Connector', 'KnowledgeBase', 'KnowledgeDocument', 'ShareLink', 'Setting', 'Skill', 'AgentRun'];
  if (!allowedModels.includes(model)) {
    return NextResponse.json({ error: 'Model izinli değil' }, { status: 403 });
  }

  try {
    // @ts-ignore
    const data = await (db as any)[model].findMany({ take, skip, orderBy: { createdAt: 'desc' } });
    // @ts-ignore
    const count = await (db as any)[model].count();
    return NextResponse.json({ data, count, model, take, skip });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
