'use client';

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
import { useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ActivityBar as MobileActivityBar } from '@/components/ide/ActivityBar';
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
    <div className="h-screen flex flex-col overflow-hidden bg-background jarvis-grid-bg">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — her zaman görünür (PC = Mobil) */}
        <div className="flex sidebar-desktop">
          <ActivityBar />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 main-content">
          <div className="flex-1 overflow-hidden">
            {renderView()}
          </div>
          {/* Terminal panel */}
          <TerminalPanel />
        </div>
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
  );
}
