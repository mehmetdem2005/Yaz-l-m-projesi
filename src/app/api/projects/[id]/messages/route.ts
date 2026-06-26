import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100');
  const messages = await db.message.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const message = await db.message.create({
    data: {
      projectId: id,
      role: body.role || 'user',
      content: body.content,
      modelUsed: body.modelUsed,
    },
  });
  return NextResponse.json({ message });
}
