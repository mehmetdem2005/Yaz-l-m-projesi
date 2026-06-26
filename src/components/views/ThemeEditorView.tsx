'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Palette,
  Save,
  Upload,
  Download,
  Check,
  RefreshCw,
  Eye,
  Code,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  border: string;
  card: string;
}

const PRESETS: Array<{ id: string; name: string; colors: ThemeColors }> = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#0a0e27',
      foreground: '#e2e8f0',
      primary: '#3b82f6',
      accent: '#06b6d4',
      border: '#1e2a4a',
      card: '#131a3a',
    },
  },
  {
    id: 'neon',
    name: 'Neon Jarvis',
    colors: {
      background: '#050510',
      foreground: '#e0f7ff',
      primary: '#06b6d4',
      accent: '#ec4899',
      border: '#1a1a3a',
      card: '#0a0a1f',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    colors: {
      background: '#002b36',
      foreground: '#93a1a1',
      primary: '#268bd2',
      accent: '#2aa198',
      border: '#586e75',
      card: '#073642',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      foreground: '#f8f8f2',
      primary: '#bd93f9',
      accent: '#ff79c6',
      border: '#44475a',
      card: '#383a4c',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#0c1410',
      foreground: '#d4e8d4',
      primary: '#4ade80',
      accent: '#fbbf24',
      border: '#1f3329',
      card: '#13241b',
    },
  },
];

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string }> = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'border', label: 'Border' },
  { key: 'card', label: 'Card' },
];

const STORAGE_KEY = 'custom-theme-v1';

export function ThemeEditorView() {
  const [colors, setColors] = useState<ThemeColors>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.colors) return data.colors;
      }
    } catch {}
    return PRESETS[0].colors;
  });
  const [cssOverride, setCssOverride] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.cssOverride) return data.cssOverride;
      }
    } catch {}
    return '';
  });
  const [saved, setSaved] = useState(false);

  const updateColor = (key: keyof ThemeColors, val: string) => {
    setColors((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setColors(preset.colors);
    setSaved(false);
    toast.success(`"${preset.name}" preset uygulandı`);
  };

  const saveTheme = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors, cssOverride }));
      setSaved(true);
      toast.success('Tema localStorage\'a kaydedildi');
    } catch {
      toast.error('Kayıt başarısız');
    }
  };

  const exportTheme = () => {
    const data = JSON.stringify({ name: 'Custom Theme', colors, cssOverride }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tema JSON olarak dışa aktarıldı');
  };

  const importTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.colors) setColors(data.colors);
        if (data.cssOverride !== undefined) setCssOverride(data.cssOverride);
        toast.success('Tema içe aktarıldı');
        setSaved(false);
      } catch {
        toast.error('Geçersiz tema JSON');
      }
    };
    reader.readAsText(file);
  };

  const reset = () => {
    setColors(PRESETS[0].colors);
    setCssOverride('');
    setSaved(false);
    toast.success('Tema sıfırlandı');
  };

  // Preview text contrast helper
  const contrastColor = (bg: string, fgLight: string, fgDark: string) => {
    const hex = bg.replace('#', '');
    if (hex.length !== 6) return fgLight;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? fgDark : fgLight;
  };

  return (
    <div className="flex-1 overflow-auto bg-background pb-20 md:pb-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="text-purple-400" /> Tema Editörü
            </h1>
            <p className="text-sm text-muted-foreground">
              Özel renk paleti oluştur, canlı önizleme, JSON import/export
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              id="theme-import"
              className="hidden"
              onChange={importTheme}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => document.getElementById('theme-import')?.click()}
            >
              <Upload size={14} className="mr-1" /> Import
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={exportTheme}>
              <Download size={14} className="mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={reset}>
              <RefreshCw size={14} className="mr-1" /> Sıfırla
            </Button>
            <Button size="sm" className="h-8" onClick={saveTheme}>
              {saved ? <Check size={14} className="mr-1" /> : <Save size={14} className="mr-1" />}
              {saved ? 'Kaydedildi' : 'Tema Kaydet'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol — renk seçiciler + presetler */}
          <div className="space-y-4">
            {/* Presets */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" /> Preset Temalar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className="border border-border rounded p-2 hover:border-primary/40 transition-colors text-left"
                    >
                      <div className="flex gap-1 mb-1.5">
                        {Object.values(p.colors).slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/10"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                      <div className="text-[11px] font-medium">{p.name}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color pickers */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Renk Seçiciler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {COLOR_FIELDS.map((f) => (
                  <div key={f.key} className="flex items-center gap-3">
                    <Label className="w-24 text-xs text-muted-foreground">{f.label}</Label>
                    <div
                      className="w-8 h-8 rounded border border-border flex-shrink-0"
                      style={{ background: colors[f.key] }}
                    />
                    <Input
                      type="color"
                      value={colors[f.key]}
                      onChange={(e) => updateColor(f.key, e.target.value)}
                      className="w-12 h-8 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={colors[f.key]}
                      onChange={(e) => updateColor(f.key, e.target.value)}
                      className="font-mono text-xs h-8 flex-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CSS override */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code size={14} className="text-green-400" /> Custom CSS Override
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={cssOverride}
                  onChange={(e) => {
                    setCssOverride(e.target.value);
                    setSaved(false);
                  }}
                  rows={6}
                  placeholder={`/* Özel CSS kuralları */\n:root {\n  --radius: 12px;\n}\n.card-glow:hover {\n  box-shadow: 0 0 20px var(--accent);\n}`}
                  className="font-mono text-xs bg-[#1a1a1a] resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Bu CSS, tema uygulandığında &lt;style&gt; tag olarak enjekte edilir
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sağ — live preview */}
          <div>
            <Card className="bg-card border-border sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye size={14} className="text-cyan-400" /> Canlı Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    background: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                >
                  {/* Mini app bar */}
                  <div
                    className="px-4 py-2 flex items-center justify-between border-b"
                    style={{ borderColor: colors.border, background: colors.card }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded"
                        style={{ background: colors.primary }}
                      />
                      <span className="text-xs font-semibold">Mini Studio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sun size={12} />
                      <Moon size={12} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h2
                      className="text-base font-bold"
                      style={{ color: colors.foreground }}
                    >
                      Hoş geldiniz
                    </h2>
                    <p className="text-xs opacity-80">
                      Bu bir canlı önizlemedir. Renkler sağdaki paletten değişir.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded text-xs font-medium"
                        style={{
                          background: colors.primary,
                          color: contrastColor(colors.primary, '#fff', '#000'),
                        }}
                      >
                        Primary Aksiyon
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-xs font-medium border"
                        style={{
                          borderColor: colors.accent,
                          color: colors.accent,
                          background: 'transparent',
                        }}
                      >
                        Accent Outline
                      </button>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Projeler', val: '24' },
                        { label: 'Agentlar', val: '7' },
                        { label: 'Deploy', val: '128' },
                        { label: 'Uyarılar', val: '3' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="p-2.5 rounded border"
                          style={{
                            background: colors.card,
                            borderColor: colors.border,
                          }}
                        >
                          <div className="text-lg font-bold" style={{ color: colors.accent }}>
                            {stat.val}
                          </div>
                          <div className="text-[10px] opacity-70">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] mb-1 opacity-70">
                        <span>Build progress</span>
                        <span>72%</span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: colors.border }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: '72%', background: colors.primary }}
                        />
                      </div>
                    </div>

                    {/* Badge row */}
                    <div className="flex gap-1.5 flex-wrap">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ background: colors.accent + '22', color: colors.accent }}
                      >
                        Aktif
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium border"
                        style={{ borderColor: colors.border, color: colors.foreground }}
                      >
                        Üretim
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color palette summary */}
                <div className="mt-4">
                  <div className="text-[10px] uppercase text-muted-foreground mb-2">
                    Palet Özeti
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {COLOR_FIELDS.map((f) => (
                      <div key={f.key} className="text-center">
                        <div
                          className="w-full aspect-square rounded border border-white/10 mb-0.5"
                          style={{ background: colors[f.key] }}
                          title={colors[f.key]}
                        />
                        <div className="text-[8px] text-muted-foreground truncate">
                          {f.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {saved && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
                    <Check size={12} /> Tema kaydedildi — yenilemede yüklenir
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
