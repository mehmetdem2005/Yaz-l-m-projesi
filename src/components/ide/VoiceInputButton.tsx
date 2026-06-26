'use client';

import { useStore } from '@/lib/store';
import { useVoiceInput } from '@/lib/mobile-ui';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceInputButton({ onTranscript, className, size = 'sm' }: VoiceInputButtonProps) {
  const { isListening, transcript, start, stop } = useVoiceInput();
  const [supported, setSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return Boolean(SpeechRecognition);
  });

  // Transcript değişince parent'a yolla
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleClick = () => {
    if (!supported) {
      toast.error('Tarayıcınız sesli giriş desteklemiyor. Chrome kullanın.');
      return;
    }
    if (isListening) {
      stop();
    } else {
      start();
      toast.info('Dinleniyor... Türkçe konuşun');
    }
  };

  const iconSize = size === 'lg' ? 24 : size === 'md' ? 18 : 14;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!supported}
        className={`p-2 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
        title={isListening ? 'Durdur' : 'Sesli giriş'}
        aria-label={isListening ? 'Dinlemeyi durdur' : 'Sesli giriş başlat'}
      >
        {isListening ? <Square size={iconSize} /> : <Mic size={iconSize} />}
      </button>

      {/* Live transcript popup */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-0 right-0 min-w-[200px] bg-[#1a1a2e] border border-white/20 rounded-lg p-2 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <Loader2 size={10} className="animate-spin text-red-400" />
              <span className="text-[10px] text-gray-400">Dinleniyor...</span>
            </div>
            <p className="text-xs text-white">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
