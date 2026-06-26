import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/lib/templates';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}
