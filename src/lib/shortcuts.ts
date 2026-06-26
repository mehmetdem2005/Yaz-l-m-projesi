/**
 * Global keyboard shortcuts sistemi
 * Tüm uygulama genelinde kısayol yönetimi
 */

export interface Shortcut {
  id: string;
  keys: string[]; // ['Ctrl', 'K']
  description: string;
  category: 'navigation' | 'editor' | 'ai' | 'system' | 'mobile';
  action?: () => void;
  global?: boolean; // her yerde çalışır mı
}

export const SHORTCUTS: Shortcut[] = [
  // Navigation
  { id: 'cmd-palette', keys: ['Ctrl', 'K'], description: 'Komut paletini aç', category: 'navigation', global: true },
  { id: 'go-dashboard', keys: ['Ctrl', '1'], description: 'Dashboard\'a git', category: 'navigation', global: true },
  { id: 'go-projects', keys: ['Ctrl', '2'], description: 'Projelere git', category: 'navigation', global: true },
  { id: 'go-editor', keys: ['Ctrl', '3'], description: 'Editöre git', category: 'navigation', global: true },
  { id: 'go-agent-tree', keys: ['Ctrl', '4'], description: 'Agent Tree\'ye git', category: 'navigation', global: true },
  { id: 'go-monitor', keys: ['Ctrl', '5'], description: 'Mission Control\'a git', category: 'navigation', global: true },
  { id: 'go-sandbox', keys: ['Ctrl', '6'], description: 'Sandbox\'a git', category: 'navigation', global: true },
  { id: 'go-skills', keys: ['Ctrl', '7'], description: 'Skiller\'e git', category: 'navigation', global: true },
  { id: 'go-connectors', keys: ['Ctrl', '8'], description: 'Connector\'lara git', category: 'navigation', global: true },
  { id: 'go-settings', keys: ['Ctrl', '9'], description: 'Ayarlar\'a git', category: 'navigation', global: true },

  // Editor
  { id: 'save-file', keys: ['Ctrl', 'S'], description: 'Dosyayı kaydet', category: 'editor' },
  { id: 'new-file', keys: ['Ctrl', 'Alt', 'N'], description: 'Yeni dosya', category: 'editor' },
  { id: 'close-tab', keys: ['Ctrl', 'W'], description: 'Aktif sekmeyi kapat', category: 'editor' },
  { id: 'search-files', keys: ['Ctrl', 'P'], description: 'Dosya arama', category: 'editor', global: true },
  { id: 'search-code', keys: ['Ctrl', 'Shift', 'F'], description: 'Kod arama', category: 'editor', global: true },
  { id: 'run-sandbox', keys: ['Ctrl', 'Enter'], description: 'Sandbox\'ta çalıştır', category: 'editor' },
  { id: 'format-code', keys: ['Shift', 'Alt', 'F'], description: 'Kodu formatla', category: 'editor' },

  // AI
  { id: 'send-chat', keys: ['Ctrl', 'Enter'], description: 'AI mesajı gönder', category: 'ai' },
  { id: 'focus-chat', keys: ['Ctrl', 'L'], description: 'Sohbet\'e odaklan', category: 'ai', global: true },
  { id: 'clear-chat', keys: ['Ctrl', 'Shift', 'L'], description: 'Sohbeti temizle', category: 'ai' },
  { id: 'toggle-diff', keys: ['Ctrl', 'D'], description: 'Diff modunu aç/kapat', category: 'ai' },

  // System
  { id: 'toggle-theme', keys: ['Ctrl', 'Shift', 'T'], description: 'Tema değiştir', category: 'system', global: true },
  { id: 'toggle-mobile-nav', keys: ['Ctrl', 'M'], description: 'Mobil menüyü aç', category: 'mobile', global: true },
  { id: 'help', keys: ['?'], description: 'Kısayol yardımını göster', category: 'system', global: true },
  { id: 'escape', keys: ['Escape'], description: 'Modal/panel kapat', category: 'system', global: true },
];

export function formatShortcut(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return keys
    .map((k) => {
      if (isMac) {
        if (k === 'Ctrl') return '⌘';
        if (k === 'Alt') return '⌥';
        if (k === 'Shift') return '⇧';
      }
      return k;
    })
    .join(isMac ? '' : '+');
}

export function matchShortcut(event: KeyboardEvent, keys: string[]): boolean {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const ctrl = isMac ? event.metaKey : event.ctrlKey;
  const alt = event.altKey;
  const shift = event.shiftKey;

  for (const key of keys) {
    if (key === 'Ctrl' && !ctrl) return false;
    if (key === 'Alt' && !alt) return false;
    if (key === 'Shift' && !shift) return false;
  }

  const lastKey = keys[keys.length - 1].toLowerCase();
  if (['ctrl', 'alt', 'shift'].includes(lastKey)) return false;

  return event.key.toLowerCase() === lastKey;
}

export const SHORTCUT_CATEGORIES = [
  { id: 'navigation', label: 'Navigasyon', color: '#3b82f6' },
  { id: 'editor', label: 'Editör', color: '#10b981' },
  { id: 'ai', label: 'AI', color: '#a855f7' },
  { id: 'system', label: 'Sistem', color: '#f59e0b' },
  { id: 'mobile', label: 'Mobil', color: '#ec4899' },
] as const;
