import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (key) {
    const setting = await db.setting.findUnique({ where: { key } });
    if (setting && key.includes('api_key')) {
      const masked =
        setting.value.length > 8
          ? setting.value.slice(0, 4) + '••••••••' + setting.value.slice(-4)
          : '••••';
      return NextResponse.json({ key, value: masked, isSet: true });
    }
    return NextResponse.json({ key, value: setting?.value || null, isSet: Boolean(setting) });
  }
  const settings = await db.setting.findMany();
  const masked = settings.map((s) => ({
    key: s.key,
    value: s.key.includes('api_key')
      ? s.value.length > 8
        ? s.value.slice(0, 4) + '••••••••' + s.value.slice(-4)
        : '••••'
      : s.value,
    isSet: true,
  }));
  return NextResponse.json({ settings: masked });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key gerekli' }, { status: 400 });

  const setting = await db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({
    ok: true,
    key: setting.key,
    masked:
      key.includes('api_key') && value.length > 8
        ? value.slice(0, 4) + '••••••••' + value.slice(-4)
        : value,
  });
}

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key gerekli' }, { status: 400 });
  await db.setting.deleteMany({ where: { key } });
  return NextResponse.json({ ok: true });
}
