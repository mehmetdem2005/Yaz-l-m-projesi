'use client';

import { useStore } from '@/lib/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette, Check, Moon, Sun, Sparkles, Zap } from 'lucide-react';
import { THEMES, applyTheme, type ThemeMode } from '@/lib/themes';

const THEME_ICONS: Record<ThemeMode, React.ComponentType<{ size?: number }>> = {
  dark: Moon,
  light: Sun,
  midnight: Moon,
  neon: Sparkles,
  solarized: Zap,
};

export function ThemeSwitcher() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const handleChange = (id: ThemeMode) => {
    const t = THEMES.find((x) => x.id === id)!;
    applyTheme(t);
    setTheme(id);
  };

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];
  const CurrentIcon = THEME_ICONS[current.id];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          title="Tema değiştir (Ctrl+Shift+T)"
        >
          <Palette size={12} />
          <span className="hidden sm:inline">{current.name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-[#1a1a2e] border-white/20" align="end">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">
            Tema Seç
          </div>
          {THEMES.map((t) => {
            const Icon = THEME_ICONS[t.id];
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => handleChange(t.id)}
                className={`w-full flex items-center gap-3 p-2 rounded text-left transition-colors ${
                  active ? 'bg-blue-500/20' : 'hover:bg-white/5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                  style={{
                    background: t.background,
                    borderColor: t.border,
                  }}
                >
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white flex items-center gap-1">
                    {t.name}
                    {active && <Check size={10} className="text-blue-400" />}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {t.description}
                  </div>
                </div>
                {/* Color preview */}
                <div className="flex gap-0.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.primary }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: t.statusbar }} />
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
