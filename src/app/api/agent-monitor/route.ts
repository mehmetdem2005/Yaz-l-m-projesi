import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAgentMemory } from '@/lib/agent-memory';
import { getMCPClient } from '@/lib/mcp';
import { getConnectorClient } from '@/lib/connectors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/agent-monitor
 * Site içi tüm agent'ların canlı durumunu getir
 */
export async function GET() {
  const [trees, runs, templates] = await Promise.all([
    db.agentTree.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    db.agentRun.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    db.agentTemplate.findMany({ take: 20 }),
  ]);

  const memoryStats = getAgentMemory().getStats();
  const mcpServers = getMCPClient().listServers();
  const connectors = getConnectorClient().list();

  return NextResponse.json({
    trees: trees.map((t) => ({
      ...t,
      nodes: JSON.parse(t.nodes || '[]'),
      edges: JSON.parse(t.edges || '[]'),
      results: t.results ? JSON.parse(t.results) : null,
    })),
    runs,
    templates,
    memoryStats,
    mcpServers,
    connectors,
  });
}
