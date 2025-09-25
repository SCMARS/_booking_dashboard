"use client";

import { useLanguage, type SupportedLanguage } from '../contexts/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  type StatusReportAs = 'Booked' | 'Cancelled' | 'No-show' | 'Seated';
  type Settings = {
    profile: { name: string; address: string; timezone: string; phone: string; email: string; businessHoursWeekday: string; businessHoursWeekend: string };
    channels: { call: boolean; website: boolean; whatsapp: boolean; chat: boolean };
    statuses: { name: string; reportAs: StatusReportAs }[];
    booking: { maxGuests: number; slotLength: 30 | 60 | 90; minLeadTimeHours: 1 | 2 | 4 | 24; dedupStrategy: 'allow' | 'same_day' | 'seven_days'; antiOverbooking: boolean };
    notifications: { telegram: string; email: string; triggerNew: boolean; triggerCancel: boolean; triggerErrors: boolean; triggerDaily: boolean; templateNew: string; templateCancel: string };
    integrations: { n8nUrl: string; n8nSecret: string; icsUrl: string; csvSchedule: 'disabled' | 'hourly' | 'daily_06' | 'weekly_mon' };
    locale: { dateFormat: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'; timeFormat: '24' | '12'; currency: 'EUR' | 'USD' | 'RUB' | 'HRK' };
    calls: { greeting: string; voice: 'Female' | 'Male'; botLanguage: 'English (US)' | 'English (UK)' | 'Croatian' | 'Spanish' | 'Russian'; stt: 'OpenAI' | 'Google' | 'Whisper'; tts: 'ElevenLabs' | 'OpenAI' | 'Google'; maxDurationMinutes: 5 | 10 | 15; escalateOnFailure: boolean };
    security: { allowedIps: string[]; piiMask: boolean; retention: 30 | 90 | 180 | 365 };
  };

  const defaultSettings: Settings = useMemo(() => ({
    profile: { name: '', address: '', timezone: 'UTC', phone: '', email: '', businessHoursWeekday: '', businessHoursWeekend: '' },
    channels: { call: true, website: true, whatsapp: false, chat: true },
    statuses: [
      { name: 'Pending', reportAs: 'Booked' },
      { name: 'Confirmed', reportAs: 'Booked' },
      { name: 'Seated', reportAs: 'Seated' },
      { name: 'No-show', reportAs: 'No-show' },
      { name: 'Cancelled', reportAs: 'Cancelled' },
    ],
    booking: { maxGuests: 8, slotLength: 60, minLeadTimeHours: 2, dedupStrategy: 'same_day', antiOverbooking: true },
    notifications: { telegram: '', email: '', triggerNew: true, triggerCancel: true, triggerErrors: true, triggerDaily: false, templateNew: '', templateCancel: '' },
    integrations: { n8nUrl: '', n8nSecret: '', icsUrl: '', csvSchedule: 'disabled' },
    locale: { dateFormat: 'DD.MM.YYYY', timeFormat: '24', currency: 'EUR' },
    calls: { greeting: '', voice: 'Female', botLanguage: 'English (US)', stt: 'OpenAI', tts: 'ElevenLabs', maxDurationMinutes: 10, escalateOnFailure: false },
    security: { allowedIps: [], piiMask: true, retention: 90 },
  }), []);

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const canSave = !!user && !saving;

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
      } catch (e) {
        console.error('Failed to load settings', e);
        setSettings(defaultSettings);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user, defaultSettings]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, 'settings', user.uid);
      await setDoc(ref, settings, { merge: true });
    } catch (e) {
      console.error('Failed to save settings', e);
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
    } catch (e) {
      console.error('Failed to discard changes', e);
    }
  }

  const options: { code: SupportedLanguage; label: string; desc: string }[] = [
    { code: 'en', label: 'English', desc: 'Default language' },
    { code: 'ru', label: 'Русский', desc: 'Русский язык' },
    { code: 'hr', label: 'Hrvatski', desc: 'Hrvatski jezik' },
    { code: 'es', label: 'Español', desc: 'Idioma español' },
  ];

  return (
    <div className="max-w-5xl">
      <div className="sticky top-0 z-10 -mx-2 md:-mx-4 mb-4 md:mb-6 bg-gradient-to-b from-slate-50/80 to-transparent backdrop-blur px-2 md:px-4 pt-3">
        <div className="flex items-end justify-between">
          <div>
        <h1 className="text-2xl md:text-3xl font-heading font-semibold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Configure your restaurant, channels, bookings, and integrations</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={handleDiscard} disabled={!canSave} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50">Discard</button>
            <button onClick={handleSave} disabled={!canSave} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm shadow hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </div>

      {/* Restaurant Profile */}
      <div className="rounded-2xl overflow-hidden mb-6 border border-slate-200/60 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Restaurant Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Core information used for bookings and notifications</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input value={settings.profile.name} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, name: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="BrainMeal Restaurant" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Address</label>
            <input value={settings.profile.address} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, address: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="123 Main St, City" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time zone</label>
              <select value={settings.profile.timezone} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, timezone: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                <option value="Europe/Zagreb (GMT+1)">Europe/Zagreb (GMT+1)</option>
                <option value="Europe/Madrid (GMT+1)">Europe/Madrid (GMT+1)</option>
                <option value="Europe/Moscow (GMT+3)">Europe/Moscow (GMT+3)</option>
                <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact phone</label>
              <input value={settings.profile.phone} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, phone: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact e-mail</label>
              <input value={settings.profile.email} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="reservations@yourdomain.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Business hours</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={settings.profile.businessHoursWeekday} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, businessHoursWeekday: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Mon–Fri: 10:00–22:00" />
              <input value={settings.profile.businessHoursWeekend} onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, businessHoursWeekend: e.target.value } })} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Sat–Sun: 09:00–23:00" />
            </div>
          </div>
        </div>
      </div>

      {/* Channels & Statuses */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Channels & Statuses</h2>
          <p className="text-sm text-gray-500 mt-1">Enable channels and map custom statuses to reporting</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'Call', desc: 'Phone calls via AI agent' },
              { key: 'Website', desc: 'Online form on your site' },
              { key: 'WhatsApp', desc: 'WhatsApp chat channel' },
              { key: 'Chat', desc: 'Embedded chat widget' },
            ].map((ch) => (
              <div key={ch.key} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{ch.key}</div>
                  <div className="text-xs text-slate-500">{ch.desc}</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={
                      ch.key === 'Call' ? settings.channels.call :
                      ch.key === 'Website' ? settings.channels.website :
                      ch.key === 'WhatsApp' ? settings.channels.whatsapp :
                      settings.channels.chat
                    }
                    onChange={(e) => {
                      const v = e.target.checked;
                      if (ch.key === 'Call') setSettings({ ...settings, channels: { ...settings.channels, call: v } });
                      else if (ch.key === 'Website') setSettings({ ...settings, channels: { ...settings.channels, website: v } });
                      else if (ch.key === 'WhatsApp') setSettings({ ...settings, channels: { ...settings.channels, whatsapp: v } });
                      else setSettings({ ...settings, channels: { ...settings.channels, chat: v } });
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Custom statuses</label>
            <div className="space-y-2">
              {settings.statuses.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input className="border rounded-md px-3 py-2 text-sm" value={s.name} onChange={(e) => {
                    const arr = [...settings.statuses];
                    arr[idx] = { ...arr[idx], name: e.target.value };
                    setSettings({ ...settings, statuses: arr });
                  }} />
                  <select className="border rounded-md px-3 py-2 text-sm" value={s.reportAs} onChange={(e) => {
                    const arr = [...settings.statuses];
                    arr[idx] = { ...arr[idx], reportAs: e.target.value as StatusReportAs };
                    setSettings({ ...settings, statuses: arr });
                  }}>
                    <option value="Booked">Report as: Booked</option>
                    <option value="Cancelled">Report as: Cancelled</option>
                    <option value="No-show">Report as: No-show</option>
                    <option value="Seated">Report as: Seated</option>
                  </select>
                  <button onClick={() => setSettings({ ...settings, statuses: settings.statuses.filter((_, i) => i !== idx) })} className="text-sm px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">Remove</button>
                </div>
              ))}
              <button onClick={() => setSettings({ ...settings, statuses: [...settings.statuses, { name: '', reportAs: 'Booked' }] })} className="mt-2 text-sm px-3 py-2 rounded-md border border-dashed border-slate-300 hover:border-slate-400">Add status</button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Booking Rules</h2>
          <p className="text-sm text-gray-500 mt-1">Control availability, lead times, and overbooking protection</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max guests per booking</label>
              <input type="number" className="w-full border rounded-md px-3 py-2 text-sm" value={settings.booking.maxGuests} onChange={(e) => setSettings({ ...settings, booking: { ...settings.booking, maxGuests: Number(e.target.value) || 0 } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Time slot length</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.booking.slotLength} onChange={(e) => setSettings({ ...settings, booking: { ...settings.booking, slotLength: Number(e.target.value) as 30 | 60 | 90 } })}>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min lead time</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.booking.minLeadTimeHours} onChange={(e) => setSettings({ ...settings, booking: { ...settings.booking, minLeadTimeHours: Number(e.target.value) as 1 | 2 | 4 | 24 } })}>
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={24}>24 hours</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deduplicate by phone</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.booking.dedupStrategy} onChange={(e) => setSettings({ ...settings, booking: { ...settings.booking, dedupStrategy: e.target.value as Settings['booking']['dedupStrategy'] } })}>
                <option value="allow">Allow duplicates</option>
                <option value="same_day">Block same-day duplicates</option>
                <option value="seven_days">Block duplicates for 7 days</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Anti-overbooking</div>
                <div className="text-xs text-slate-500">Deny bookings exceeding available capacity for a time slot</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.booking.antiOverbooking} onChange={(e) => setSettings({ ...settings, booking: { ...settings.booking, antiOverbooking: e.target.checked } })} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-gray-500 mt-1">Connect n8n, calendars, and scheduled exports</p>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">n8n Webhook URL</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="https://n8n.yourdomain/webhook/xxxxx" value={settings.integrations.n8nUrl} onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, n8nUrl: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">n8n Secret</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="••••••••" value={settings.integrations.n8nSecret} onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, n8nSecret: e.target.value } })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Google Calendar</label>
              <button className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm shadow hover:bg-blue-700">Connect</button>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">ICS Feed URL</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="https://calendar.yourdomain/restaurant.ics" value={settings.integrations.icsUrl} onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, icsUrl: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CSV Export schedule</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.integrations.csvSchedule} onChange={(e) => setSettings({ ...settings, integrations: { ...settings.integrations, csvSchedule: e.target.value as Settings['integrations']['csvSchedule'] } })}>
                <option value="disabled">Disabled</option>
                <option value="hourly">Hourly</option>
                <option value="daily_06">Daily at 06:00</option>
                <option value="weekly_mon">Weekly on Monday</option>
              </select>
            </div>
          </div>
            </div>
          </div>

      {/* Calls / AI */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Calls / AI</h2>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Greeting message</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" placeholder="Hello, thank you for calling" value={settings.calls.greeting} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, greeting: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Voice</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" value={settings.calls.voice} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, voice: e.target.value as Settings['calls']['voice'] } })}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bot language</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" value={settings.calls.botLanguage} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, botLanguage: e.target.value as Settings['calls']['botLanguage'] } })}>
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Croatian">Croatian</option>
                <option value="Spanish">Spanish</option>
                <option value="Russian">Russian</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">STT provider</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.calls.stt} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, stt: e.target.value as Settings['calls']['stt'] } })}>
                <option value="OpenAI">OpenAI</option>
                <option value="Google">Google</option>
                <option value="Whisper">Whisper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">TTS provider</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.calls.tts} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, tts: e.target.value as Settings['calls']['tts'] } })}>
                <option value="ElevenLabs">ElevenLabs</option>
                <option value="OpenAI">OpenAI</option>
                <option value="Google">Google</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max call duration</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={settings.calls.maxDurationMinutes} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, maxDurationMinutes: Number(e.target.value) as 5 | 10 | 15 } })}>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Escalate to human on failure</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.calls.escalateOnFailure} onChange={(e) => setSettings({ ...settings, calls: { ...settings.calls, escalateOnFailure: e.target.checked } })} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:shadow after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        </div>
      </div>

      {/* Language / Locale */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
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
                  ? 'border-blue-500 bg-blue-50/70 shadow-inner'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base md:text-lg font-medium text-gray-900">{t(`settings.languages.${opt.code}.label`) as string}</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">{t(`settings.languages.${opt.code}.desc`) as string}</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    language === opt.code ? 'bg-blue-600 shadow' : 'bg-gray-300 group-hover:bg-gray-400'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6 bg-gradient-to-br from-white to-slate-50">
        <div className="p-5 md:p-6 border-b border-slate-200/60 bg-white/60 backdrop-blur">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">Where and when to deliver messages; customize templates</p>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telegram chat ID / channel</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="@your_channel or 123456789" value={settings.notifications.telegram} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, telegram: e.target.value } })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notification e-mail</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="alerts@yourdomain.com" value={settings.notifications.email} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, email: e.target.value } })} />
          </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={settings.notifications.triggerNew} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, triggerNew: e.target.checked } })} /><span>New booking</span></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={settings.notifications.triggerCancel} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, triggerCancel: e.target.checked } })} /><span>Cancellation</span></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={settings.notifications.triggerErrors} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, triggerErrors: e.target.checked } })} /><span>Errors & retries</span></label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-blue-600" checked={settings.notifications.triggerDaily} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, triggerDaily: e.target.checked } })} /><span>Daily summary</span></label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Message templates</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea className="min-h-[96px] border rounded-md px-3 py-2 text-sm" placeholder="New booking template: {{guest_name}}, {{date_time}}, {{party_size}}" value={settings.notifications.templateNew} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, templateNew: e.target.value } })} />
              <textarea className="min-h-[96px] border rounded-md px-3 py-2 text-sm" placeholder="Cancellation template: {{guest_name}}, {{date_time}}" value={settings.notifications.templateCancel} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, templateCancel: e.target.value } })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}