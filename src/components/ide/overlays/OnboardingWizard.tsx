'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Network,
  Code2,
  Bot,
  Shield,
  Plug,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Key,
  Cpu,
} from 'lucide-react';
import { DEEPSEEK_MODELS } from '@/lib/deepseek';
import { THEMES } from '@/lib/themes';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    id: 'welcome',
    title: 'DeepSeek App Studio\'ya Hoş Geldiniz',
    description: 'Kurumsal standartlarda AI kod üretim stüdyosu. 5 dakikalık tur ile başlayın.',
    icon: Rocket,
  },
  {
    id: 'apikey',
    title: 'DeepSeek API Key',
    description: 'AI özelliklerini kullanabilmek için API keyinizi Ayarlar\'dan girin.',
    icon: Key,
  },
  {
    id: 'models',
    title: '4 Model Arasından Seç',
    description: 'chat (hızlı), reasoner (derin), V4 Pro (premium), V4 Flash (ucuz).',
    icon: Cpu,
  },
  {
    id: 'agent-tree',
    title: 'Agent Tree Studio',
    description: 'Subagent hiyerarşisi kur, node\'ları bağla, neon Jarvis tarzı izle.',
    icon: Network,
  },
  {
    id: 'editor',
    title: 'Editör & Smart Chat',
    description: 'AI sorular sorar, diff önerir, cihaz çerçeveli önizleme.',
    icon: Code2,
  },
  {
    id: 'monitor',
    title: 'Mission Control',
    description: 'Sistemdeki tüm agent\'ları canlı izle — prompt\'larla birlikte.',
    icon: Bot,
  },
  {
    id: 'skills',
    title: 'Skiller & Güvenlik',
    description: '6 skill, 30 politika, 18 standart — kurumsal hazır.',
    icon: Shield,
  },
  {
    id: 'connectors',
    title: 'Connector\'lar & MCP',
    description: 'GitHub, Slack, Postgres bağla + 10 MCP server.',
    icon: Plug,
  },
];

export function OnboardingWizard() {
  const open = useStore((s) => s.onboardingOpen);
  const setOpen = useStore((s) => s.setOnboardingOpen);
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const setView = useStore((s) => s.setView);
  const setTheme = useStore((s) => s.setTheme);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // First-time check
    try {
      const done = localStorage.getItem('onboarding_complete');
      if (!done) {
        setTimeout(() => setOpen(true), 1500);
      }
    } catch {}
  }, [setOpen]);

  const handleComplete = () => {
    try {
      localStorage.setItem('onboarding_complete', '1');
    } catch {}
    setOnboardingComplete(true);
    setOpen(false);
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('onboarding_complete', '1');
    } catch {}
    setOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'settings':
        setView('settings');
        handleComplete();
        break;
      case 'agent-tree':
        setView('agent-tree');
        handleComplete();
        break;
      case 'editor':
        setView('editor');
        handleComplete();
        break;
      case 'monitor':
        setView('agent-monitor');
        handleComplete();
        break;
      case 'skills':
        setView('skills');
        handleComplete();
        break;
      case 'connectors':
        setView('connectors');
        handleComplete();
        break;
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              key={step}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Icon size={24} className="text-white" />
            </motion.div>
            <div>
              <Badge variant="outline" className="text-[10px] mb-1">
                Adım {step + 1} / {STEPS.length}
              </Badge>
              <DialogTitle className="text-xl">{current.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            <p className="text-sm text-gray-300 mb-4">{current.description}</p>

            {/* Step-specific content */}
            {current.id === 'apikey' && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleAction('settings')}
                >
                  <Key size={14} className="mr-2" /> Ayarlar\'a Git
                </Button>
                <p className="text-[10px] text-gray-500">
                  deepseek.com/platform/api_keys adresinden alın
                </p>
              </div>
            )}

            {current.id === 'models' && (
              <div className="grid grid-cols-2 gap-2">
                {DEEPSEEK_MODELS.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 bg-white/5 border border-white/10 rounded text-xs"
                  >
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {m.contextWindow / 1000}K ctx · ${m.inputPricePer1M}/1M
                    </div>
                  </div>
                ))}
              </div>
            )}

            {current.id === 'agent-tree' && (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => handleAction('agent-tree')}
              >
                <Network size={14} className="mr-2" /> Agent Tree Studio\'yu Aç
              </Button>
            )}

            {current.id === 'editor' && (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => handleAction('editor')}
              >
                <Code2 size={14} className="mr-2" /> Editörü Aç
              </Button>
            )}

            {current.id === 'monitor' && (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => handleAction('monitor')}
              >
                <Bot size={14} className="mr-2" /> Mission Control\'u Aç
              </Button>
            )}

            {current.id === 'skills' && (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => handleAction('skills')}
              >
                <Sparkles size={14} className="mr-2" /> Skilleri Keşfet
              </Button>
            )}

            {current.id === 'connectors' && (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => handleAction('connectors')}
              >
                <Plug size={14} className="mr-2" /> Connector\'ları Aç
              </Button>
            )}

            {current.id === 'welcome' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['18 view', '30 politika', '18 standart', '6 skill', '8 connector', '10 MCP server'].map((s) => (
                    <div key={s} className="p-2 bg-white/5 border border-white/10 rounded text-center">
                      <Check size={12} className="mx-auto text-green-400 mb-1" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-blue-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip} className="text-xs">
            Atla
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ArrowLeft size={12} className="mr-1" /> Önceki
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === STEPS.length - 1 ? (
                <>
                  <Check size={12} className="mr-1" /> Tamamla
                </>
              ) : (
                <>
                  Sonraki <ArrowRight size={12} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
