'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, Globe } from 'lucide-react';
import { LOCALES, getLocaleConfig, getStoredLocale, storeLocale, type Locale } from '@/lib/i18n';
import { toast } from 'sonner';

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'tr';
    return getStoredLocale();
  });

  // Apply dir/lang to document when locale changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const config = getLocaleConfig(locale);
    document.documentElement.dir = config.dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    storeLocale(newLocale);
    const config = getLocaleConfig(newLocale);
    toast.success(`Dil: ${config.nativeName}`);
    // Reload to apply translations
    setTimeout(() => window.location.reload(), 500);
  };

  const currentConfig = getLocaleConfig(locale);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          title="Dil değiştir"
        >
          <Globe size={12} />
          <span className="text-base leading-none">{currentConfig.flag}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 bg-[#1a1a2e] border-white/20" align="end">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">
            Dil Seç
          </div>
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                onClick={() => handleChange(l.code)}
                className={`w-full flex items-center gap-3 p-2 rounded text-left transition-colors ${
                  active ? 'bg-blue-500/20' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white flex items-center gap-1">
                    {l.nativeName}
                    {active && <Check size={10} className="text-blue-400" />}
                  </div>
                  <div className="text-[10px] text-gray-500">{l.name}</div>
                </div>
                {l.dir === 'rtl' && (
                  <span className="text-[9px] text-gray-500 uppercase">RTL</span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
