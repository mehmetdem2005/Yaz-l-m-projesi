'use client';

import { useStore } from '@/lib/store';
import { Menu, Search, Command, Bell, X, Terminal, Palette } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/button';

export function TitleBar() {
  const activeView = useStore((s) => s.activeView);
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const setShortcutsHelpOpen = useStore((s) => s.setShortcutsHelpOpen);
  const toggleTerminal = useStore((s) => s.toggleTerminal);

  return (
    <header className="ide-titlebar h-9 flex items-center justify-between px-2 md:px-3 text-xs text-gray-300 select-none flex-shrink-0 border-b border-black/40">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-1 hover:bg-white/10 rounded"
          aria-label="Menüyü aç"
        >
          <Menu size={14} />
        </button>
        <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
          D
        </div>
        <span className="font-semibold text-white hidden sm:inline">DeepSeek App Studio</span>
        <span className="text-gray-500 hidden sm:inline">—</span>
        <span className="text-gray-400 capitalize truncate">{activeView.replace('-', ' ')}</span>
      </div>

      {/* Center: Command Palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-md mx-4 hidden lg:flex items-center gap-2 bg-black/30 px-2 py-1 rounded text-xs text-gray-400 hover:bg-black/40 cursor-text transition-colors"
      >
        <Search size={12} />
        <span className="flex-1 text-left truncate">Ara veya komut çalıştır...</span>
        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5">
          <Command size={10} /> K
        </kbd>
      </button>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="lg:hidden p-1 hover:bg-white/10 rounded"
          aria-label="Ara"
        >
          <Search size={14} />
        </button>
        {/* Terminal toggle */}
        <button
          onClick={toggleTerminal}
          className="p-1 hover:bg-white/10 rounded"
          aria-label="Terminal"
          title="Terminal (Ctrl+`)"
        >
          <Terminal size={14} />
        </button>
        {/* Theme */}
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>
        {/* Language */}
        <LanguageSwitcher />
        {/* Help */}
        <button
          onClick={() => setShortcutsHelpOpen(true)}
          className="p-1 hover:bg-white/10 rounded"
          aria-label="Kısayollar"
          title="Kısayollar (?)"
        >
          <Bell size={14} />
        </button>
      </div>
    </header>
  );
}
