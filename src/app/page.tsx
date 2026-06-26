'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TitleBar } from '@/components/ide/TitleBar';
import { ActivityBar } from '@/components/ide/ActivityBar';
import { StatusBar } from '@/components/ide/StatusBar';
import { MobileBottomNav } from '@/components/ide/MobileBottomNav';
import { MobileChatPanel } from '@/components/ide/MobileChatPanel';
import { TerminalPanel } from '@/components/ide/TerminalPanel';
import { ThemeSwitcher } from '@/components/ide/ThemeSwitcher';
import { CommandPalette } from '@/components/ide/overlays/CommandPalette';
import { ShortcutsHelp } from '@/components/ide/overlays/ShortcutsHelp';
import { GlobalSearch } from '@/components/ide/overlays/GlobalSearch';
import { OnboardingWizard } from '@/components/ide/overlays/OnboardingWizard';
import { Dashboard } from '@/components/views/Dashboard';
import { Projects } from '@/components/views/Projects';
import { Editor } from '@/components/views/Editor';
import { Policies } from '@/components/views/Policies';
import { Standards } from '@/components/views/Standards';
import { AgentView } from '@/components/views/AgentView';
import { AgentTreeView } from '@/components/views/AgentTreeView';
import { AgentMonitorView } from '@/components/views/AgentMonitorView';
import { AgentTemplatesView } from '@/components/views/AgentTemplatesView';
import { SandboxView } from '@/components/views/SandboxView';
import { SkillsView } from '@/components/views/SkillsView';
import { ConnectorsView } from '@/components/views/ConnectorsView';
import { Templates } from '@/components/views/Templates';
import { SnippetsView } from '@/components/views/SnippetsView';
import { DevPromptsView } from '@/components/views/DevPromptsView';
import { DatabaseExplorerView } from '@/components/views/DatabaseExplorerView';
import { ApiTesterView } from '@/components/views/ApiTesterView';
import { SecurityScannerView } from '@/components/views/SecurityScannerView';
import { SecretScannerView } from '@/components/views/SecretScannerView';
import { BundleAnalyzerView } from '@/components/views/BundleAnalyzerView';
import { TestRunnerView } from '@/components/views/TestRunnerView';
import { AuditLogView } from '@/components/views/AuditLogView';
import { TeamView } from '@/components/views/TeamView';
import { CollabView } from '@/components/views/CollabView';
import { TwoFactorView } from '@/components/views/TwoFactorView';
import { WebhooksView } from '@/components/views/WebhooksView';
import { CronJobsView } from '@/components/views/CronJobsView';
import { NotificationsView } from '@/components/views/NotificationsView';
import { ErrorTrackingView } from '@/components/views/ErrorTrackingView';
import { FeatureFlagsView } from '@/components/views/FeatureFlagsView';
import { StatusPageView } from '@/components/views/StatusPageView';
import { WorkflowsView } from '@/components/views/WorkflowsView';
import { ThemeEditorView } from '@/components/views/ThemeEditorView';
import { AnalyticsView2 } from '@/components/views/AnalyticsView2';
import { DependencyMonitorView } from '@/components/views/DependencyMonitorView';
import { DeployTargetsView } from '@/components/views/DeployTargetsView';
import { Nexus3DStudioView } from '@/components/views/Nexus3DStudioView';
import { HistoryView } from '@/components/views/HistoryView';
import { Settings } from '@/components/views/Settings';
import { Analytics } from '@/components/views/Analytics';
import { Docs } from '@/components/views/Docs';
import { ExportView } from '@/components/views/ExportView';
import { SidePanel } from '@/components/ide/SidePanel';
import { Inspector } from '@/components/ide/Inspector';
import { applyTheme, getStoredTheme, getThemeById } from '@/lib/themes';
import { matchShortcut } from '@/lib/shortcuts';
import { toast } from 'sonner';

export default function Home() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const mobileNavOpen = useStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen);
  const mobileChatOpen = useStore((s) => s.mobileChatOpen);
  const setMobileChatOpen = useStore((s) => s.setMobileChatOpen);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const setShortcutsHelpOpen = useStore((s) => s.setShortcutsHelpOpen);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setSearchMode = useStore((s) => s.setSearchMode);
  const toggleTerminal = useStore((s) => s.toggleTerminal);
  const setTheme = useStore((s) => s.setTheme);

  // Listen for mobile chat open event
  useEffect(() => {
    const handler = () => setMobileChatOpen(true);
    window.addEventListener('ide:open-mobile-chat', handler);
    return () => window.removeEventListener('ide:open-mobile-chat', handler);
  }, [setMobileChatOpen]);

  // Apply theme on mount
  useEffect(() => {
    const stored = getStoredTheme();
    applyTheme(getThemeById(stored));
    setTheme(stored);
  }, [setTheme]);

  // Listen for theme change events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        applyTheme(getThemeById(detail));
        setTheme(detail);
      }
    };
    window.addEventListener('ide:theme-change', handler);
    return () => window.removeEventListener('ide:theme-change', handler);
  }, [setTheme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/dialogs (except for global shortcuts)
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      // Ctrl+K — Command Palette (global)
      if (matchShortcut(e, ['Ctrl', 'K'])) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Ctrl+P — File search (global)
      if (matchShortcut(e, ['Ctrl', 'P'])) {
        e.preventDefault();
        setSearchMode('files');
        setSearchOpen(true);
        return;
      }

      // Ctrl+Shift+F — Code search (global)
      if (matchShortcut(e, ['Ctrl', 'Shift', 'F'])) {
        e.preventDefault();
        setSearchMode('code');
        setSearchOpen(true);
        return;
      }

      // Ctrl+` — Terminal toggle (global)
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl+Shift+T — Theme cycle (global)
      if (matchShortcut(e, ['Ctrl', 'Shift', 'T'])) {
        e.preventDefault();
        const themes = ['dark', 'midnight', 'neon', 'solarized', 'light'] as const;
        const current = useStore.getState().theme;
        const idx = themes.indexOf(current as any);
        const next = themes[(idx + 1) % themes.length];
        applyTheme(getThemeById(next));
        setTheme(next);
        toast.success(`Tema: ${getThemeById(next).name}`);
        return;
      }

      // ? (when not in input) — Help
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShortcutsHelpOpen(true);
        return;
      }

      // Ctrl+1..9 — Navigation (global)
      if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const views = [
          'dashboard', 'projects', 'editor',
          'agent-tree', 'agent-monitor', 'sandbox',
          'skills', 'connectors', 'settings',
        ] as const;
        const idx = parseInt(e.key) - 1;
        if (views[idx]) setView(views[idx]);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    setView, setCommandPaletteOpen, setShortcutsHelpOpen,
    setSearchOpen, setSearchMode, toggleTerminal, setTheme,
  ]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'editor': return <Editor />;
      case 'policies': return <Policies />;
      case 'standards': return <Standards />;
      case 'agent': return <AgentView />;
      case 'agent-tree': return <AgentTreeView />;
      case 'agent-monitor': return <AgentMonitorView />;
      case 'agent-templates': return <AgentTemplatesView />;
      case 'sandbox': return <SandboxView />;
      case 'skills': return <SkillsView />;
      case 'connectors': return <ConnectorsView />;
      case 'templates': return <Templates />;
      case 'snippets': return <SnippetsView />;
      case 'dev-prompts': return <DevPromptsView />;
      case 'db-explorer': return <DatabaseExplorerView />;
      case 'api-tester': return <ApiTesterView />;
      case 'security-scanner': return <SecurityScannerView />;
      case 'secret-scanner': return <SecretScannerView />;
      case 'bundle-analyzer': return <BundleAnalyzerView />;
      case 'test-runner': return <TestRunnerView />;
      case 'audit-log': return <AuditLogView />;
      case 'team': return <TeamView />;
      case 'collab': return <CollabView />;
      case 'two-factor': return <TwoFactorView />;
      case 'webhooks': return <WebhooksView />;
      case 'cron-jobs': return <CronJobsView />;
      case 'notifications': return <NotificationsView />;
      case 'error-tracking': return <ErrorTrackingView />;
      case 'feature-flags': return <FeatureFlagsView />;
      case 'status': return <StatusPageView />;
      case 'workflows': return <WorkflowsView />;
      case 'theme-editor': return <ThemeEditorView />;
      case 'dependency-monitor': return <DependencyMonitorView />;
      case 'deploy-targets': return <DeployTargetsView />;
      case 'nexus-3d': return <Nexus3DStudioView />;
      case 'analytics-2': return <AnalyticsView2 />;
      case 'history': return <HistoryView />;
      case 'settings': return <Settings />;
      case 'analytics': return <Analytics />;
      case 'docs': return <Docs />;
      case 'export': return <ExportView />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
    {/* Dikey mod engeli — container DIŞINDA, tüm ekranda */}
    <PortraitBlocker />
    <div className="h-screen flex flex-col overflow-hidden jarvis-grid-bg portrait-hide" style={{ background: 'rgba(3, 8, 18, 0.98)' }}>
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        {/* ActivityBar — 5 stüdyo modu */}
        <ActivityBar />

        {/* SidePanel — mode'a göre view listesi */}
        <SidePanel />

        {/* Main Viewport — aktif view (scroll aktif) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden jarvis-scrollbar studio-view">
            {renderView()}
          </div>
          {/* Console/Terminal */}
          <TerminalPanel />
        </div>

        {/* Inspector — sağ panel */}
        <Inspector />
      </div>
      <StatusBar />

      {/* Mobile chat panel */}
      <MobileChatPanel
        open={mobileChatOpen}
        onOpenChange={setMobileChatOpen}
      />

      {/* Overlays */}
      <CommandPalette />
      <ShortcutsHelp />
      <GlobalSearch />
      <OnboardingWizard />
    </div>
    </>
  );
}

// ---------- Portrait Blocker — Sadece Yatay Mod ----------
function PortraitBlocker() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Ekran dikey ise (yükseklik > genişlik) her zaman engelle
      // PC'de dar pencere, mobilde dikey tutma — farketmez
      setIsPortrait(h > w);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    // Ekran döndüğünde anında kontrol et
    if (screen.orientation) {
      screen.orientation.addEventListener('change', check);
    }
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div
      data-portrait-blocker="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'rgba(5,10,20,0.98)' }}
    >
      <div className="text-center px-8">
        {/* Dönen arc */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/30 jarvis-arc"
            style={{ borderTopColor: 'rgba(0,255,255,0.8)' }}
          />
          <div
            className="absolute inset-2 rounded-full border border-cyan-400/20 jarvis-arc"
            style={{ borderBottomColor: 'rgba(0,200,255,0.6)', animationDirection: 'reverse', animationDuration: '2s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400 jarvis-glow-sm">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path d="M3.27 6.96 12 12.01l8.73-5.05"/>
              <path d="M12 22.08V12"/>
            </svg>
          </div>
        </div>
        <h2 className="text-cyan-300 text-xl font-bold mb-2 jarvis-glow-sm">Cihazı Yatay Tutun</h2>
        <p className="text-cyan-400/60 text-sm mb-4">DeepSeek App Studio yatay modda çalışır</p>
        <div className="flex items-center justify-center gap-2 text-cyan-400/40 text-xs">
          <div className="w-12 h-20 border-2 border-cyan-400/30 rounded-md flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400/50">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/>
              <path d="M12 8v4l2 2"/>
            </svg>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400/40">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <div className="w-20 h-12 border-2 border-cyan-400/50 rounded-md flex items-center justify-center" style={{ boxShadow: '0 0 10px rgba(0,200,255,0.2)' }}>
            <div className="w-3 h-3 rounded-full bg-cyan-400/60 jarvis-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
