import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BUILTIN_AGENT_TEMPLATES } from '@/lib/agent-tree';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/agent-templates — Built-in + DB templates */
export async function GET() {
  const dbTemplates = await db.agentTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({
    builtin: BUILTIN_AGENT_TEMPLATES,
    custom: dbTemplates,
  });
}

/** POST /api/agent-templates — Yeni kullanıcı şablonu */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, nodes, edges, systemPrompt, tags, isPublic } = body;

  if (!name || !nodes) {
    return NextResponse.json({ error: 'name ve nodes gerekli' }, { status: 400 });
  }

  const template = await db.agentTemplate.create({
    data: {
      name,
      description: description || null,
      category: 'custom',
      nodes: JSON.stringify(nodes),
      edges: JSON.stringify(edges || []),
      systemPrompt: systemPrompt || null,
      tags: tags?.join(',') || null,
      isPublic: isPublic ?? false,
    },
  });

  return NextResponse.json({ template });
}
