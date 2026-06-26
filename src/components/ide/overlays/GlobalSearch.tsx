'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useStore } from '@/lib/store';
import {
  Search,
  FileText,
  FileCode,
  FileJson,
  File,
  X,
  CornerDownLeft,
  Hash,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  path: string;
  line?: number;
  lineContent?: string;
  preview?: string;
  type: 'file' | 'match';
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['tsx', 'ts', 'js', 'jsx'].includes(ext || '')) return <FileCode size={14} className="text-blue-400" />;
  if (['json'].includes(ext || '')) return <FileJson size={14} className="text-yellow-400" />;
  if (['md', 'mdx'].includes(ext || '')) return <FileText size={14} className="text-gray-400" />;
  return <File size={14} className="text-gray-400" />;
}

export function GlobalSearch() {
  const open = useStore((s) => s.searchOpen);
  const setOpen = useStore((s) => s.setSearchOpen);
  const mode = useStore((s) => s.searchMode);
  const setMode = useStore((s) => s.setSearchMode);
  const files = useStore((s) => s.files);
  const setView = useStore((s) => s.setView);

  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // selectedIdx resets when query/mode changes — derived from query/mode
  const queryKey = `${query}|${mode}|${caseSensitive}|${wholeWord}|${useRegex}`;
  const [selectedIdxState, setSelectedIdxState] = useState({ key: '', idx: 0 });
  const selectedIdx = selectedIdxState.key === queryKey ? selectedIdxState.idx : 0;

  const setSelectedIdx = (idx: number) => {
    setSelectedIdxState({ key: queryKey, idx });
  };

  // Open: focus input
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Search logic
  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];

    if (mode === 'files') {
      // File name search
      return files
        .filter((f) => {
          const name = caseSensitive ? f.path : f.path.toLowerCase();
          const q = caseSensitive ? query : query.toLowerCase();
          return name.includes(q);
        })
        .slice(0, 50)
        .map((f) => ({ path: f.path, type: 'file' as const }));
    }

    // Code search
    const results: SearchResult[] = [];
    try {
      const pattern = useRegex
        ? new RegExp(query, caseSensitive ? 'g' : 'gi')
        : null;
      for (const f of files) {
        const lines = f.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let matched = false;
          if (pattern) {
            matched = pattern.test(line);
            pattern.lastIndex = 0;
          } else if (wholeWord) {
            const re = new RegExp(`\\b${escapeRegex(query)}\\b`, caseSensitive ? '' : 'i');
            matched = re.test(line);
          } else {
            const haystack = caseSensitive ? line : line.toLowerCase();
            const needle = caseSensitive ? query : query.toLowerCase();
            matched = haystack.includes(needle);
          }
          if (matched) {
            results.push({
              path: f.path,
              line: i + 1,
              lineContent: line.trim().slice(0, 200),
              preview: getPreview(line, query, caseSensitive),
              type: 'match',
            });
            if (results.length >= 100) return results;
          }
        }
      }
    } catch {}
    return results;
  }, [query, mode, files, caseSensitive, wholeWord, useRegex]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  const handleOpen = (r: SearchResult) => {
    setView('editor');
    useStore.getState().setActiveFile(r.path);
    useStore.getState().openTab(r.path);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[selectedIdx];
      if (r) handleOpen(r);
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
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mode tabs */}
            <div className="flex items-center gap-1 px-3 pt-3">
              <button
                onClick={() => setMode('files')}
                className={`px-3 py-1 text-xs rounded ${
                  mode === 'files'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                📁 Dosyalar
              </button>
              <button
                onClick={() => setMode('code')}
                className={`px-3 py-1 text-xs rounded ${
                  mode === 'code'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                🔍 Kod
              </button>
              <div className="ml-auto flex items-center gap-1">
                {mode === 'code' && (
                  <>
                    <button
                      onClick={() => setCaseSensitive(!caseSensitive)}
                      title="Büyük/küçük harf duyarlı"
                      className={`p-1 rounded ${
                        caseSensitive ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      <CaseSensitive size={14} />
                    </button>
                    <button
                      onClick={() => setWholeWord(!wholeWord)}
                      title="Tam kelime"
                      className={`p-1 rounded ${
                        wholeWord ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      <WholeWord size={14} />
                    </button>
                    <button
                      onClick={() => setUseRegex(!useRegex)}
                      title="Regex"
                      className={`p-1 rounded ${
                        useRegex ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      <Regex size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-gray-500 hover:bg-white/5 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="text-gray-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'files' ? 'Dosya adı ara...' : 'Kod ara...'}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500 text-sm"
              />
              <span className="text-[10px] text-gray-500">
                {results.length} sonuç
              </span>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-auto">
              {query.trim() === '' ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  {mode === 'files' ? 'Dosya adı yazın' : 'Arama sorgusu girin'}
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Sonuç bulunamadı
                </div>
              ) : (
                results.map((r, idx) => {
                  const isActive = idx === selectedIdx;
                  return (
                    <div
                      key={`${r.path}-${r.line || 0}-${idx}`}
                      data-idx={idx}
                      onClick={() => handleOpen(r)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`flex items-start gap-3 px-4 py-2 cursor-pointer border-l-2 ${
                        isActive
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'border-transparent hover:bg-white/5'
                      }`}
                    >
                      {getFileIcon(r.path)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white truncate">{r.path}</span>
                          {r.line && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                              <Hash size={9} /> {r.line}
                            </span>
                          )}
                        </div>
                        {r.preview && (
                          <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                            {r.preview}
                          </div>
                        )}
                      </div>
                      {isActive && <CornerDownLeft size={12} className="text-blue-400 mt-1" />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPreview(line: string, query: string, caseSensitive: boolean): string {
  const haystack = caseSensitive ? line : line.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const idx = haystack.indexOf(needle);
  if (idx === -1) return line.trim();
  const start = Math.max(0, idx - 30);
  const end = Math.min(line.length, idx + query.length + 30);
  return (start > 0 ? '...' : '') + line.slice(start, end).trim() + (end < line.length ? '...' : '');
}
