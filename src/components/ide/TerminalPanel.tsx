'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Terminal, X, ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runInSandbox, type SandboxLanguage } from '@/lib/sandbox';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

const WELCOME = `DeepSeek App Studio Terminal v2.0
JavaScript/TypeScript interaktif konsol
Yardım: 'help' yazın. Çıkış: paneli kapatın.
Komutlar: clear, help, ls, whoami, time, echo, run <code>`;

export function TerminalPanel() {
  const open = useStore((s) => s.terminalOpen);
  const toggle = useStore((s) => s.toggleTerminal);
  const files = useStore((s) => s.files);
  const activeFilePath = useStore((s) => s.activeFilePath);

  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 'welcome', type: 'system', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random()}`, type, content, timestamp: new Date() },
    ]);
  };

  const handleCommand = async (cmd: string) => {
    addLine('input', `$ ${cmd}`);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);

    const trimmed = cmd.trim();
    if (!trimmed) return;

    const [name, ...args] = trimmed.split(/\s+/);

    if (name === 'clear') {
      setLines([]);
      return;
    }

    if (name === 'help') {
      addLine('output', `Mevcut komutlar:
  clear              - Ekranı temizle
  help               - Bu yardım
  ls                 - Dosya listesi
  cat <path>         - Dosya içeriği
  whoami            - Aktif kullanıcı
  time               - Şu anki zaman
  echo <text>        - Metin yazdır
  run <js code>      - JavaScript çalıştır
  eval <js code>     - Eval (kısa)
  files              - Aktif proje dosyaları
  open <path>        - Editörde dosya aç`);
      return;
    }

    if (name === 'ls' || name === 'files') {
      addLine('output', files.map((f) => f.path).join('\n') || '(boş)');
      return;
    }

    if (name === 'cat') {
      const path = args.join(' ');
      const file = files.find((f) => f.path === path);
      if (file) addLine('output', file.content.slice(0, 5000));
      else addLine('error', `Dosya bulunamadı: ${path}`);
      return;
    }

    if (name === 'open') {
      const path = args.join(' ');
      const file = files.find((f) => f.path === path);
      if (file) {
        useStore.getState().setActiveFile(path);
        useStore.getState().openTab(path);
        addLine('output', `Açıldı: ${path}`);
      } else {
        addLine('error', `Dosya yok: ${path}`);
      }
      return;
    }

    if (name === 'whoami') {
      addLine('output', 'developer@deepseek-studio');
      return;
    }

    if (name === 'time') {
      addLine('output', new Date().toLocaleString('tr-TR'));
      return;
    }

    if (name === 'echo') {
      addLine('output', args.join(' '));
      return;
    }

    if (name === 'run' || name === 'eval') {
      const code = args.join(' ');
      try {
        const result = await runInSandbox(code, { language: 'javascript', timeout: 5000, memoryLimit: 64, allowNetwork: false });
        if (result.stdout) addLine('output', result.stdout);
        if (result.stderr) addLine('error', result.stderr);
        if (!result.stdout && !result.stderr && result.exitCode === 0) {
          addLine('output', '(çıktı yok)');
        }
      } catch (err) {
        addLine('error', (err as Error).message);
      }
      return;
    }

    addLine('error', `Bilinmeyen komut: ${name}. 'help' yazın.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(history[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= history.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border bg-[#0c0c0c] overflow-hidden flex-shrink-0"
          style={{ maxHeight: '40vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a] border-b border-border">
            <div className="flex items-center gap-2 text-xs">
              <Terminal size={12} className="text-green-400" />
              <span className="font-semibold text-white">Terminal</span>
              {activeFilePath && (
                <span className="text-gray-500 text-[10px] ml-2">
                  · {activeFilePath.split('/').pop()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLines([])}
                className="p-1 hover:bg-white/10 rounded"
                title="Temizle"
              >
                <Trash2 size={12} />
              </button>
              <button
                onClick={toggle}
                className="p-1 hover:bg-white/10 rounded"
                title="Kapat"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Terminal output */}
          <div
            className="overflow-auto p-2 font-mono text-xs"
            style={{ maxHeight: '30vh' }}
            onClick={() => inputRef.current?.focus()}
          >
            {lines.map((line) => (
              <div
                key={line.id}
                className={`whitespace-pre-wrap break-all ${
                  line.type === 'input'
                    ? 'text-blue-400'
                    : line.type === 'error'
                    ? 'text-red-400'
                    : line.type === 'system'
                    ? 'text-gray-500'
                    : 'text-gray-300'
                }`}
              >
                {line.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-2 py-1.5 border-t border-border bg-[#1a1a1a]">
            <span className="text-green-400 text-xs font-mono">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="komut girin... (help)"
              className="flex-1 bg-transparent outline-none text-white text-xs font-mono placeholder:text-gray-600"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
