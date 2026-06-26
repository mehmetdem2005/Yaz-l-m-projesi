'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  useStore,
} from '@/lib/store';
import {
  VIEW_COMMANDS,
  ACTION_COMMANDS,
  searchCommands,
  type CommandItem,
} from '@/lib/command-palette';
import {
  LayoutDashboard,
  FolderGit2,
  Code2,
  Network,
  Radar,
  Boxes,
  Bot,
  SquareTerminal,
  Sparkles,
  Plug,
  LayoutTemplate,
  ScrollText,
  BookMarked,
  History,
  BarChart3,
  FileText,
  Download,
  Settings,
  Plus,
  FilePlus,
  Save,
  Play,
  Palette,
  Menu,
  MessageSquare,
  Trash2,
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, FolderGit2, Code2, Network, Radar, Boxes, Bot, SquareTerminal,
  Sparkles, Plug, LayoutTemplate, ScrollText, BookMarked, History, BarChart3,
  FileText, Download, Settings, Plus, FilePlus, Save, Play, Palette, Menu,
  MessageSquare, Trash2,
};

export function CommandPalette() {
  const open = useStore((s) => s.commandPaletteOpen);
  const setOpen = useStore((s) => s.setCommandPaletteOpen);
  const setView = useStore((s) => s.setView);
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen);
  const setTheme = useStore((s) => s.setTheme);
  const setShortcutsHelpOpen = useStore((s) => s.setShortcutsHelpOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const files = useStore((s) => s.files);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Wrap setQuery to also reset selectedIdx
  const updateQuery = (q: string) => {
    setQuery(q);
    setSelectedIdx(0);
  };

  // Build all commands
  const commands: CommandItem[] = useMemo(() => {
    const cmds: CommandItem[] = [];

    // View navigation
    VIEW_COMMANDS.forEach((v) => {
      cmds.push({
        id: `view-${v.id}`,
        title: v.title,
        category: v.category,
        icon: v.icon,
        keywords: v.keywords,
        action: () => setView(v.id as any),
      });
    });

    // Actions
    ACTION_COMMANDS.forEach((a) => {
      cmds.push({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        icon: a.icon,
        keywords: a.keywords,
        shortcut: a.shortcut,
        action: () => {
          switch (a.id) {
            case 'new-project':
              setView('projects');
              break;
            case 'new-file':
              setView('editor');
              break;
            case 'save-file':
              // Trigger save via custom event
              window.dispatchEvent(new CustomEvent('ide:save-file'));
              break;
            case 'run-sandbox':
              window.dispatchEvent(new CustomEvent('ide:run-sandbox'));
              break;
            case 'toggle-theme':
              setShortcutsHelpOpen(false);
              setOpen(false);
              // Cycle theme
              const themes = ['dark', 'midnight', 'neon', 'solarized', 'light'] as const;
              const current = useStore.getState().theme;
              const idx = themes.indexOf(current as any);
              const next = themes[(idx + 1) % themes.length];
              setTheme(next);
              window.dispatchEvent(new CustomEvent('ide:theme-change', { detail: next }));
              break;
            case 'toggle-mobile-nav':
              setMobileNavOpen(true);
              break;
            case 'focus-chat':
              setView('editor');
              setTimeout(() => {
                document.querySelector('textarea')?.focus();
              }, 300);
              break;
            case 'clear-chat':
              window.dispatchEvent(new CustomEvent('ide:clear-chat'));
              break;
          }
        },
      });
    });

    // Files in active project
    if (files.length > 0) {
      files.forEach((f) => {
        cmds.push({
          id: `file-${f.path}`,
          title: f.path,
          description: 'Dosyayı aç',
          category: 'file',
          icon: 'FileText',
          keywords: ['file', 'dosya', f.path],
          action: () => {
            if (activeProjectId) {
              setView('editor');
              setTimeout(() => {
                useStore.getState().setActiveFile(f.path);
                useStore.getState().openTab(f.path);
              }, 200);
            }
          },
        });
      });
    }

    // Special commands
    cmds.push({
      id: 'help-shortcuts',
      title: 'Klavye Kısayollarını Göster',
      description: 'Tüm kısayolları listele',
      category: 'action',
      icon: 'Settings',
      keywords: ['help', 'shortcut', 'yardım'],
      action: () => setShortcutsHelpOpen(true),
    });

    cmds.push({
      id: 'search-files',
      title: 'Dosyalarda Ara',
      description: 'Ctrl+P — hızlı dosya bul',
      category: 'action',
      icon: 'Search',
      keywords: ['search', 'ara', 'file'],
      shortcut: ['Ctrl', 'P'],
      action: () => {
        useStore.getState().setSearchMode('files');
        setSearchOpen(true);
      },
    });

    cmds.push({
      id: 'search-code',
      title: 'Kodda Ara',
      description: 'Ctrl+Shift+F — tüm dosyalarda kod ara',
      category: 'action',
      icon: 'Search',
      keywords: ['search', 'code', 'kod'],
      shortcut: ['Ctrl', 'Shift', 'F'],
      action: () => {
        useStore.getState().setSearchMode('code');
        setSearchOpen(true);
      },
    });

    return cmds;
  }, [files, activeProjectId, setView, setMobileNavOpen, setTheme, setShortcutsHelpOpen, setOpen, setSearchOpen]);

  const filtered = useMemo(() => searchCommands(query, commands), [query, commands]);

  // Open: focus input
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIdx];
      if (cmd) {
        cmd.action();
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="text-gray-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Komut ara, view aç, dosya bul..."
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Sonuç bulunamadı
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const Icon = ICONS[cmd.icon] || Search;
                  const isActive = idx === selectedIdx;
                  return (
                    <div
                      key={cmd.id}
                      data-idx={idx}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-blue-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{cmd.title}</div>
                        {cmd.description && (
                          <div className="text-[10px] text-gray-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] uppercase text-gray-500">
                          {cmd.category}
                        </span>
                        {cmd.shortcut && (
                          <kbd className="text-[9px] px-1 py-0.5 bg-white/10 rounded text-gray-400 font-mono">
                            {cmd.shortcut.join('+')}
                          </kbd>
                        )}
                        {isActive && <CornerDownLeft size={12} className="text-blue-400 ml-1" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp size={10} /> <ArrowDown size={10} /> gezinme
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={10} /> seç
                </span>
              </div>
              <span>{filtered.length} sonuç</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
