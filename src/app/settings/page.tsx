"use client";

import { useLanguage, type SupportedLanguage } from '../contexts/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const options: { code: SupportedLanguage; label: string; desc: string }[] = [
    { code: 'en', label: 'English', desc: 'Default language' },
    { code: 'ru', label: 'Русский', desc: 'Русский язык' },
    { code: 'hr', label: 'Hrvatski', desc: 'Hrvatski jezik' },
    { code: 'es', label: 'Español', desc: 'Idioma español' },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-heading mb-6">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Language</h2>
          <p className="text-sm text-gray-500 mt-1">Choose interface language</p>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLanguage(opt.code);
                const parts = (pathname || '/').split('/');
                const currentLocale = parts[1];
                if (['en','ru','hr','es'].includes(currentLocale)) {
                  parts[1] = opt.code;
                } else {
                  parts.splice(1, 0, opt.code);
                }
                const newPath = parts.join('/') || '/';
                router.push(newPath);
              }}
              className={`group text-left rounded-xl border transition-all duration-200 p-4 md:p-5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                language === opt.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base md:text-lg font-medium text-gray-900">{opt.label}</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">{opt.desc}</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    language === opt.code ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-gray-400'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}