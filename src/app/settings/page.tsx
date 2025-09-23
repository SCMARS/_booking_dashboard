"use client";

import { useLanguage, type SupportedLanguage } from '../contexts/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
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

      {/* Agent profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('settings.agent.title') as string}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.agent.subtitle') as string}</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('settings.agent.name') as string}</label>
            <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="BrainMeal Bot" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('settings.agent.voice') as string}</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('settings.agent.lang') as string}</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Croatian</option>
                <option>Spanish</option>
                <option>Russian</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('settings.agent.active') as string}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('settings.languageTitle') as string}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.chooseInterface') as string}</p>
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
                  <div className="text-base md:text-lg font-medium text-gray-900">{t(`settings.languages.${opt.code}.label`) as string}</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">{t(`settings.languages.${opt.code}.desc`) as string}</div>
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

      {/* Integrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('settings.integrations.title') as string}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.integrations.subtitle') as string}</p>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">{t('settings.integrations.sheets') as string}</div>
            <button className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">{t('settings.integrations.customize') as string}</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">{t('settings.integrations.twilio') as string}</div>
            <button className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">{t('settings.integrations.connect') as string}</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">{t('settings.integrations.crm') as string}</div>
            <button className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">{t('settings.integrations.integrate') as string}</button>
          </div>
        </div>
      </div>

      {/* Call behavior */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('settings.call.title') as string}</h2>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('settings.call.greeting') as string}</label>
            <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Hello, thank you for calling" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t('settings.call.maxDuration') as string}</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm">
                <option>Ask to repeat</option>
                <option>Hold for 30 sec</option>
                <option>Hold for 60 sec</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">{t('settings.call.minutes') as string}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('settings.call.forwardHuman') as string}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{t('settings.notifications.title') as string}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.notifications.subtitle') as string}</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /><span>{t('settings.notifications.newBookings') as string}</span></label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /><span>{t('settings.notifications.callErrors') as string}</span></label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" defaultChecked /><span>{t('settings.notifications.daily') as string}</span></label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" /><span>{t('settings.notifications.weekly') as string}</span></label>
        </div>
      </div>
    </div>
  );
}