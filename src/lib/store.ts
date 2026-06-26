/**
 * Zustand store — IDE state yönetimi (v3 genişletilmiş)
 */
import { create } from 'zustand';
import type { ThemeMode } from './themes';

export type ViewKey =
  | 'dashboard' | 'projects' | 'editor'
  | 'policies' | 'standards'
  | 'agent' | 'agent-tree' | 'agent-monitor' | 'agent-templates'
  | 'sandbox' | 'skills' | 'connectors' | 'templates' | 'snippets'
  | 'dev-prompts' | 'prompt-builder'
  | 'db-explorer' | 'api-tester' | 'security-scanner' | 'secret-scanner'
  | 'bundle-analyzer' | 'test-runner' | 'audit-log'
  | 'team' | 'collab' | 'two-factor'
  | 'error-tracking' | 'feature-flags' | 'webhooks' | 'cron-jobs' | 'status'
  | 'workflows' | 'notifications' | 'theme-editor'
  | 'nexus-3d'
  | 'history' | 'settings' | 'analytics' | 'docs' | 'export';

export interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelUsed?: string;
  createdAt: Date;
  pending?: boolean;
  error?: boolean;
  type?: 'question' | 'plan' | 'executing' | 'complete' | 'error';
  questions?: Array<{ id: string; question: string; options?: string[]; required: boolean; context: string }>;
  codeChanges?: Array<{ path: string; content: string; isDiff: boolean }>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  standard?: string | null;
  template?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { files: number; messages: number };
  files?: ProjectFile[];
  messages?: Array<Record<string, unknown>>;
  versions?: Array<Record<string, unknown>>;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'free';

interface AppState {
  // View
  activeView: ViewKey;
  setView: (v: ViewKey) => void;

  // Project
  activeProjectId: string | null;
  activeProject: Project | null;
  activeFilePath: string | null;
  openTabs: string[]; // YENİ: multi-tab
  setActiveProject: (p: Project | null) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveFile: (path: string | null) => void;
  openTab: (path: string) => void;
  closeTab: (path: string) => void;

  // Files
  files: ProjectFile[];
  setFiles: (f: ProjectFile[]) => void;
  updateFileContent: (path: string, content: string) => void;
  addFile: (f: ProjectFile) => void;
  removeFile: (path: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  updateChatMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  chatMode: 'smart' | 'normal';
  setChatMode: (m: 'smart' | 'normal') => void;
  chatInput: string;
  setChatInput: (s: string) => void;

  // Mobile chat panel
  mobileChatOpen: boolean;
  setMobileChatOpen: (b: boolean) => void;

  // Settings
  deepseekModel: string;
  setDeepseekModel: (m: string) => void;
  apiKeysSet: boolean;
  setApiKeysSet: (b: boolean) => void;

  // Skills
  activeSkillIds: string[];
  setActiveSkills: (ids: string[]) => void;
  toggleSkill: (id: string) => void;

  // Device
  deviceType: DeviceType;
  setDeviceType: (d: DeviceType) => void;

  // Diff
  diffMode: boolean;
  setDiffMode: (b: boolean) => void;

  // Multi-standards (YENİ — birden fazla standart seç)
  selectedStandards: string[];
  setSelectedStandards: (ids: string[]) => void;
  toggleStandard: (id: string) => void;
  selectAllStandards: () => void;
  clearStandards: () => void;

  // Theme (YENİ)
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (b: boolean) => void;

  // Command Palette (YENİ)
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (b: boolean) => void;

  // Shortcuts help (YENİ)
  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (b: boolean) => void;

  // Global search (YENİ)
  searchOpen: boolean;
  setSearchOpen: (b: boolean) => void;
  searchMode: 'files' | 'code';
  setSearchMode: (m: 'files' | 'code') => void;

  // Terminal panel (YENİ)
  terminalOpen: boolean;
  toggleTerminal: () => void;

  // Onboarding (YENİ)
  onboardingComplete: boolean;
  setOnboardingComplete: (b: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (b: boolean) => void;

  // Bottom nav (mobile) (YENİ)
  mobileBottomNavOpen: boolean;
}

export const useStore = create<AppState>((set) => ({
  activeView: 'dashboard',
  setView: (v) => set({ activeView: v, mobileNavOpen: false }),

  activeProjectId: null,
  activeProject: null,
  activeFilePath: null,
  openTabs: [],
  setActiveProject: (p) => set({ activeProject: p }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveFile: (path) => set({ activeFilePath: path }),
  openTab: (path) =>
    set((s) => ({
      openTabs: s.openTabs.includes(path) ? s.openTabs : [...s.openTabs, path],
      activeFilePath: path,
    })),
  closeTab: (path) =>
    set((s) => {
      const idx = s.openTabs.indexOf(path);
      const newTabs = s.openTabs.filter((t) => t !== path);
      const newActive =
        s.activeFilePath === path
          ? newTabs[Math.max(0, idx - 1)] || null
          : s.activeFilePath;
      return { openTabs: newTabs, activeFilePath: newActive };
    }),

  files: [],
  setFiles: (f) => set({ files: f }),
  updateFileContent: (path, content) =>
    set((s) => ({
      files: s.files.map((f) => (f.path === path ? { ...f, content } : f)),
    })),
  addFile: (f) => set((s) => ({ files: [...s.files, f] })),
  removeFile: (path) =>
    set((s) => ({
      files: s.files.filter((f) => f.path !== path),
      openTabs: s.openTabs.filter((t) => t !== path),
    })),

  chatMessages: [],
  addChatMessage: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
  updateChatMessage: (id, updates) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  clearChat: () => set({ chatMessages: [] }),
  chatMode: 'smart',
  setChatMode: (m) => set({ chatMode: m }),
  chatInput: '',
  setChatInput: (s) => set({ chatInput: s }),

  mobileChatOpen: false,
  setMobileChatOpen: (b) => set({ mobileChatOpen: b }),

  deepseekModel: 'deepseek-reasoner',
  setDeepseekModel: (m) => set({ deepseekModel: m }),
  apiKeysSet: false,
  setApiKeysSet: (b) => set({ apiKeysSet: b }),

  activeSkillIds: ['motion-design', 'code-quality', 'security-hardening'],
  setActiveSkills: (ids) => set({ activeSkillIds: ids }),
  toggleSkill: (id) =>
    set((s) => ({
      activeSkillIds: s.activeSkillIds.includes(id)
        ? s.activeSkillIds.filter((x) => x !== id)
        : [...s.activeSkillIds, id],
    })),

  deviceType: 'desktop',
  setDeviceType: (d) => set({ deviceType: d }),

  diffMode: true,
  setDiffMode: (b) => set({ diffMode: b }),

  selectedStandards: [],
  setSelectedStandards: (ids) => set({ selectedStandards: ids }),
  toggleStandard: (id) =>
    set((s) => ({
      selectedStandards: s.selectedStandards.includes(id)
        ? s.selectedStandards.filter((x) => x !== id)
        : [...s.selectedStandards, id],
    })),
  selectAllStandards: () => {
    // Tüm standart ID'lerini eklemek için STANDARDS import etmek gerekir
    // Editor veya ilgili view bunu kendi içinde handle edebilir
    set({ selectedStandards: ['all'] });
  },
  clearStandards: () => set({ selectedStandards: [] }),

  theme: 'dark',
  setTheme: (t) => set({ theme: t }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  rightPanelOpen: true,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  mobileNavOpen: false,
  setMobileNavOpen: (b) => set({ mobileNavOpen: b }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (b) => set({ commandPaletteOpen: b }),

  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (b) => set({ shortcutsHelpOpen: b }),

  searchOpen: false,
  setSearchOpen: (b) => set({ searchOpen: b }),
  searchMode: 'files',
  setSearchMode: (m) => set({ searchMode: m }),

  terminalOpen: false,
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),

  onboardingComplete: false,
  setOnboardingComplete: (b) => set({ onboardingComplete: b }),
  onboardingOpen: false,
  setOnboardingOpen: (b) => set({ onboardingOpen: b }),

  mobileBottomNavOpen: true,
}));
