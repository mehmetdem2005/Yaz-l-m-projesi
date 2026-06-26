import { NextResponse } from 'next/server';
import { BUILTIN_SKILLS, SKILL_CATEGORIES } from '@/lib/skills-data';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    skills: BUILTIN_SKILLS,
    categories: SKILL_CATEGORIES,
  });
}

/**
 * POST /api/skills — Skill dokümanını oku
 * Body: { id: 'motion-design' }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const skill = BUILTIN_SKILLS.find((s) => s.id === body.id);
  if (!skill) return NextResponse.json({ error: 'Skill bulunamadı' }, { status: 404 });

  try {
    const filePath = path.join(process.cwd(), skill.file);
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ skill, content });
  } catch {
    return NextResponse.json({ skill, content: 'Skill dokümanı okunamadı.' });
  }
}
