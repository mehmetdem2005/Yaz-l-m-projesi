'use client';

import { useStore } from '@/lib/store';
import { GitBranch, Check, AlertTriangle, Wifi, Bell, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';

export function StatusBar() {
  const activeView = useStore((s) => s.activeView);
  const activeProject = useStore((s) => s.activeProject);
  const model = useStore((s) => s.deepseekModel);
  const setModel = useStore((s) => s.setDeepseekModel);
  const apiKeysSet = useStore((s) => s.apiKeysSet);
  const setApiKeysSet = useStore((s) => s.setApiKeysSet);
  const files = useStore((s) => s.files);
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen);

  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString('tr-TR'));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    fetch('/api/settings?key=deepseek_api_key')
      .then((r) => r.json())
      .then((d) => setApiKeysSet(Boolean(d.isSet)))
      .catch(() => {});
  }, [setApiKeysSet]);

  const modelInfo = DEEPSEEK_MODELS.find((m) => m.id === model);

  return (
    <footer className="ide-statusbar h-6 flex items-center justify-between px-2 text-xs select-none flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-0.5 hover:bg-white/10 rounded flex-shrink-0"
          aria-label="Menüyü aç"
        >
          <Menu size={12} />
        </button>
        <span className="flex items-center gap-1 flex-shrink-0">
          <GitBranch size={12} />
          main
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <Check size={12} className="text-green-300" />
          {files.length} dosya
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {apiKeysSet ? (
            <>
              <Wifi size={12} className="text-green-300" />
              <span className="hidden sm:inline">API: Bağlı</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} className="text-yellow-300" />
              <span className="hidden sm:inline">API: Key yok</span>
            </>
          )}
        </span>
        {activeProject && (
          <span className="opacity-80 truncate max-w-[120px] md:max-w-[280px] hidden md:inline">
            📁 {activeProject.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-transparent border-none text-white text-xs cursor-pointer outline-none hover:bg-white/10 px-1 max-w-[100px] md:max-w-none"
        >
          {DEEPSEEK_MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#007acc] text-white">
              {m.name} {m.maturity === 'beta' ? 'β' : m.maturity === 'preview' ? 'preview' : ''}
            </option>
          ))}
        </select>
        {modelInfo && (
          <span className="opacity-80 hidden lg:inline">
            {modelInfo.contextWindow.toLocaleString('tr-TR')} ctx · ${modelInfo.inputPricePer1M}/1M
          </span>
        )}
        <span className="hidden md:inline">UTF-8</span>
        <span className="capitalize hidden sm:inline">{activeView}</span>
        <span className="opacity-80 hidden md:inline">{time}</span>
        <Bell size={12} className="hidden md:block" />
      </div>
    </footer>
  );
}
