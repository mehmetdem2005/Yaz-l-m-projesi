'use client';

import { useStore } from '@/lib/store';
import { GitBranch, Check, AlertTriangle, Wifi, Bell } from 'lucide-react';
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
    <footer
      className="ide-statusbar h-5 md:h-6 flex items-center justify-between px-2 text-[10px] md:text-xs select-none flex-shrink-0 border-t border-cyan-500/20"
      style={{ background: 'rgba(5,12,25,0.95)', color: 'rgba(0,200,255,0.6)' }}
    >
      <div className="flex items-center gap-1.5 md:gap-3 overflow-hidden">
        <span className="flex items-center gap-1 flex-shrink-0 text-cyan-400/70">
          <GitBranch size={10} />
          main
        </span>
        <span className="hidden sm:flex items-center gap-1 text-cyan-400/60">
          <Check size={10} className="text-green-400" />
          {files.length} dosya
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {apiKeysSet ? (
            <>
              <Wifi size={10} className="text-green-400" style={{ filter: 'drop-shadow(0 0 3px rgba(74,222,128,0.5))' }} />
              <span className="hidden sm:inline text-green-400/70">API: Bağlı</span>
            </>
          ) : (
            <>
              <AlertTriangle size={10} className="text-yellow-400" />
              <span className="hidden sm:inline text-yellow-400/70">API: Key yok</span>
            </>
          )}
        </span>
        {activeProject && (
          <span className="truncate max-w-[80px] md:max-w-[280px] hidden md:inline text-cyan-400/50">
            {activeProject.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-transparent border-none text-cyan-300 text-[10px] md:text-xs cursor-pointer outline-none hover:bg-cyan-500/10 px-1 max-w-[90px] md:max-w-none"
          style={{ textShadow: '0 0 3px rgba(0,200,255,0.3)' }}
        >
          {DEEPSEEK_MODELS.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#0a1525] text-cyan-300">
              {m.name} {m.maturity === 'beta' ? 'β' : m.maturity === 'preview' ? 'preview' : ''}
            </option>
          ))}
        </select>
        {modelInfo && (
          <span className="text-cyan-400/40 hidden lg:inline text-[10px]">
            {modelInfo.contextWindow.toLocaleString('tr-TR')} ctx · ${modelInfo.inputPricePer1M}/1M
          </span>
        )}
        <span className="hidden md:inline text-cyan-400/40">UTF-8</span>
        <span className="capitalize hidden sm:inline text-cyan-400/50">{activeView}</span>
        <span className="hidden md:inline text-cyan-400/50 font-mono">{time}</span>
        <button
          onClick={() => useStore.getState().setView('notifications')}
          className="p-0.5 hover:bg-cyan-500/10 rounded transition-colors"
          aria-label="Bildirimler"
          title="Bildirimler"
        >
          <Bell size={10} className="text-cyan-400/50 hover:text-cyan-300" />
        </button>
      </div>
    </footer>
  );
}
