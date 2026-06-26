import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/stats — Dashboard metrikleri */
export async function GET() {
  const [projectCount, fileCount, messageCount, policyCount, versionCount] = await Promise.all([
    db.project.count(),
    db.file.count(),
    db.message.count(),
    db.project.count(),
    db.version.count(),
  ]);

  const recentMessages = await db.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { modelUsed: true, tokensIn: true, tokensOut: true, latencyMs: true, createdAt: true },
  });

  // Model kullanım breakdown
  const modelUsage: Record<string, { count: number; tokensIn: number; tokensOut: number; avgLatency: number }> = {};
  for (const m of recentMessages) {
    const key = m.modelUsed || 'unknown';
    if (!modelUsage[key]) {
      modelUsage[key] = { count: 0, tokensIn: 0, tokensOut: 0, avgLatency: 0 };
    }
    modelUsage[key].count++;
    modelUsage[key].tokensIn += m.tokensIn || 0;
    modelUsage[key].tokensOut += m.tokensOut || 0;
    modelUsage[key].avgLatency += m.latencyMs || 0;
  }
  for (const k of Object.keys(modelUsage)) {
    modelUsage[k].avgLatency = modelUsage[k].count > 0 ? modelUsage[k].avgLatency / modelUsage[k].count : 0;
  }

  // Toplam token & maliyet (tahmini)
  const totalTokensIn = recentMessages.reduce((s, m) => s + (m.tokensIn || 0), 0);
  const totalTokensOut = recentMessages.reduce((s, m) => s + (m.tokensOut || 0), 0);

  return NextResponse.json({
    counts: {
      projects: projectCount,
      files: fileCount,
      messages: messageCount,
      versions: versionCount,
      policies: 20,
      standards: 18,
    },
    modelUsage,
    recentActivity: recentMessages.slice(0, 10),
    totals: {
      tokensIn: totalTokensIn,
      tokensOut: totalTokensOut,
      sampleSize: recentMessages.length,
    },
  });
}
