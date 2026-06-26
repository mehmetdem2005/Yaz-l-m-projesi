import { NextRequest, NextResponse } from 'next/server';
import { runInSandbox, type SandboxLanguage } from '@/lib/sandbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, language, timeout, memoryLimit, allowNetwork } = body as {
    code: string;
    language: SandboxLanguage;
    timeout?: number;
    memoryLimit?: number;
    allowNetwork?: boolean;
  };

  if (!code || !language) {
    return NextResponse.json({ error: 'code ve language gerekli' }, { status: 400 });
  }

  const result = await runInSandbox(code, {
    language,
    timeout: timeout || 10000,
    memoryLimit: memoryLimit || 128,
    allowNetwork: allowNetwork ?? false,
  });

  return NextResponse.json({ result });
}
