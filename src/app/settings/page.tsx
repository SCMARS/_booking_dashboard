"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage, type SupportedLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type ChannelKey = 'Call' | 'Website' | 'WhatsApp' | 'Chat';
type ChannelsState = { call: boolean; website: boolean; whatsapp: boolean; chat: boolean };

const CHANNEL_KEY_MAP: Record<ChannelKey, keyof ChannelsState> = {
  Call: 'call',
  Website: 'website',
  WhatsApp: 'whatsapp',
  Chat: 'chat',
};

const CHANNEL_DEFINITIONS: ChannelKey[] = ['Call', 'Website', 'WhatsApp', 'Chat'];

export default function SettingsPage() {
  type StatusReportAs = 'Booked' | 'Cancelled' | 'No-show' | 'Seated';
  type Settings = {
    profile: {
      name: string;
      address: string;
      timezone: string;
      phone: string;
      email: string;
      businessHoursWeekday: string;
      businessHoursWeekend: string;
    };
    channels: { call: boolean; website: boolean; whatsapp: boolean; chat: boolean };
    statuses: { name: string; reportAs: StatusReportAs }[];
    booking: {
      maxGuests: number;
      slotLength: 30 | 60 | 90;
      minLeadTimeHours: 1 | 2 | 4 | 24;
      dedupStrategy: 'allow' | 'same_day' | 'seven_days';
      antiOverbooking: boolean;
    };
    notifications: {
      telegram: string;
      email: string;
      triggerNew: boolean;
      triggerCancel: boolean;
      triggerErrors: boolean;
      triggerDaily: boolean;
      templateNew: string;
      templateCancel: string;
    };
    integrations: {
      n8nUrl: string;
      n8nSecret: string;
      icsUrl: string;
      csvSchedule: 'disabled' | 'hourly' | 'daily_06' | 'weekly_mon';
    };
    locale: { dateFormat: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'; timeFormat: '24' | '12'; currency: 'EUR' | 'USD' | 'RUB' | 'HRK' };
    calls: {
      greeting: string;
      voice: 'Female' | 'Male';
      botLanguage: 'English (US)' | 'English (UK)' | 'Croatian' | 'Spanish' | 'Russian';
      stt: 'OpenAI' | 'Google' | 'Whisper';
      tts: 'ElevenLabs' | 'OpenAI' | 'Google';
      maxDurationMinutes: 5 | 10 | 15;
      escalateOnFailure: boolean;
    };
    security: { allowedIps: string[]; piiMask: boolean; retention: 30 | 90 | 180 | 365 };
  };

  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const defaultSettings: Settings = useMemo(
    () => ({
      profile: {
        name: '',
        address: '',
        timezone: 'UTC',
        phone: '',
        email: '',
        businessHoursWeekday: '',
        businessHoursWeekend: '',
      },
      channels: { call: true, website: true, whatsapp: false, chat: true },
      statuses: [
        { name: 'Pending', reportAs: 'Booked' },
        { name: 'Confirmed', reportAs: 'Booked' },
        { name: 'Seated', reportAs: 'Seated' },
        { name: 'No-show', reportAs: 'No-show' },
        { name: 'Cancelled', reportAs: 'Cancelled' },
      ],
      booking: { maxGuests: 8, slotLength: 60, minLeadTimeHours: 2, dedupStrategy: 'same_day', antiOverbooking: true },
      notifications: {
        telegram: '',
        email: '',
        triggerNew: true,
        triggerCancel: true,
        triggerErrors: true,
        triggerDaily: false,
        templateNew: '',
        templateCancel: '',
      },
      integrations: { n8nUrl: '', n8nSecret: '', icsUrl: '', csvSchedule: 'disabled' },
      locale: { dateFormat: 'DD.MM.YYYY', timeFormat: '24', currency: 'EUR' },
      calls: {
        greeting: '',
        voice: 'Female',
        botLanguage: 'English (US)',
        stt: 'OpenAI',
        tts: 'ElevenLabs',
        maxDurationMinutes: 10,
        escalateOnFailure: false,
      },
      security: { allowedIps: [], piiMask: true, retention: 90 },
    }),
    []
  );

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canSave = !!user && !saving && !loading;
  const [channelPulse, setChannelPulse] = useState<Record<ChannelKey, boolean>>({
    Call: false,
    Website: false,
    WhatsApp: false,
    Chat: false,
  });
  const channelTimersRef = useRef<Partial<Record<ChannelKey, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const ref = doc(db, 'settings', user.uid);
        const snap = await getDoc(ref);
        if (!active) return;
        if (snap.exists()) {
          const data = snap.data() as Partial<Settings>;
          setSettings({ ...defaultSettings, ...data } as Settings);
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
        setSettings(defaultSettings);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user, defaultSettings]);

  useEffect(() => {
    return () => {
      Object.values(channelTimersRef.current).forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  const triggerChannelPulse = (key: ChannelKey) => {
    setChannelPulse((prev) => ({ ...prev, [key]: true }));
    const existing = channelTimersRef.current[key];
    if (existing) clearTimeout(existing);
    channelTimersRef.current[key] = setTimeout(() => {
      setChannelPulse((prev) => ({ ...prev, [key]: false }));
    }, 320);
  };

  const handleChannelToggle = (key: ChannelKey, value?: boolean) => {
    const prop = CHANNEL_KEY_MAP[key];
    const nextValue = typeof value === 'boolean' ? value : !settings.channels[prop];
    const nextChannels = { ...settings.channels, [prop]: nextValue } as Settings['channels'];
    setSettings({ ...settings, channels: nextChannels });
    triggerChannelPulse(key);
  };

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, 'settings', user.uid);
      await setDoc(ref, settings, { merge: true });
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscard() {
    if (!user) return;
    try {
      const ref = doc(db, 'settings', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Partial<Settings>;
        setSettings({ ...defaultSettings, ...data } as Settings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to discard changes', error);
    }
  }

  const options: { code: SupportedLanguage; label: string; desc: string }[] = [
    { code: 'en', label: 'English', desc: 'Default language' },
    { code: 'ru', label: 'Русский', desc: 'Русский язык' },
    { code: 'hr', label: 'Hrvatski', desc: 'Hrvatski jezik' },
    { code: 'es', label: 'Español', desc: 'Idioma español' },
  ];

  const SectionCard = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
    <section className="rounded-3xl border border-slate-200/60 bg-white/90 shadow-lg shadow-slate-200/40 backdrop-blur">
      <header className="border-b border-slate-200/60 px-5 py-4 md:px-6 md:py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </header>
      <div className="px-5 py-5 md:px-6 md:py-6">{children}</div>
    </section>
  );

  const activeChannels = Object.values(settings.channels).filter(Boolean).length;
const notificationTriggers = [
  settings.notifications.triggerNew,
  settings.notifications.triggerCancel,
  settings.notifications.triggerErrors,
  settings.notifications.triggerDaily,
].filter(Boolean).length;

  const reportOptions = useMemo(
    () => [
      { value: 'Booked' as StatusReportAs, label: t('settingsPage.channels.reportOptions.booked') },
      { value: 'Cancelled' as StatusReportAs, label: t('settingsPage.channels.reportOptions.cancelled') },
      { value: 'No-show' as StatusReportAs, label: t('settingsPage.channels.reportOptions.noShow') },
      { value: 'Seated' as StatusReportAs, label: t('settingsPage.channels.reportOptions.seated') },
    ],
    [t]
  );

  const summaryCards = [
    {
      label: t('settingsPage.summary.maxGuests.title'),
      value: settings.booking.maxGuests || 0,
      helper: t('settingsPage.summary.maxGuests.helper'),
    },
    {
      label: t('settingsPage.summary.activeChannels.title'),
      value: `${activeChannels} / 4`,
      helper: t('settingsPage.summary.activeChannels.helper'),
    },
    {
      label: t('settingsPage.summary.locale.title'),
      value: `${settings.locale.dateFormat} · ${settings.locale.timeFormat === '24' ? '24h' : '12h'}`,
      helper: settings.locale.currency || t('settingsPage.summary.locale.helper'),
    },
    {
      label: t('settingsPage.summary.automation.title'),
      value: notificationTriggers,
      helper: t('settingsPage.summary.automation.helper'),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-3xl bg-slate-200/60 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 rounded-3xl bg-slate-200/50 animate-pulse" />
          <div className="h-56 rounded-3xl bg-slate-200/50 animate-pulse" />
        </div>
        <div className="h-64 rounded-3xl bg-slate-200/50 animate-pulse" />
      </div>
    );
  }

  const mobileActions = (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3 md:hidden">
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-xl shadow-slate-400/20">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={!canSave}
          className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {t('settingsPage.hero.discard')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : t('settingsPage.hero.save')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_45%)]" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">
              {t('settingsPage.hero.badge')}
            </span>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                {settings.profile.name || t('settingsPage.hero.title')}
              </h1>
              <p className="mt-3 text-sm text-slate-200/80 md:text-base">
                {t('settingsPage.hero.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
                  <p className="text-[11px] uppercase tracking-wide text-slate-200/70">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                  <p className="text-[11px] text-slate-200/70">{card.helper}</p>
                </div>
              ))}
            </div>
          </div>
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!canSave}
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10 disabled:opacity-50"
              >
                {t('settingsPage.hero.discard')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/30 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:opacity-50"
              >
                {saving ? 'Saving…' : t('settingsPage.hero.save')}
              </button>
            </div>
        </div>
      </section>

      <div className="grid gap-6">
        <SectionCard title="Channels & statuses" description="Decide where the AI listens for guests and how custom statuses roll up to reports.">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {CHANNEL_DEFINITIONS.map((key) => {
                const prop = CHANNEL_KEY_MAP[key];
                const active = settings.channels[prop];
                const title = t(`settingsPage.channels.${key.toLowerCase()}.title`);
                const desc = t(`settingsPage.channels.${key.toLowerCase()}.description`);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChannelToggle(key)}
                    className={`group relative flex items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-300/60 ${
                      active
                        ? 'border-slate-900 bg-slate-900/90 text-white shadow-lg'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                    } ${channelPulse[key] ? 'scale-[1.01]' : 'scale-100'}`}
                    aria-pressed={active}
                  >
                    <span className="pointer-events-none">
                      <span className="text-sm font-semibold">{title}</span>
                      <span className={`mt-1 block text-xs ${active ? 'text-slate-200/80' : 'text-slate-500'}`}>{desc}</span>
                    </span>
                    <span
                      className={`inline-flex h-6 w-11 items-center rounded-full border transition-all duration-300 ${
                        active ? 'border-white/40 bg-white/30' : 'border-slate-200 bg-slate-200'
                      }`}
                    >
                      <span
                        className={`ml-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                          active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">{t('settingsPage.channels.customStatuses')}</label>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, statuses: [...settings.statuses, { name: '', reportAs: 'Booked' }] })}
                  className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  {t('settingsPage.channels.addStatus')}
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {settings.statuses.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_2fr_auto]">
                    <input
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      value={s.name}
                      onChange={(e) => {
                        const arr = [...settings.statuses];
                        arr[idx] = { ...arr[idx], name: e.target.value };
                        setSettings({ ...settings, statuses: arr });
                      }}
                      placeholder={t('settingsPage.channels.placeholder')}
                    />
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      value={s.reportAs}
                      onChange={(e) => {
                        const arr = [...settings.statuses];
                        arr[idx] = { ...arr[idx], reportAs: e.target.value as StatusReportAs };
                        setSettings({ ...settings, statuses: arr });
                      }}
                    >
                      {reportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {`${t('settingsPage.channels.reportAs')} ${option.label}`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, statuses: settings.statuses.filter((_, i) => i !== idx) })}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      {t('settingsPage.channels.remove')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('settingsPage.integrations.title')} description={t('settingsPage.integrations.description')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.integrations.n8nUrl')}</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="https://n8n.yourdomain/webhook/xxxxx"
                value={settings.integrations.n8nUrl}
                onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, n8nUrl: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.integrations.n8nSecret')}</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="••••••••"
                value={settings.integrations.n8nSecret}
                onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, n8nSecret: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.integrations.googleCalendar')}</label>
              <button
                type="button"
                className="mt-1 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                {t('settingsPage.integrations.connect')}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.integrations.ics')}</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                placeholder="https://calendar.yourdomain/restaurant.ics"
                value={settings.integrations.icsUrl}
                onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, icsUrl: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.integrations.csvSchedule')}</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                value={settings.integrations.csvSchedule}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    integrations: {
                      ...settings.integrations,
                      csvSchedule: e.target.value as Settings['integrations']['csvSchedule'],
                    },
                  })
                }
              >
                <option value="disabled">{t('settingsPage.integrations.csv.disabled')}</option>
                <option value="hourly">{t('settingsPage.integrations.csv.hourly')}</option>
                <option value="daily_06">{t('settingsPage.integrations.csv.daily_06')}</option>
                <option value="weekly_mon">{t('settingsPage.integrations.csv.weekly_mon')}</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('settingsPage.locale.title')} description={t('settingsPage.locale.description')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  const parts = (pathname || '/').split('/');
                  const currentLocale = parts[1];
                  if (['en', 'ru', 'hr', 'es'].includes(currentLocale)) {
                    parts[1] = opt.code;
                  } else {
                    parts.splice(1, 0, opt.code);
                  }
                  const newPath = parts.join('/') || '/';
                  router.push(newPath);
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-slate-300/60 ${
                  language === opt.code
                    ? 'border-slate-900 bg-slate-900/90 text-white shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">
                      {t(`settings.languages.${opt.code}.label`) as string}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t(`settings.languages.${opt.code}.desc`) as string}
                    </p>
                  </div>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      language === opt.code ? 'bg-white shadow' : 'bg-slate-300'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.locale.dateFormat')}</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                value={settings.locale.dateFormat}
                onChange={(e) => setSettings({ ...settings, locale: { ...settings.locale, dateFormat: e.target.value as Settings['locale']['dateFormat'] } })}
              >
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.locale.timeFormat')}</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                value={settings.locale.timeFormat}
                onChange={(e) => setSettings({ ...settings, locale: { ...settings.locale, timeFormat: e.target.value as '24' | '12' } })}
              >
                <option value="24">24h (13:00)</option>
                <option value="12">12h (1:00 PM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">{t('settingsPage.locale.currency')}</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                value={settings.locale.currency}
                onChange={(e) => setSettings({ ...settings, locale: { ...settings.locale, currency: e.target.value as Settings['locale']['currency'] } })}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="RUB">RUB</option>
                <option value="HRK">HRK</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t('settingsPage.notifications.title')} description={t('settingsPage.notifications.description')}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-600">{t('settingsPage.notifications.telegram')}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder={t('settingsPage.notifications.telegramPlaceholder')}
                  value={settings.notifications.telegram}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...settings.notifications, telegram: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">{t('settingsPage.notifications.email')}</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="alerts@yourdomain.com"
                  value={settings.notifications.email}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...settings.notifications, email: e.target.value } })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { key: 'triggerNew', label: t('settingsPage.notifications.triggers.new') },
                { key: 'triggerCancel', label: t('settingsPage.notifications.triggers.cancel') },
                { key: 'triggerErrors', label: t('settingsPage.notifications.triggers.errors') },
                { key: 'triggerDaily', label: t('settingsPage.notifications.triggers.daily') },
              ].map((item) => (
                <label key={item.key} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    checked={(settings.notifications as any)[item.key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, [item.key]: e.target.checked },
                      })
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-600">{t('settingsPage.notifications.templates.new')}</label>
                <textarea
                  className="mt-1 min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="{{guest_name}}, {{date_time}}, {{party_size}}"
                  value={settings.notifications.templateNew}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...settings.notifications, templateNew: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">{t('settingsPage.notifications.templates.cancel')}</label>
                <textarea
                  className="mt-1 min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                  placeholder="{{guest_name}}, {{date_time}}"
                  value={settings.notifications.templateCancel}
                  onChange={(e) =>
                    setSettings({ ...settings, notifications: { ...settings.notifications, templateCancel: e.target.value } })
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {mobileActions}
    </div>
  );
}
