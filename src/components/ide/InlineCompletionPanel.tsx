'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Brain,
  Zap,
  Loader2,
  Check,
  X,
  Settings,
  Keyboard,
} from 'lucide-react';
import { toast } from 'sonner';

interface InlineSuggestion {
  id: string;
  text: string;
  range: { startLine: number; endLine: number };
  preview: string;
}

export function InlineCompletionPanel() {
  const [loading, setLoading] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<InlineSuggestion | null>(null);

  // Load settings from localStorage (lazy init)
  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('inline_completion_settings');
      if (stored) return JSON.parse(stored).enabled ?? true;
    } catch {}
    return true;
  });
  const [debounceMs, setDebounceMs] = useState(() => {
    try {
      const stored = localStorage.getItem('inline_completion_settings');
      if (stored) return JSON.parse(stored).debounceMs ?? 800;
    } catch {}
    return 800;
  });
  const [stats, setStats] = useState(() => {
    try {
      const stored = localStorage.getItem('inline_completion_settings');
      if (stored) return JSON.parse(stored).stats || { accepted: 0, rejected: 0, total: 0 };
    } catch {}
    return { accepted: 0, rejected: 0, total: 0 };
  });

  const saveSettings = useCallback(
    (updates: Partial<{ enabled: boolean; debounceMs: number; stats: typeof stats }>) => {
      const newSettings = { enabled, debounceMs, stats, ...updates };
      try {
        localStorage.setItem('inline_completion_settings', JSON.stringify(newSettings));
      } catch {}
    },
    [enabled, debounceMs, stats]
  );

  const toggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    saveSettings({ enabled: checked });
    // Notify editor
    window.dispatchEvent(new CustomEvent('ide:inline-completion-toggle', { detail: checked }));
    toast.success(checked ? 'Inline completion aktif' : 'Inline completion kapalı');
  };

  // Listen for suggestion events from editor
  useEffect(() => {
    const onSuggestion = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setLastSuggestion(detail);
      setLoading(false);
      setStats((s) => ({ ...s, total: s.total + 1 }));
      saveSettings({ stats: { ...stats, total: stats.total + 1 } });
    };

    const onLoading = () => setLoading(true);
    const onAccept = () => {
      setStats((s) => ({ ...s, accepted: s.accepted + 1 }));
      saveSettings({ stats: { ...stats, accepted: stats.accepted + 1 } });
    };
    const onReject = () => {
      setStats((s) => ({ ...s, rejected: s.rejected + 1 }));
      saveSettings({ stats: { ...stats, rejected: stats.rejected + 1 } });
    };

    window.addEventListener('ide:inline-suggestion', onSuggestion);
    window.addEventListener('ide:inline-loading', onLoading);
    window.addEventListener('ide:inline-accept', onAccept);
    window.addEventListener('ide:inline-reject', onReject);

    return () => {
      window.removeEventListener('ide:inline-suggestion', onSuggestion);
      window.removeEventListener('ide:inline-loading', onLoading);
      window.removeEventListener('ide:inline-accept', onAccept);
      window.removeEventListener('ide:inline-reject', onReject);
    };
  }, [stats, saveSettings]);

  return (
    <div className="border-t border-border bg-[#1a1a2e] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-xs font-semibold">AI Pair Programmer</span>
          {loading && <Loader2 size={10} className="animate-spin text-blue-400" />}
        </div>
        <Switch checked={enabled} onCheckedChange={toggleEnabled} />
      </div>

      {enabled && (
        <>
          {/* Last suggestion preview */}
          {lastSuggestion && (
            <div className="bg-[#0d0d18] border border-purple-500/20 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-purple-400 font-semibold">Son Öneri</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-green-400 hover:bg-green-500/20"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('ide:inline-accept'));
                      setLastSuggestion(null);
                    }}
                    title="Kabul et (Tab)"
                  >
                    <Check size={10} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-red-400 hover:bg-red-500/20"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('ide:inline-reject'));
                      setLastSuggestion(null);
                    }}
                    title="Reddet (Esc)"
                  >
                    <X size={10} />
                  </Button>
                </div>
              </div>
              <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap line-clamp-3">
                {lastSuggestion.preview}
              </pre>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-sm font-bold text-green-400">{stats.accepted}</div>
              <div className="text-[9px] text-muted-foreground">Kabul</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-sm font-bold text-red-400">{stats.rejected}</div>
              <div className="text-[9px] text-muted-foreground">Red</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-sm font-bold text-blue-400">
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </div>
              <div className="text-[9px] text-muted-foreground">Accept Rate</div>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Keyboard size={10} />
            <span><kbd className="bg-white/10 px-1 rounded">Tab</kbd> kabul</span>
            <span><kbd className="bg-white/10 px-1 rounded">Esc</kbd> reddet</span>
            <span><kbd className="bg-white/10 px-1 rounded">Alt+\</kbd> tetikle</span>
          </div>
        </>
      )}
    </div>
  );
}
