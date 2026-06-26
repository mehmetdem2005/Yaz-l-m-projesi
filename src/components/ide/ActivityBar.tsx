'use client';

import { useStore, type ViewKey } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Code2,
  Box,
  Gamepad2,
  Rocket,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// ---------- Studio Mode System ----------
// VS Code + Unity tarzı: 5 ana stüdyo modu, her modun altında view'ler

export type StudioMode = 'dashboard' | 'code' | '3d-studio' | 'game-studio' | 'deploy';

interface StudioModeDef {
  id: StudioMode;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  views: ViewKey[];
}

const STUDIO_MODES: StudioModeDef[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    shortcut: '1',
    views: ['dashboard', 'analytics', 'history', 'settings', 'docs'],
  },
  {
    id: 'code',
    icon: Code2,
    label: 'Code Studio',
    shortcut: '2',
    views: ['editor', 'projects', 'sandbox', 'snippets', 'dev-prompts', 'api-tester', 'db-explorer', 'connectors', 'skills', 'templates'],
  },
  {
    id: '3d-studio',
    icon: Box,
    label: '3D Studio',
    shortcut: '3',
    views: ['nexus-3d', 'game-editor'],
  },
  {
    id: 'game-studio',
    icon: Gamepad2,
    label: 'Game Studio',
    shortcut: '4',
    views: ['agent-tree', 'agent-monitor', 'agent-templates', 'agent', 'workflows', 'test-runner', 'bundle-analyzer', 'security-scanner', 'secret-scanner', 'dependency-monitor'],
  },
  {
    id: 'deploy',
    icon: Rocket,
    label: 'Deploy',
    shortcut: '5',
    views: ['export', 'deploy-targets', 'cron-jobs', 'webhooks', 'status', 'audit-log', 'error-tracking', 'feature-flags', 'notifications', 'policies', 'standards', 'team', 'collab', 'two-factor', 'theme-editor'],
  },
];

// View → Mode mapping
const VIEW_TO_MODE: Partial<Record<ViewKey, StudioMode>> = {};
STUDIO_MODES.forEach((m) => {
  m.views.forEach((v) => {
    VIEW_TO_MODE[v] = m.id;
  });
});

export function getModeForView(view: ViewKey): StudioMode {
  return VIEW_TO_MODE[view] || 'dashboard';
}

export function getModeViews(mode: StudioMode): ViewKey[] {
  return STUDIO_MODES.find((m) => m.id === mode)?.views || [];
}

// ---------- ActivityBar Component ----------

export function ActivityBar() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const activeMode = getModeForView(activeView);

  return (
    <nav
      className="w-12 flex flex-col items-center py-2 border-r border-cyan-500/20 flex-shrink-0 overflow-y-auto jarvis-scrollbar"
      style={{ scrollbarWidth: 'thin', maxHeight: '100%', background: 'rgba(3, 8, 18, 0.98)' }}
    >
      {/* Studio Mode Butonları */}
      {STUDIO_MODES.map((mode, idx) => {
        const Icon = mode.icon;
        const active = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => setView(mode.views[0])}
            title={`${mode.label} (${mode.shortcut})`}
            className={cn(
              'group relative w-12 h-12 flex items-center justify-center transition-all',
              active
                ? 'text-cyan-300 bg-cyan-500/10'
                : 'text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/5'
            )}
            style={active ? { boxShadow: 'inset 0 0 12px rgba(0,200,255,0.15)' } : undefined}
          >
            {active && (
              <span
                className="absolute left-0 top-1 bottom-1 w-0.5 bg-cyan-400 rounded-r"
                style={{ boxShadow: '0 0 8px rgba(0,255,255,0.6)' }}
              />
            )}
            <Icon size={18} strokeWidth={active ? 2.5 : 1.5} className={active ? 'jarvis-glow-sm' : ''} />
            {/* Tooltip */}
            <span
              className="absolute left-full ml-2 px-2 py-1 bg-black text-cyan-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-cyan-500/30"
              style={{ boxShadow: '0 0 10px rgba(0,200,255,0.2)' }}
            >
              {mode.label} <kbd className="text-cyan-500/60 ml-1">{mode.shortcut}</kbd>
            </span>
          </button>
        );
      })}

      {/* Ayırıcı */}
      <div className="h-px bg-cyan-500/20 my-2 mx-3 w-6" />

      {/* Ayarlar */}
      <button
        onClick={() => setView('settings')}
        title="Ayarlar"
        className={cn(
          'group relative w-12 h-12 flex items-center justify-center transition-all',
          activeView === 'settings'
            ? 'text-cyan-300 bg-cyan-500/10'
            : 'text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/5'
        )}
      >
        <Settings size={16} strokeWidth={1.5} />
        <span
          className="absolute left-full ml-2 px-2 py-1 bg-black text-cyan-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-cyan-500/30"
        >
          Ayarlar
        </span>
      </button>
    </nav>
  );
}

// Eski export — compatibility
export { STUDIO_MODES as NAV_ITEMS };
