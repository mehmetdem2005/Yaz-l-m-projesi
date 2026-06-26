/**
 * Mobil UI helpers — touch gestures, haptics, swipe
 *
 * - useSwipe: swipe gesture hook
 * - useLongPress: long press detection
 * - usePullToRefresh: pull-to-refresh pattern
 * - useHapticFeedback: vibration API
 * - useViewportSize: responsive breakpoint
 * - useSafeArea: iOS notch support
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeConfig {
  threshold?: number; // min px
  timeout?: number; // ms
  onSwipe?: (direction: SwipeDirection, distance: number) => void;
}

export function useSwipe(config: SwipeConfig = {}) {
  const { threshold = 50, timeout = 500, onSwipe } = config;
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;
      const dt = Date.now() - startRef.current.t;

      if (dt > timeout) {
        startRef.current = null;
        return;
      }

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < threshold && absDy < threshold) {
        startRef.current = null;
        return;
      }

      let direction: SwipeDirection;
      let distance: number;
      if (absDx > absDy) {
        direction = dx > 0 ? 'right' : 'left';
        distance = absDx;
      } else {
        direction = dy > 0 ? 'down' : 'up';
        distance = absDy;
      }

      onSwipe?.(direction, distance);
      startRef.current = null;
    },
    [threshold, timeout, onSwipe]
  );

  return { onTouchStart, onTouchEnd };
}

export function useLongPress(callback: () => void, delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onStart = useCallback(() => {
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);

  const onEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    onMouseDown: onStart,
    onMouseUp: onEnd,
    onMouseLeave: onEnd,
    onTouchStart: onStart,
    onTouchEnd: onEnd,
  };
}

export interface PullToRefreshConfig {
  threshold?: number;
  onRefresh: () => Promise<void>;
}

export function usePullToRefresh(config: PullToRefreshConfig) {
  const { threshold = 80, onRefresh } = config;
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) {
        setPullDistance(Math.min(dy * 0.5, threshold * 1.5));
      }
    },
    [threshold, isRefreshing]
  );

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    startYRef.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

export function useHapticFeedback() {
  const trigger = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }, []);

  return {
    light: () => trigger(10),
    medium: () => trigger(20),
    heavy: () => trigger(40),
    success: () => trigger([10, 30, 10]),
    error: () => trigger([50, 50, 50]),
    warning: () => trigger([30, 30]),
  };
}

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export function useViewportSize() {
  const [size, setSize] = useState<ViewportSize>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDimensions({ width: w, height: h });
      setOrientation(h > w ? 'portrait' : 'landscape');
      setSize(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return { size, orientation, dimensions, isMobile: size === 'mobile', isTablet: size === 'tablet', isDesktop: size === 'desktop' };
}

export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return insets;
}

// Voice input hook (Sprint 20 için)
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        final += event.results[i][0].transcript;
      }
      setTranscript(final);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript('');
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, start, stop };
}
