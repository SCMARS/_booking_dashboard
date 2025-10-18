'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-full rounded-lg border-0 shadow-lg px-4 py-2 bg-black/20 backdrop-blur-sm text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span className="ml-2">{currentLanguage?.name}</span>
          <svg className="-mr-1 ml-2 h-5 w-5 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-2xl bg-black/20 backdrop-blur-lg border-0 ring-1 ring-white/10 z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={`${
                  language === lang.code
                    ? 'bg-teal-500/30 text-teal-100'
                    : 'text-white hover:bg-black/20'
                } group flex items-center px-4 py-3 text-sm w-full text-left transition-all duration-200 rounded-lg mx-1`}
              >
                <span className="mr-3 text-lg">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
