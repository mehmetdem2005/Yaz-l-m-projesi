'use client';

import { useStore } from '@/lib/store';
import {
  Home,
  Code2,
  Network,
  Bot,
  Plus,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/lib/mobile-ui';

interface NavItem {
  id: any;
  icon: LucideIcon;
  label: string;
  action?: () => void;
}

const BOTTOM_NAV: NavItem[] = [
  { id: 'dashboard', icon: Home, label: 'Ana' },
  { id: 'editor', icon: Code2, label: 'Editör' },
  { id: 'agent-tree', icon: Network, label: 'Agent' },
  { id: 'agent-monitor', icon: Bot, label: 'İzle' },
];

export function MobileBottomNav() {
  const activeView = useStore((s) => s.activeView);
  const setView = useStore((s) => s.setView);
  const setMobileNavOpen = useStore((s) => s.setMobileNavOpen);
  const setCommandPaletteOpen = useStore((s) => s.setCommandPaletteOpen);
  const setMobileChatOpen = useStore((s) => s.setMobileChatOpen);
  const haptic = useHapticFeedback();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a2e]/95 backdrop-blur-lg border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { haptic.light(); setView(item.id); }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors flex-1',
                active ? 'text-blue-400' : 'text-gray-500'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Center FAB */}
        <button
          onClick={() => { haptic.medium(); setCommandPaletteOpen(true); }}
          className="flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 flex-shrink-0 active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Chat shortcut (mobile-only) */}
        <button
          onClick={() => {
            console.log('Sohbet clicked, opening chat');
            haptic.medium();
            setMobileChatOpen(true);
            window.dispatchEvent(new CustomEvent('ide:open-mobile-chat'));
          }}
          className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors flex-1 text-gray-500 hover:text-white"
        >
          <MessageSquare size={20} strokeWidth={1.5} />
          <span className="text-[10px]">Sohbet</span>
        </button>

        {BOTTOM_NAV.slice(2).map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { haptic.light(); setView(item.id); }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors flex-1',
                active ? 'text-blue-400' : 'text-gray-500'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
