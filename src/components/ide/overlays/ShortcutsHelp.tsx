'use client';

import { useStore } from '@/lib/store';
import { SHORTCUTS, SHORTCUT_CATEGORIES, formatShortcut } from '@/lib/shortcuts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

export function ShortcutsHelp() {
  const open = useStore((s) => s.shortcutsHelpOpen);
  const setOpen = useStore((s) => s.setShortcutsHelpOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto bg-[#1a1a2e] border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Keyboard size={18} /> Klavye Kısayolları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {SHORTCUT_CATEGORIES.map((cat) => {
            const shorts = SHORTCUTS.filter((s) => s.category === cat.id);
            if (shorts.length === 0) return null;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: SHORTCUT_CATEGORIES.indexOf(cat) * 0.05 }}
              >
                <h3
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: cat.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: cat.color }}
                  />
                  {cat.label}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shorts.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-xs"
                    >
                      <span className="text-gray-300">{s.description}</span>
                      <kbd className="font-mono text-[10px] px-2 py-1 bg-black/40 border border-white/20 rounded text-white">
                        {formatShortcut(s.keys)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-[10px]">
            İpucu
          </Badge>
          Mac kullanıcıları için Ctrl = ⌘ (Cmd)
        </div>
      </DialogContent>
    </Dialog>
  );
}
