'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLanguage = 'en' | 'ru' | 'hr' | 'es';

type TranslationNode = string | { [key: string]: TranslationNode };
type Dictionary = { [key: string]: TranslationNode };

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Lazy imports to keep bundle small
async function loadDictionary(lang: SupportedLanguage): Promise<Dictionary> {
  switch (lang) {
    case 'ru':
      return (await import('../i18n/ru')).default as unknown as Dictionary;
    case 'hr':
      return (await import('../i18n/hr')).default as unknown as Dictionary;
    case 'es':
      return (await import('../i18n/es')).default as unknown as Dictionary;
    case 'en':
    default:
      return (await import('../i18n/en')).default as unknown as Dictionary;
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [dict, setDict] = useState<Dictionary>({});


  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null;

    let cookieLang: string | null = null;
    if (typeof document !== 'undefined') {
      const matchLang = document.cookie.match(/(?:^|; )lang=([^;]+)/);
      const matchNext = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
      cookieLang = matchLang ? decodeURIComponent(matchLang[1]) : (matchNext ? decodeURIComponent(matchNext[1]) : null);
    }
    if (stored === 'en' || stored === 'ru' || stored === 'hr' || stored === 'es') {
      setLanguageState(stored);
      return;
    }
    if (cookieLang === 'en' || cookieLang === 'ru' || cookieLang === 'hr' || cookieLang === 'es') {
      setLanguageState(cookieLang as SupportedLanguage);
      return;
    }
    const navLang = navigator?.language?.toLowerCase() || 'en';
    const initial: SupportedLanguage = navLang.startsWith('ru')
      ? 'ru'
      : navLang.startsWith('hr')
      ? 'hr'
      : navLang.startsWith('es')
      ? 'es'
      : 'en';
    setLanguageState(initial);
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadDictionary(language).then((d) => {
      if (isMounted) setDict(d);
    });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', lang);
      // sync cookies for middleware/Vercel
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `lang=${lang}; Path=/; SameSite=Lax; Expires=${expires}`;
      document.cookie = `NEXT_LOCALE=${lang}; Path=/; SameSite=Lax; Expires=${expires}`;
    }
  };

  const t = useMemo(() => {
    return (key: string): string => {
      const parts = key.split('.');
      let current: any = dict;
      for (const part of parts) {
        current = current?.[part];
        if (current == null) return key;
      }
      return typeof current === 'string' ? current : key;
    };
  }, [dict]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}


