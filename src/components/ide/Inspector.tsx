'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * Inspector Panel — Unity tarzı sağ panel
 * Aktif view'a göre bağlam bilgisi gösterir
 */

export function Inspector() {
  const activeView = useStore((s) => s.activeView);
  const activeProject = useStore((s) => s.activeProject);

  return (
    <div
      className="w-56 flex flex-col border-l border-cyan-500/15 flex-shrink-0"
      style={{ background: 'rgba(5, 10, 20, 0.95)' }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-cyan-500/15 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 jarvis-pulse" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 jarvis-glow-sm">
          INSPECTOR
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar p-3 space-y-3">
        {/* Aktif modül */}
        <div>
          <div className="text-[9px] text-cyan-500/50 uppercase mb-1">Aktif Modül</div>
          <div className="text-xs text-cyan-300 font-mono jarvis-glow-sm">{activeView}</div>
        </div>

        {/* Proje durumu */}
        <div className="h-px bg-cyan-500/10" />

        <div>
          <div className="text-[9px] text-cyan-500/50 uppercase mb-1">Proje</div>
          <div className="text-xs text-cyan-200/80">
            {activeProject ? activeProject.name : 'Aktif proje yok'}
          </div>
        </div>

        {/* Stüdyo istatistikleri */}
        <div className="h-px bg-cyan-500/10" />

        <div>
          <div className="text-[9px] text-cyan-500/50 uppercase mb-2">Sistem Durumu</div>
          <div className="space-y-1.5">
            <StatRow label="Veritabanı" value="Supabase" color="green" />
            <StatRow label="Frontend" value="Vercel" color="cyan" />
            <StatRow label="Backend" value="Next.js API" color="cyan" />
            <StatRow label="AI Engine" value="DeepSeek" color="purple" />
            <StatRow label="3D Engine" value="Three.js" color="blue" />
          </div>
        </div>

        {/* Hızlı eylemler */}
        <div className="h-px bg-cyan-500/10" />

        <div>
          <div className="text-[9px] text-cyan-500/50 uppercase mb-2">Hızlı Eylemler</div>
          <div className="space-y-1">
            <QuickAction label="Yeni Proje" view="projects" />
            <QuickAction label="AI Sohbet" view="editor" />
            <QuickAction label="3D Modelleme" view="nexus-3d" />
            <QuickAction label="Oyun Editörü" view="game-editor" />
            <QuickAction label="APK Build" view="export" />
          </div>
        </div>

        {/* Bağlantılar */}
        <div className="h-px bg-cyan-500/10" />

        <div>
          <div className="text-[9px] text-cyan-500/50 uppercase mb-2">Bağlantılar</div>
          <div className="space-y-1 text-[10px]">
            <LinkRow label="GitHub" url="github.com/mehmetdem2005" />
            <LinkRow label="Vercel" url="deepseek-app-studio.vercel.app" />
            <LinkRow label="Supabase" url="kozckegiwuaywqkkkntp" />
            <LinkRow label="Render" url="deepseek-app-studio.onrender.com" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-gray-500">{label}</span>
      <span className={cn('font-mono', colors[color] || 'text-gray-400')}>{value}</span>
    </div>
  );
}

function QuickAction({ label, view }: { label: string; view: string }) {
  const setView = useStore((s) => s.setView);
  return (
    <button
      onClick={() => setView(view as any)}
      className="w-full text-left px-2 py-1 text-[10px] text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/5 rounded transition-colors"
    >
      → {label}
    </button>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-cyan-500/50 font-mono truncate max-w-[100px]">{url}</span>
    </div>
  );
}
