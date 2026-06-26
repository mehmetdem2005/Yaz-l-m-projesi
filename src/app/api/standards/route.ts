import { NextResponse } from 'next/server';
import { STANDARDS, STANDARD_CATEGORIES } from '@/lib/standards';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ standards: STANDARDS, categories: STANDARD_CATEGORIES });
}
