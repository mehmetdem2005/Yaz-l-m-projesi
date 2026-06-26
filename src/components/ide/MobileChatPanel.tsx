'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Eye, GitCompare, Send, Loader2, X, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/lib/mobile-ui';
import { VoiceInputButton } from './VoiceInputButton';
import { useState, useEffect } from 'react';

interface MobileChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileChatPanel({ open, onOpenChange }: MobileChatPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm md:hidden"
      />
      {/* Bottom sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onOpenChange(false);
        }}
        className="fixed bottom-0 left-0 right-0 z-[210] h-[85vh] bg-[#1a1a2e] border-t border-white/10 rounded-t-2xl flex flex-col md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 rounded-full bg-gray-600" />
            </div>

            {/* Header */}
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <Bot size={18} className="text-blue-400" />
                AI Asistan
              </h2>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                <X size={16} />
              </Button>
            </div>

            <MobileChatContent />
      </motion.div>
    </>
  );
}

function MobileChatContent() {
  const chatMessages = useStore((s) => s.chatMessages);
  const chatInput = useStore((s) => s.chatInput);
  const setChatInput = useStore((s) => s.setChatInput);
  const files = useStore((s) => s.files);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'diff'>('chat');
  const haptic = useHapticFeedback();

  const handleVoice = (text: string) => {
    setChatInput(text);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    haptic.success();
    window.dispatchEvent(new CustomEvent('ide:send-chat'));
  };

  const previewHtml =
    files.find((f) => f.path === 'index.html')?.content ||
    '<!DOCTYPE html><html><body style="background:#1e1e1e;color:#888;padding:2rem;font-family:sans-serif"><h1>Önizleme için index.html gerekli</h1></body></html>';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-white/10">
        {[
          { id: 'chat', label: 'Sohbet', icon: MessageSquare },
          { id: 'preview', label: 'Önizleme', icon: Eye },
          { id: 'diff', label: 'Diff', icon: GitCompare },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); haptic.light(); }}
              className={`flex items-center justify-center gap-1 py-2 text-xs border-r border-white/10 last:border-r-0 ${
                active ? 'bg-white/5 text-white' : 'text-gray-500'
              }`}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-auto p-3 space-y-2 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="mb-3">AI ile sohbet edin</p>
                  <div className="space-y-1 text-xs text-left max-w-[280px] mx-auto">
                    <div className="p-2 bg-white/5 rounded">💡 "SaaS dashboard tasarla"</div>
                    <div className="p-2 bg-white/5 rounded">💡 "TOGAF mimari planla"</div>
                    <div className="p-2 bg-white/5 rounded">💡 "ISO 27001 audit yap"</div>
                  </div>
                </div>
              ) : (
                chatMessages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block max-w-[85%] px-3 py-2 rounded-2xl ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : m.error
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-[#2d2d2d] text-foreground rounded-bl-md'
                      }`}
                    >
                      <div className="text-[10px] opacity-70 mb-1 flex items-center gap-1">
                        {m.role === 'user' ? '👤 Sen' : `🤖 ${m.modelUsed || 'AI'}`}
                        {m.pending && <Loader2 size={10} className="animate-spin" />}
                      </div>
                      <div className="whitespace-pre-wrap break-words text-xs">{m.content || (m.pending ? '...' : '')}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="AI'a yazın..."
                    rows={1}
                    className="bg-[#2d2d2d] border-white/10 text-white text-xs resize-none max-h-24 pr-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="absolute right-1 bottom-1">
                    <VoiceInputButton onTranscript={handleVoice} size="sm" />
                  </div>
                </div>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'preview' && (
          <div className="h-full bg-[#0a0a0a] overflow-auto flex items-start justify-center p-3">
            <iframe
              srcDoc={previewHtml}
              className="bg-white rounded-lg shadow-xl w-full h-full max-w-[400px]"
              sandbox="allow-scripts allow-same-origin"
              title="mobile preview"
            />
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="flex-1 overflow-auto p-3 text-center text-sm text-muted-foreground">
            <GitCompare size={32} className="mx-auto mb-2 opacity-30" />
            Diff burada görünecek
          </div>
        )}
      </div>
    </div>
  );
}
