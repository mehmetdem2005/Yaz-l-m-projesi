import { NextRequest, NextResponse } from 'next/server';
import { POLICIES, POLICY_CATEGORIES, getPolicyById } from '@/lib/policies-data';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const idParam = req.nextUrl.searchParams.get('id');
  const withContent = req.nextUrl.searchParams.get('content') === 'true';

  if (idParam) {
    const id = parseInt(idParam);
    const policy = getPolicyById(id);
    if (!policy) return NextResponse.json({ error: 'Politika bulunamadı' }, { status: 404 });

    const filePath = path.join(process.cwd(), policy.file);
    let content = '';
    try {
      const full = await fs.readFile(filePath, 'utf-8');
      const headerPattern = new RegExp(
        `## Politika No: ${policy.id} —.*?(?=## Politika No: \\d+ —|$)`,
        's'
      );
      const match = full.match(headerPattern);
      content = match ? match[0] : full;
    } catch {
      content = 'Politika dosyası okunamadı.';
    }

    return NextResponse.json({ policy, content: withContent ? content : undefined });
  }

  return NextResponse.json({ policies: POLICIES, categories: POLICY_CATEGORIES });
}
