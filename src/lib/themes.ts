/**
 * Theme System — light/dark/custom accent
 *
 * Tüm theme değişkenleri CSS custom property olarak tanımlı.
 * Kullanıcı seçtikçe <html data-theme="..."> güncellenir.
 */

export type ThemeMode = 'dark' | 'light' | 'midnight' | 'neon' | 'solarized';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  description: string;
  // VS Code tarzı renkler
  background: string;
  foreground: string;
  card: string;
  sidebar: string;
  border: string;
  primary: string;
  accent: string;
  // Status bar
  statusbar: string;
  // Activity bar
  activitybar: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'VS Code Dark+',
    description: 'Klasik VS Code karanlık teması (varsayılan)',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    card: '#252526',
    sidebar: '#252526',
    border: '#3c3c3c',
    primary: '#0e639c',
    accent: '#4fc3f7',
    statusbar: '#007acc',
    activitybar: '#333333',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Lacivert tonlu derin karanlık',
    background: '#0a0e27',
    foreground: '#e2e8f0',
    card: '#131a3a',
    sidebar: '#0f1530',
    border: '#1e2a4a',
    primary: '#3b82f6',
    accent: '#06b6d4',
    statusbar: '#1e3a8a',
    activitybar: '#0f1530',
  },
  {
    id: 'neon',
    name: 'Neon Jarvis',
    description: 'Iron Man Jarvis tarzı neon cyan/magenta',
    background: '#050510',
    foreground: '#e0f7ff',
    card: '#0a0a1f',
    sidebar: '#08081a',
    border: '#1a1a3a',
    primary: '#06b6d4',
    accent: '#ec4899',
    statusbar: '#0d0d25',
    activitybar: '#08081a',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    description: 'Göz dostu solarized paleti',
    background: '#002b36',
    foreground: '#93a1a1',
    card: '#073642',
    sidebar: '#073642',
    border: '#586e75',
    primary: '#268bd2',
    accent: '#2aa198',
    statusbar: '#073642',
    activitybar: '#073642',
  },
  {
    id: 'light',
    name: 'VS Code Light',
    description: 'Gündüz modu — açık tema',
    background: '#ffffff',
    foreground: '#1e1e1e',
    card: '#f8f8f8',
    sidebar: '#f3f3f3',
    border: '#e0e0e0',
    primary: '#0066b8',
    accent: '#007acc',
    statusbar: '#007acc',
    activitybar: '#2c2c2c',
  },
];

export function applyTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  root.style.setProperty('--card', theme.card);
  root.style.setProperty('--sidebar', theme.sidebar);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--ide-statusbar', theme.statusbar);
  root.style.setProperty('--ide-activitybar', theme.activitybar);
  root.style.setProperty('--ide-titlebar', theme.border);
  root.style.setProperty('--ide-tab-active', theme.background);
  root.style.setProperty('--ide-tab-inactive', theme.card);

  // Dark class
  if (theme.id === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }

  // Save
  try {
    localStorage.setItem('theme', theme.id);
  } catch {}
}

export function getStoredTheme(): ThemeMode {
  try {
    return (localStorage.getItem('theme') as ThemeMode) || 'dark';
  } catch {
    return 'dark';
  }
}

export function getThemeById(id: ThemeMode): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
