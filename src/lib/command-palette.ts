/**
 * Command Palette — Ctrl+K ile açılan global komut arama
 *
 * Özellikler:
 * - Hızlı view navigation (12+ view)
 * - Proje arama/açma
 * - Dosya arama
 * - AI komutları ("yeni sohbet", "agent çalıştır")
 * - Ayar kısayolları
 * - Recent commands
 */

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: 'navigation' | 'project' | 'file' | 'ai' | 'action' | 'setting';
  icon: string;
  keywords?: string[];
  shortcut?: string[];
  action: () => void;
  recent?: boolean;
}

export interface CommandContext {
  setView: (v: string) => void;
  setActiveProjectId?: (id: string) => void;
  projects?: Array<{ id: string; name: string }>;
  files?: Array<{ path: string }>;
  openCommand?: string;
}

export const VIEW_COMMANDS = [
  { id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', category: 'navigation' as const, keywords: ['home', 'ana sayfa'] },
  { id: 'projects', title: 'Projeler', icon: 'FolderGit2', category: 'navigation' as const, keywords: ['project', 'proje'] },
  { id: 'editor', title: 'Editör', icon: 'Code2', category: 'navigation' as const, keywords: ['code', 'edit', 'düzenle'] },
  { id: 'agent-tree', title: 'Agent Tree Studio', icon: 'Network', category: 'navigation' as const, keywords: ['agent', 'tree', 'node'] },
  { id: 'agent-monitor', title: 'Mission Control', icon: 'Radar', category: 'navigation' as const, keywords: ['monitor', 'izleme'] },
  { id: 'agent-templates', title: 'Agent Şablonları', icon: 'Boxes', category: 'navigation' as const, keywords: ['template', 'şablon'] },
  { id: 'agent', title: 'ReAct Agent', icon: 'Bot', category: 'navigation' as const, keywords: ['react', 'agent'] },
  { id: 'sandbox', title: 'Sandbox', icon: 'SquareTerminal', category: 'navigation' as const, keywords: ['code', 'run', 'çalıştır'] },
  { id: 'skills', title: 'Skiller', icon: 'Sparkles', category: 'navigation' as const, keywords: ['skill', 'yetkinlik'] },
  { id: 'connectors', title: 'Connector & MCP', icon: 'Plug', category: 'navigation' as const, keywords: ['mcp', 'connector', 'api'] },
  { id: 'templates', title: 'Proje Şablonları', icon: 'LayoutTemplate', category: 'navigation' as const, keywords: ['template', 'şablon'] },
  { id: 'policies', title: 'Politikalar', icon: 'ScrollText', category: 'navigation' as const, keywords: ['policy', 'politika'] },
  { id: 'standards', title: 'Standartlar', icon: 'BookMarked', category: 'navigation' as const, keywords: ['standard', 'standart', 'togaf', 'iso'] },
  { id: 'history', title: 'Sürüm Geçmişi', icon: 'History', category: 'navigation' as const, keywords: ['history', 'version'] },
  { id: 'analytics', title: 'Analitik', icon: 'BarChart3', category: 'navigation' as const, keywords: ['analytics', 'chart'] },
  { id: 'docs', title: 'API Dokümantasyon', icon: 'FileText', category: 'navigation' as const, keywords: ['docs', 'help'] },
  { id: 'export', title: 'Deploy & Export', icon: 'Download', category: 'navigation' as const, keywords: ['export', 'deploy', 'zip'] },
  { id: 'settings', title: 'Ayarlar', icon: 'Settings', category: 'navigation' as const, keywords: ['settings', 'ayar', 'config'] },
];

export const ACTION_COMMANDS = [
  {
    id: 'new-project',
    title: 'Yeni Proje Oluştur',
    description: 'Boş veya şablonlu yeni proje',
    icon: 'Plus',
    category: 'action' as const,
    keywords: ['create', 'new', 'yeni'],
    shortcut: ['Ctrl', 'N'],
  },
  {
    id: 'new-file',
    title: 'Yeni Dosya',
    description: 'Editöre yeni dosya ekle',
    icon: 'FilePlus',
    category: 'action' as const,
    keywords: ['file', 'dosya', 'new'],
    shortcut: ['Ctrl', 'Alt', 'N'],
  },
  {
    id: 'save-file',
    title: 'Dosyayı Kaydet',
    description: 'Aktif dosyayı kaydet',
    icon: 'Save',
    category: 'action' as const,
    keywords: ['save', 'kaydet'],
    shortcut: ['Ctrl', 'S'],
  },
  {
    id: 'run-sandbox',
    title: 'Kodu Sandbox\'ta Çalıştır',
    description: 'Aktif dosyayı sandbox\'ta çalıştır',
    icon: 'Play',
    category: 'action' as const,
    keywords: ['run', 'execute', 'sandbox'],
    shortcut: ['Ctrl', 'Enter'],
  },
  {
    id: 'toggle-theme',
    title: 'Tema Değiştir',
    description: 'Light/Dark/Custom temalar',
    icon: 'Palette',
    category: 'action' as const,
    keywords: ['theme', 'tema', 'dark', 'light'],
    shortcut: ['Ctrl', 'Shift', 'T'],
  },
  {
    id: 'toggle-mobile-nav',
    title: 'Mobil Menüyü Aç',
    description: 'Drawer menüyü aç/kapat',
    icon: 'Menu',
    category: 'action' as const,
    keywords: ['menu', 'nav', 'mobil'],
    shortcut: ['Ctrl', 'M'],
  },
  {
    id: 'focus-chat',
    title: 'AI Sohbet Odaklan',
    description: 'Sohbet input\'a odaklan',
    icon: 'MessageSquare',
    category: 'action' as const,
    keywords: ['chat', 'ai', 'sohbet'],
    shortcut: ['Ctrl', 'L'],
  },
  {
    id: 'clear-chat',
    title: 'Sohbeti Temizle',
    description: 'Tüm sohbeti sıfırla',
    icon: 'Trash2',
    category: 'action' as const,
    keywords: ['clear', 'temizle', 'chat'],
  },
];

/**
 * Fuzzy search — basit substring + score
 */
export function fuzzyMatch(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) {
    return 100 - t.indexOf(q);
  }
  // Token-based
  const tokens = q.split(/\s+/);
  let score = 0;
  for (const token of tokens) {
    if (t.includes(token)) score += 10;
  }
  return score;
}

export function searchCommands(
  query: string,
  allCommands: CommandItem[]
): CommandItem[] {
  if (!query.trim()) {
    // Recent commands önce
    const recent = allCommands.filter((c) => c.recent);
    return [...recent, ...allCommands.filter((c) => !c.recent)].slice(0, 20);
  }

  return allCommands
    .map((c) => {
      const searchText = `${c.title} ${c.description || ''} ${(c.keywords || []).join(' ')}`;
      const score = fuzzyMatch(query, searchText);
      return { cmd: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((x) => x.cmd);
}
