'use client';

import { useStore } from '@/lib/store';
import { Menu, Search, Command, Keyboard, Terminal } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';

export function TitleBar() {
  const activeView = useStore((s) => s.activeView);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const setShortcutsHelpOpen = useStore((s) => s.setShortcutsHelpOpen);
  const toggleTerminal = useStore((s) => s.toggleTerminal);

  return (
    <header
      className="ide-titlebar h-8 md:h-9 flex items-center justify-between px-2 md:px-3 text-xs select-none flex-shrink-0 border-b border-cyan-500/20"
      style={{ background: 'linear-gradient(180deg, rgba(5,15,30,0.98) 0%, rgba(8,12,25,0.98) 100%)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Logo — Jarvis arc */}
        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/40 jarvis-arc"
            style={{ borderTopColor: 'rgba(0,255,255,0.8)', borderBottomColor: 'transparent' }}
          />
          <span className="text-cyan-300 font-bold text-[10px] jarvis-glow-sm">D</span>
        </div>
        <span className="font-semibold text-cyan-200 hidden sm:inline jarvis-glow-sm" style={{ fontSize: '11px' }}>
          DeepSeek App Studio
        </span>
        <span className="text-cyan-500/40 hidden sm:inline">|</span>
        <span className="text-cyan-400/70 capitalize truncate text-[10px] md:text-xs">{activeView.replace('-', ' ')}</span>
      </div>

      {/* Center: Command Palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-xs mx-2 md:max-w-md md:mx-4 flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors jarvis-border"
        style={{ background: 'rgba(0,20,40,0.5)' }}
      >
        <Search size={11} className="text-cyan-400/60 flex-shrink-0" />
        <span className="flex-1 text-left truncate text-cyan-500/50 text-[10px] md:text-xs">Ara veya komut çalıştır...</span>
        <kbd className="bg-cyan-500/10 px-1 py-0.5 rounded text-[9px] font-mono text-cyan-300/70 flex items-center gap-0.5 border border-cyan-500/20">
          <Command size={8} /> K
        </kbd>
      </button>

      <div className="flex items-center gap-0.5 md:gap-1.5">
        {/* Terminal toggle */}
        <button
          onClick={toggleTerminal}
          className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400/70 hover:text-cyan-300 transition-colors"
          aria-label="Terminal"
          title="Terminal (Ctrl+`)"
        >
          <Terminal size={13} />
        </button>
        {/* Theme */}
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>
        {/* Language */}
        <LanguageSwitcher />
        {/* Help / Shortcuts */}
        <button
          onClick={() => setShortcutsHelpOpen(true)}
          className="p-1.5 hover:bg-cyan-500/10 rounded text-cyan-400/70 hover:text-cyan-300 transition-colors"
          aria-label="Kısayollar"
          title="Kısayollar (?)"
        >
          <Keyboard size={13} />
        </button>
      </div>
    </header>
  );
}
