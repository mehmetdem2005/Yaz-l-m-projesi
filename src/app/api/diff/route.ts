import { NextRequest, NextResponse } from 'next/server';
import { computeChangesFromAIResponse, type FileDiff } from '@/lib/diff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/diff
 * AI yanıtından diff üret
 *
 * Body: {
 *   aiResponse: string,
 *   files: { path, content }[]
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { aiResponse, files } = body as {
    aiResponse: string;
    files: { path: string; content: string }[];
  };

  if (!aiResponse || !files) {
    return NextResponse.json({ error: 'aiResponse ve files gerekli' }, { status: 400 });
  }

  const diffs: FileDiff[] = computeChangesFromAIResponse(aiResponse, files);
  const totalAdditions = diffs.reduce((s, d) => s + d.additions, 0);
  const totalDeletions = diffs.reduce((s, d) => s + d.deletions, 0);

  return NextResponse.json({
    diffs,
    summary: {
      fileCount: diffs.length,
      additions: totalAdditions,
      deletions: totalDeletions,
    },
  });
}
