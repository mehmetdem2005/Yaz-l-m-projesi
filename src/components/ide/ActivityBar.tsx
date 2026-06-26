'use client';

import {
  LayoutDashboard,
  FolderGit2,
  Code2,
  ScrollText,
  BookMarked,
  Bot,
  LayoutTemplate,
  History,
  Settings,
  BarChart3,
  FileText,
  Download,
  Network,
  Radar,
  SquareTerminal,
  Sparkles,
  Plug,
  Boxes,
  Braces,
  Wand2,
  Database,
  Globe,
  ShieldCheck,
  Users,
  GitBranch,
  Flag,
  AlertCircle,
  Activity,
  Palette,
  Bell,
  Workflow,
  Package,
  Rocket,
  Shield,
  Box,
  Lock,
  Clock,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import { useStore, type ViewKey } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavItem {
  id: ViewKey;
  icon: LucideIcon;
  label: string;
  badge?: string;
  section: 'main' | 'agents' | 'tools' | 'system' | 'team' | 'ops';
}

const NAV_ITEMS: NavItem[] = [
  // Main — günlük kullanım
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { id: 'projects', icon: FolderGit2, label: 'Projeler', section: 'main' },
  { id: 'editor', icon: Code2, label: 'Editör', section: 'main' },
  // Agents — AI orkestrasyon
  { id: 'agent-tree', icon: Network, label: 'Agent Tree Studio', section: 'agents' },
  { id: 'agent-monitor', icon: Radar, label: 'Mission Control', section: 'agents' },
  { id: 'agent-templates', icon: Boxes, label: 'Agent Şablonları', section: 'agents' },
  { id: 'agent', icon: Bot, label: 'ReAct Agent', section: 'agents' },
  // Tools — geliştirici araçları
  { id: 'sandbox', icon: SquareTerminal, label: 'Sandbox', section: 'tools' },
  { id: 'skills', icon: Sparkles, label: 'Skiller', badge: '6', section: 'tools' },
  { id: 'dev-prompts', icon: Wand2, label: 'Dev Prompts', badge: '10', section: 'tools' },
  { id: 'snippets', icon: Braces, label: 'Snippet\'lar', section: 'tools' },
  { id: 'connectors', icon: Plug, label: 'Connector & MCP', section: 'tools' },
  { id: 'db-explorer', icon: Database, label: 'Veritabanı Gezgini', section: 'tools' },
  { id: 'api-tester', icon: Globe, label: 'API Tester', section: 'tools' },
  { id: 'security-scanner', icon: ShieldCheck, label: 'Security Scanner', section: 'tools' },
  { id: 'secret-scanner', icon: Lock, label: 'Secret Scanner', section: 'tools' },
  { id: 'bundle-analyzer', icon: Package, label: 'Bundle Analyzer', section: 'tools' },
  { id: 'test-runner', icon: FlaskConical, label: 'Test Runner', section: 'tools' },
  { id: 'audit-log', icon: ScrollText, label: 'Audit Log', section: 'tools' },
  { id: 'dependency-monitor', icon: Package, label: 'Dependency Monitor', section: 'tools' },
  { id: 'deploy-targets', icon: Rocket, label: 'Deploy Targets', section: 'tools' },
  { id: 'nexus-3d', icon: Box, label: 'NEXUS 3D Studio', badge: 'AAA', section: 'tools' },
  { id: 'templates', icon: LayoutTemplate, label: 'Proje Şablonları', section: 'tools' },
  // Team — işbirliği
  { id: 'team', icon: Users, label: 'Takım', section: 'team' },
  { id: 'collab', icon: Users, label: 'Canlı İşbirliği', section: 'team' },
  { id: 'two-factor', icon: Shield, label: '2FA Güvenlik', section: 'team' },
  // Ops — operasyon
  { id: 'error-tracking', icon: AlertCircle, label: 'Hata Takibi', section: 'ops' },
  { id: 'feature-flags', icon: Flag, label: 'Feature Flags', section: 'ops' },
  { id: 'webhooks', icon: GitBranch, label: 'Webhooks', section: 'ops' },
  { id: 'cron-jobs', icon: Clock, label: 'Cron Jobs', section: 'ops' },
  { id: 'status', icon: Activity, label: 'Status Page', section: 'ops' },
  { id: 'workflows', icon: Workflow, label: 'Workflow Builder', section: 'ops' },
  { id: 'notifications', icon: Bell, label: 'Bildirimler', section: 'ops' },
  // System
  { id: 'policies', icon: ScrollText, label: 'Politikalar', badge: '30', section: 'system' },
  { id: 'standards', icon: BookMarked, label: 'Standartlar', badge: '18', section: 'system' },
  { id: 'analytics', icon: BarChart3, label: 'Analitik', section: 'system' },
  { id: 'history', icon: History, label: 'Sürüm Geçmişi', section: 'system' },
  { id: 'docs', icon: FileText, label: 'API Dokümantasyon', section: 'system' },
  { id: 'export', icon: Download, label: 'Deploy & Export', section: 'system' },
  { id: 'theme-editor', icon: Palette, label: 'Tema Editörü', section: 'system' },
  { id: 'settings', icon: Settings, label: 'Ayarlar', section: 'system' },
];

const SECTIONS: { id: NavItem['section']; label: string }[] = [
  { id: 'main', label: 'Genel' },
  { id: 'agents', label: 'Agentlar' },
  { id: 'tools', label: 'Araçlar' },
  { id: 'team', label: 'Takım' },
  { id: 'ops', label: 'Operasyon' },
  { id: 'system', label: 'Sistem' },
];

export function ActivityBar() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);

  return (
    <nav className="ide-activitybar w-12 md:w-14 flex flex-col items-center py-2 border-r border-black/30 flex-shrink-0 overflow-y-auto overflow-x-hidden"
      style={{ scrollbarWidth: 'thin', maxHeight: '100%' }}>
      {SECTIONS.map((section, idx) => {
        const sectionItems = NAV_ITEMS.filter((n) => n.section === section.id);
        if (sectionItems.length === 0) return null;
        return (
          <div key={section.id} className="w-full">
            {idx > 0 && <div className="h-px bg-white/10 my-1.5 mx-2" />}
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  title={item.label}
                  className={cn(
                    'group relative w-12 md:w-14 h-10 md:h-11 flex items-center justify-center transition-all',
                    active
                      ? 'text-white bg-white/5'
                      : 'text-gray-500 hover:text-white hover:bg-white/3'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue-400 rounded-r" />
                  )}
                  <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                  {item.badge && (
                    <span className="absolute top-0.5 right-0.5 text-[7px] bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-mono">
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip */}
                  <span className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
