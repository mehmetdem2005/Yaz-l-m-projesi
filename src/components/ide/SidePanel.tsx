'use client';

import { useStore, type ViewKey } from '@/lib/store';
import { getModeForView, getModeViews, type StudioMode } from './ActivityBar';
import { cn } from '@/lib/utils';
import {
  FolderGit2, FileText, SquareTerminal, Braces, Wand2, Globe,
  Database, Plug, Sparkles, LayoutTemplate, Box, Gamepad2,
  Network, Radar, Boxes, Bot, Workflow, FlaskConical, Package,
  ShieldCheck, Lock, Rocket, Clock, Bell, Activity, ScrollText,
  AlertCircle, Flag, Users, Cloud, Download, History, BarChart3,
  BookMarked, FileBox, Palette, Settings, type LucideIcon,
} from 'lucide-react';

const VIEW_ICONS: Partial<Record<ViewKey, LucideIcon>> = {
  dashboard: FolderGit2,
  analytics: BarChart3,
  history: History,
  settings: Settings,
  docs: BookMarked,
  editor: FileText,
  projects: FolderGit2,
  sandbox: SquareTerminal,
  snippets: Braces,
  'dev-prompts': Wand2,
  'api-tester': Globe,
  'db-explorer': Database,
  connectors: Plug,
  skills: Sparkles,
  templates: LayoutTemplate,
  'nexus-3d': Box,
  'game-editor': Gamepad2,
  'agent-tree': Network,
  'agent-monitor': Radar,
  'agent-templates': Boxes,
  agent: Bot,
  workflows: Workflow,
  'test-runner': FlaskConical,
  'bundle-analyzer': Package,
  'security-scanner': ShieldCheck,
  'secret-scanner': Lock,
  'dependency-monitor': Package,
  export: Download,
  'deploy-targets': Rocket,
  'cron-jobs': Clock,
  webhooks: Activity,
  status: Activity,
  'audit-log': ScrollText,
  'error-tracking': AlertCircle,
  'feature-flags': Flag,
  notifications: Bell,
  policies: ScrollText,
  standards: BookMarked,
  team: Users,
  collab: Users,
  'two-factor': Lock,
  'theme-editor': Palette,
};

const VIEW_LABELS: Partial<Record<ViewKey, string>> = {
  dashboard: 'Dashboard',
  analytics: 'Analitik',
  history: 'Sürüm Geçmişi',
  settings: 'Ayarlar',
  docs: 'Dokümantasyon',
  editor: 'Editör',
  projects: 'Projeler',
  sandbox: 'Sandbox',
  snippets: 'Snippet\'lar',
  'dev-prompts': 'Dev Prompts',
  'api-tester': 'API Tester',
  'db-explorer': 'Veritabanı',
  connectors: 'Connector & MCP',
  skills: 'Skiller',
  templates: 'Şablonlar',
  'nexus-3d': 'NEXUS 3D Studio',
  'game-editor': 'Oyun Editörü',
  'agent-tree': 'Agent Tree',
  'agent-monitor': 'Mission Control',
  'agent-templates': 'Agent Şablonları',
  agent: 'ReAct Agent',
  workflows: 'Workflow Builder',
  'test-runner': 'Test Runner',
  'bundle-analyzer': 'Bundle Analyzer',
  'security-scanner': 'Security Scanner',
  'secret-scanner': 'Secret Scanner',
  'dependency-monitor': 'Dependency Monitor',
  export: 'Deploy & Export',
  'deploy-targets': 'Deploy Targets',
  'cron-jobs': 'Cron Jobs',
  webhooks: 'Webhooks',
  status: 'Status Page',
  'audit-log': 'Audit Log',
  'error-tracking': 'Hata Takibi',
  'feature-flags': 'Feature Flags',
  notifications: 'Bildirimler',
  policies: 'Politikalar',
  standards: 'Standartlar',
  team: 'Takım',
  collab: 'İşbirliği',
  'two-factor': '2FA Güvenlik',
  'theme-editor': 'Tema Editörü',
};

const MODE_LABELS: Record<StudioMode, string> = {
  dashboard: 'STUDIO DASHBOARD',
  code: 'CODE STUDIO',
  '3d-studio': '3D & GAME STUDIO',
  'game-studio': 'AGENT & OPS',
  deploy: 'DEPLOY & ADMIN',
};

export function SidePanel() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const mode = getModeForView(activeView);
  const views = getModeViews(mode);

  return (
    <div
      className="w-48 flex flex-col border-r border-cyan-500/15 flex-shrink-0"
      style={{ background: 'rgba(5, 10, 20, 0.95)' }}
    >
      {/* Panel Header — Mode adı */}
      <div
        className="px-3 py-2 border-b border-cyan-500/15 flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 jarvis-pulse" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400/70 jarvis-glow-sm">
          {MODE_LABELS[mode]}
        </span>
      </div>

      {/* View List */}
      <div className="flex-1 overflow-y-auto jarvis-scrollbar py-1">
        {views.map((view) => {
          const Icon = VIEW_ICONS[view] || FileText;
          const label = VIEW_LABELS[view] || view;
          const active = activeView === view;
          return (
            <button
              key={view}
              onClick={() => setView(view)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-all',
                active
                  ? 'text-cyan-300 bg-cyan-500/10 border-l-2 border-cyan-400'
                  : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/5 border-l-2 border-transparent'
              )}
              style={active ? { boxShadow: 'inset 0 0 8px rgba(0,200,255,0.1)' } : undefined}
            >
              <Icon size={13} strokeWidth={active ? 2 : 1.5} className={active ? 'jarvis-glow-sm' : ''} />
              <span className="truncate text-[11px]">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom info */}
      <div className="px-3 py-1.5 border-t border-cyan-500/15 text-[9px] text-cyan-500/40 font-mono">
        {views.length} modül · {mode}
      </div>
    </div>
  );
}
