import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/projects/[id]/export
 * Projenin tüm dosyalarını JSON olarak döndürür (frontend ZIP yapar)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: { files: true },
  });
  if (!project) return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });

  return NextResponse.json({
    project: {
      name: project.name,
      description: project.description,
      files: project.files.map((f) => ({ path: f.path, content: f.content, language: f.language })),
    },
  });
}
