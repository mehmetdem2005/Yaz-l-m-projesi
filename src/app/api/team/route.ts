import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const members = await db.teamMember.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(members);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const member = await db.teamMember.create({ data: body });
    return NextResponse.json(member);
  } catch (e) {
    return NextResponse.json({ error: 'Üye eklenemedi' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    const member = await db.teamMember.update({ where: { id }, data: { role } });
    return NextResponse.json(member);
  } catch (e) {
    return NextResponse.json({ error: 'Üye güncellenemedi' }, { status: 500 });
  }
}
