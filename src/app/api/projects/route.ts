import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/projects */
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') || 'active';
  const projects = await db.project.findMany({
    where: status === 'all' ? {} : { status },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { files: true, messages: true } } },
  });
  return NextResponse.json({ projects });
}

/** POST /api/projects */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, template, standard } = body;

  if (!name) return NextResponse.json({ error: 'name gerekli' }, { status: 400 });

  const project = await db.project.create({
    data: {
      name,
      description: description || '',
      template: template || null,
      standard: standard || null,
    },
  });

  if (template) {
    const { getTemplateById } = await import('@/lib/templates');
    const tmpl = getTemplateById(template);
    if (tmpl) {
      for (const file of tmpl.files) {
        await db.file.create({
          data: {
            projectId: project.id,
            path: file.path,
            content: file.content,
            language: file.language,
          },
        });
      }
    }
  } else {
    await db.file.create({
      data: {
        projectId: project.id,
        path: 'README.md',
        content: `# ${name}\n\n${description || 'Yeni AI stüdyo projesi'}\n`,
        language: 'markdown',
      },
    });
  }

  return NextResponse.json({ project });
}
