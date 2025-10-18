'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, orderBy, query, limit, getCountFromServer, where, Timestamp, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import CallsList from './CallsList';

interface BookingData {
  id?: string;
  name: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'cancelled';
  channel: string;
}
interface LogData {
  text: string;
  intent: string;
  channel?: string;
}


const Dashboard: React.FC = () => {
  const router = useRouter();
  const [recentBookings, setRecentBookings] = useState<BookingData[]>([]);
  const { language, t } = useLanguage();
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [callConversion, setCallConversion] = useState<number | null>(null);
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('30d');
  const [funnel, setFunnel] = useState<{ calls: number; intents: number; bookings: number }>({ calls: 0, intents: 0, bookings: 0 });
  const [channelStats, setChannelStats] = useState<Array<{ channel: string; calls: number; bookings: number; conversion: number }>>([]);
  const [kpi, setKpi] = useState<{ confirmed: number; cancelled: number; ahtSec: number | null }>(() => ({ confirmed: 0, cancelled: 0, ahtSec: null }));
  const [missedFailed, setMissedFailed] = useState<{ missed: number; errors: number }>({ missed: 0, errors: 0 });
  const [repeatPct, setRepeatPct] = useState<number>(0);
  const [heatmap, setHeatmap] = useState<number[][]>(() => Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)));
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newChannel, setNewChannel] = useState<string>('Website');
  const [newStatus, setNewStatus] = useState<'Confirmed' | 'Pending' | 'cancelled'>('Confirmed');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<null | { type: 'confirm' | 'cancel' | 'reschedule' | 'notify'; bookingId?: string; name?: string; currentDate?: string }>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [notifyText, setNotifyText] = useState<string>('');
  const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([]);
  const [recentLogsLeft, setRecentLogsLeft] = useState<LogData[]>([]);
  const [recentLogsRight, setRecentLogsRight] = useState<LogData[]>([]);

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  useEffect(() => {
    // Обновлено для использования реальных данных из Vapi
    const q = query(
      collection(db, 'logs'), 
      where('type', '==', 'call_summary'),
      where('endedReason', '==', 'customer-ended-call'),
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows: BookingData[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: `Call ${data.callId?.substring(0, 8)}...` || 'Unknown Call',
          date: data.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: 'Confirmed' as const,
          channel: 'Call' as const,
          createdAt: data.createdAt
        };
      });
      setRecentBookings(rows);
    });

    return () => unsub(); 
  }, []);


  useEffect(() => {
    let isActive = true;
    async function loadCounts() {
      try {
        const bookingsCol = collection(db, 'bookings');
        const logsCol = collection(db, 'logs');
        const now = new Date();
        const start = period === 'today'
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
          : period === '7d'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const since = Timestamp.fromDate(start);
 
        // Обновлено для использования реальных данных из Vapi
        const [totalSnap, confirmedSnap, pendingSnap] = await Promise.all([
          // Общее количество бронирований из завершенных звонков
          getCountFromServer(query(logsCol, where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'))),
          // Подтвержденные бронирования (звонки с успешным исходом)
          getCountFromServer(query(logsCol, where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'), where('status', '==', 'ended'))),
          // Ожидающие бронирования (звонки в процессе)
          getCountFromServer(query(logsCol, where('type', '==', 'call_event'), where('status', '==', 'call_started'))),
        ]);
 
        if (!isActive) return;
        setTotalBookings(totalSnap.data().count || 0);
        setConfirmedCount(confirmedSnap.data().count || 0);
        setPendingCount(pendingSnap.data().count || 0);
        try {
          // Обновлено для использования реальных данных Vapi
          const [successfulCallsSnap, totalCallsSnap] = await Promise.all([
            // Успешные звонки (завершенные клиентом)
            getCountFromServer(query(logsCol, where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'), where('createdAt', '>=', since))),
            // Все звонки (call_event + call_summary)
            getCountFromServer(query(logsCol, where('type', 'in', ['call_event', 'call_summary']), where('createdAt', '>=', since))),
          ]);
          if (!isActive) return;
          const successfulCalls = successfulCallsSnap.data().count || 0;
          const totalCalls = totalCallsSnap.data().count || 0;
          const pct = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 1000) / 10 : 0;
          setCallConversion(pct);
        } catch {
          if (!isActive) return;
          setCallConversion(null);
        }
 
        // Use count API for funnel numbers - обновлено для реальных данных Vapi
        const [callsCount, intentsCount, bookingsCount] = await Promise.all([
          // Звонки из Vapi (call_event и call_summary)
          getCountFromServer(query(logsCol, where('type', '==', 'call_event'), where('createdAt', '>=', since))),
          // Намерения из транскриптов (intent_detected или booking-related messages)
          getCountFromServer(query(logsCol, where('status', '==', 'intent_detected'), where('createdAt', '>=', since))),
          // Бронирования из завершенных звонков с успешным исходом
          getCountFromServer(query(logsCol, where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'), where('createdAt', '>=', since))),
        ]);
        if (!isActive) return;
        const calls = callsCount.data().count || 0;

        // Обновлено для использования реальных данных Vapi
        const channels = ['Call']; // Пока только Call канал из Vapi
        const channelPromises = channels.map((ch) => Promise.all([
          // Все звонки в канале Call
          getCountFromServer(query(logsCol, where('channel', '==', ch), where('createdAt', '>=', since))),
          // Успешные звонки в канале Call
          getCountFromServer(query(logsCol, where('channel', '==', ch), where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'), where('createdAt', '>=', since))),
        ]));
        const channelSnaps = await Promise.all(channelPromises);
        if (!isActive) return;
        setChannelStats(channelSnaps.map(([cSnap, bSnap], idx) => {
          const callsV = cSnap.data().count || 0;
          const booksV = bSnap.data().count || 0;
          const conv = callsV > 0 ? Math.round((booksV / callsV) * 1000) / 10 : 0;
          return { channel: channels[idx], calls: callsV, bookings: booksV, conversion: conv };
        }));
 

        const logsForDetails = await getDocs(query(logsCol, where('createdAt', '>=', since), orderBy('createdAt', 'desc'), limit(2000)));
        if (!isActive) return;
        const durations = logsForDetails.docs
          .map((d) => {
            const data: any = d.data();
            if (typeof data?.durationSec === 'number') return data.durationSec;
            if (typeof data?.durationMs === 'number') return Math.round(data.durationMs / 1000);
            return null;
          })
          .filter((v) => typeof v === 'number') as number[];
        const ahtSec = durations.length
          ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length))
          : null;
        const missedStatuses = new Set(['missed', 'no_answer', 'failed']);
        const missed = logsForDetails.docs.filter((d) => missedStatuses.has(((d.data() as any)?.status || '').toLowerCase())).length;
        const errors = logsForDetails.docs.filter((d) => Array.isArray((d.data() as any)?.errors) && (d.data() as any).errors.length > 0).length;
        setKpi((prev) => ({ confirmed: prev.confirmed, cancelled: prev.cancelled, ahtSec }));
        setMissedFailed({ missed, errors });
 
        const numbers = logsForDetails.docs.map((d) => ((d.data() as any)?.clientNumber || '').trim()).filter(Boolean);
        const freq = new Map<string, number>();
        for (const n of numbers) freq.set(n, (freq.get(n) || 0) + 1);
        const repeatCalls = numbers.filter((n) => (freq.get(n) || 0) > 1).length;
        const repeatPctCalc = calls > 0 ? Math.round((repeatCalls / calls) * 1000) / 10 : 0;
        setRepeatPct(repeatPctCalc);
 
        const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
        for (const docu of logsForDetails.docs) {
          const data: any = docu.data();
          let dt: Date | null = null;
          if (data?.createdAt?.toDate) dt = data.createdAt.toDate();
          else if (data?.timestamp) {
            const t = Date.parse(data.timestamp);
            dt = isNaN(t) ? null : new Date(t);
          }
          if (!dt) continue;
          const dow = dt.getDay();
          const hour = dt.getHours();
          grid[dow][hour] = (grid[dow][hour] || 0) + 1;
        }
        setHeatmap(grid);
 
      } catch (e) {
      }
    }
    loadCounts();
    return () => {
      isActive = false;
    };
  }, [period]);

  // Загрузка реальных логов из Vapi
  useEffect(() => {
    const loadRecentLogs = async () => {
      try {
        const response = await fetch('/api/logs?type=call_summary&limit=10');
        const data = await response.json();
        
        if (data.success && data.logs) {
          // Фильтруем звонки с транскриптами
          const callsWithTranscripts = data.logs.filter((log: any) => log.transcript);
          
          // Создаем логи для левой колонки (только текст и намерение)
          const leftLogs = callsWithTranscripts.slice(0, 5).map((log: any) => ({
            text: log.transcript?.substring(0, 50) + '...' || 'No transcript',
            intent: log.endedReason === 'customer-ended-call' ? 'booking' : 'other'
          }));
          
          // Создаем логи для правой колонки (текст, намерение, канал)
          const rightLogs = callsWithTranscripts.slice(0, 5).map((log: any) => ({
            text: log.transcript?.substring(0, 30) + '...' || 'No transcript',
            intent: log.endedReason === 'customer-ended-call' ? 'booking' : 'other',
            channel: 'Call'
          }));
          
          setRecentLogsLeft(leftLogs);
          setRecentLogsRight(rightLogs);
        }
      } catch (error) {
        console.error('Error loading recent logs:', error);
        // Fallback к пустым массивам
        setRecentLogsLeft([]);
        setRecentLogsRight([]);
      }
    };
    
    loadRecentLogs();
  }, []);

  const handleViewAllBookings = () => {
    router.push(`/${language}/bookings`);
  };

  const handleViewAllLogs = () => {
    router.push(`/${language}/logs`);
  };

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  const funnelMax = Math.max(funnel.calls, funnel.intents, funnel.bookings, 1);
  const channelMax = channelStats.reduce((max, item) => Math.max(max, item.calls || 0), 0) || 1;
  const funnelItems = [
    { label: t('dashboard.funnel.calls'), value: funnel.calls, color: 'bg-teal-400' },
    { label: t('dashboard.funnel.intents'), value: funnel.intents, color: 'bg-sky-400' },
    { label: t('dashboard.funnel.bookings'), value: funnel.bookings, color: 'bg-purple-400' }
  ];
  const metricCards = [
    {
      title: t('dashboard.metrics.aht.title'),
      value: kpi.ahtSec != null ? `${kpi.ahtSec}s` : '—',
      helper: t('dashboard.metrics.helper')
    },
    {
      title: t('dashboard.metrics.confirmation.title'),
      value: `${kpi.confirmed} / ${kpi.cancelled}`,
      helper: t('dashboard.metrics.helper')
    },
    {
      title: t('dashboard.metrics.noShow.title'),
      value: '—',
      helper: t('dashboard.metrics.noShow.helper')
    }
  ];
  const opsSummary = [
    { title: t('dashboard.metrics.missed.title'), value: missedFailed.missed, color: 'bg-orange-400/80' },
    { title: t('dashboard.metrics.errors.title'), value: missedFailed.errors, color: 'bg-rose-500/80' },
    { title: t('dashboard.metrics.duplicates.title'), value: `${repeatPct}%`, color: 'bg-purple-500/80' }
  ];
  const quickActionsList = [
    { label: t('booking.status.confirm'), handler: () => setActionModal({ type: 'confirm' }) },
    { label: t('booking.status.cancel'), handler: () => setActionModal({ type: 'cancel' }) },
    { label: t('booking.status.reschedule'), handler: () => setActionModal({ type: 'reschedule' }) },
    { label: t('booking.status.notify'), handler: () => setActionModal({ type: 'notify' }) }
  ];
  const periodLabel =
    period === 'today'
      ? t('dashboard.period.today')
      : period === '7d'
      ? t('dashboard.period.last7')
      : t('dashboard.period.last30');

  return (
    <div className="space-y-10 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-6 py-8 shadow-2xl sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{t('dashboard.title')}</h1>
              <p className="text-sm text-slate-300 sm:text-base">{t('dashboard.stats.subtitle')}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 text-xs font-medium text-slate-100 shadow-inner">
              {(['today', '7d', '30d'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`rounded-full px-4 py-1.5 text-xs sm:text-sm transition ${
                    period === key ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {key === 'today' ? t('dashboard.period.today') : key === '7d' ? t('dashboard.period.last7') : t('dashboard.period.last30')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={handleViewAllBookings}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg transition hover:border-teal-400/60 hover:shadow-teal-500/20"
            >
              <div className="text-xs uppercase tracking-wider text-slate-300">{t('dashboard.cards.bookings.title')}</div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-semibold text-white sm:text-4xl">{totalBookings}</span>
                <span className="text-xs text-teal-200 opacity-0 transition group-hover:opacity-100">{t('dashboard.cards.bookings.cta')}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">{periodLabel}</div>
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-slate-300">{t('dashboard.cards.status.title')}</div>
              <div className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {confirmedCount} / {pendingCount}
              </div>
              <div className="mt-1 text-xs text-slate-400">{t('dashboard.cards.status.helper')}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-slate-300">{t('dashboard.cards.conversion.title')}</div>
              <div className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{callConversion == null ? '—' : `${callConversion}%`}</div>
              <div className="mt-1 text-xs text-slate-400">{t('dashboard.cards.conversion.helper')}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
              <div className="text-xs uppercase tracking-wider text-slate-300">{t('dashboard.metrics.aht.title')}</div>
              <div className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{kpi.ahtSec != null ? `${kpi.ahtSec}s` : '—'}</div>
              <div className="mt-1 text-xs text-slate-400">{t('dashboard.metrics.helper')}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
            >
              {t('dashboard.quickActions.newBooking')}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleViewAllBookings}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/40"
            >
              {t('dashboard.recentBookings.viewAll')}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.funnel.title')}</h2>
            <span className="text-xs text-slate-300">{periodLabel}</span>
          </div>
          <div className="mt-6 space-y-4">
            {funnelItems.map((item) => {
              const width = funnelMax ? Math.round((item.value / funnelMax) * 100) : 0;
              const displayWidth = item.value > 0 ? Math.max(width, 8) : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${displayWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.metrics.helper')}</h2>
            <span className="text-xs text-slate-300">{periodLabel}</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {metricCards.map((metric) => (
              <div key={metric.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-wider text-slate-300">{metric.title}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{metric.value}</div>
                <div className="mt-1 text-xs text-slate-400">{metric.helper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.channels.title')}</h2>
            <span className="text-xs text-slate-300">{periodLabel}</span>
          </div>
          <div className="mt-6 space-y-5">
            {channelStats.length ? (
              channelStats.map((row) => {
                const width = channelMax ? Math.round((row.calls / channelMax) * 100) : 0;
                const displayWidth = row.calls > 0 ? Math.max(width, 8) : 0;
                return (
                  <div key={row.channel} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <span className="font-semibold text-white">{row.channel}</span>
                      <span className="text-xs text-slate-300">
                        {row.calls} {t('dashboard.channels.headers.calls')}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${displayWidth}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>
                        {t('dashboard.channels.headers.bookings')}: <span className="text-white font-semibold">{row.bookings}</span>
                      </span>
                      <span>
                        {t('dashboard.channels.headers.conversion')}: <span className="text-white font-semibold">{row.conversion}%</span>
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                {t('dashboard.noData')}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t('dashboard.quickActions.newBooking')}</h2>
              <span className="text-xs text-slate-300">{periodLabel}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowNewModal(true)}
                className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
              >
                {t('dashboard.quickActions.newBooking')}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActionsList.map((action) => (
                <button
                  key={action.label}
                  onClick={action.handler}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-slate-100 transition hover:bg-white/20"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.metrics.duplicates.title')}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {opsSummary.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.title}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.heatmap.title')}</h2>
          <span className="text-xs text-slate-300">{periodLabel}</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <div className="grid grid-cols-25 gap-1" style={{ gridTemplateColumns: 'repeat(25, minmax(0,1fr))' }}>
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-center text-[10px] text-slate-400">
                {h}
              </div>
            ))}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, dow) => (
              <React.Fragment key={d}>
                <div className="pr-1 text-right text-[10px] text-slate-400">{d}</div>
                {Array.from({ length: 24 }).map((_, h) => {
                  const val = heatmap[dow]?.[h] || 0;
                  const intensity =
                    val === 0 ? 'bg-white/5' : val < 3 ? 'bg-emerald-200/60' : val < 6 ? 'bg-emerald-300/80' : 'bg-emerald-400';
                  return (
                    <div
                      key={h}
                      className={`h-4 rounded ${intensity}`}
                      title={`${d} ${h}:00 — ${val}`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.recentBookings.title')}</h2>
          <button
            onClick={handleViewAllBookings}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/30"
          >
            {t('dashboard.recentBookings.viewAll')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="md:hidden">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={booking.id || index} className="border-b border-white/5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white">{booking.name}</div>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : booking.status === 'Pending'
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-rose-400/20 text-rose-200'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <div>{booking.date}</div>
                    <div>{booking.channel}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">{t('dashboard.recentBookings.empty')}</div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">{t('dashboard.table.name')}</th>
                  <th className="px-4 py-3">{t('dashboard.table.date')}</th>
                  <th className="px-4 py-3">{t('dashboard.table.status')}</th>
                  <th className="px-4 py-3">{t('dashboard.table.channel')}</th>
                  <th className="px-4 py-3">{t('dashboard.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <tr key={booking.id || index} className="transition hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">{booking.name}</td>
                      <td className="px-4 py-3 text-slate-300">{booking.date}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                            booking.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/30'
                              : booking.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-200 ring-amber-400/30'
                              : 'bg-rose-500/10 text-rose-200 ring-rose-400/30'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{booking.channel}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'confirm', bookingId: booking.id, name: booking.name })}
                            className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/15"
                          >
                            {t('booking.status.confirm')}
                          </button>
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'cancel', bookingId: booking.id, name: booking.name })}
                            className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/15"
                          >
                            {t('booking.status.cancel')}
                          </button>
                          <button
                            onClick={() =>
                              booking.id && setActionModal({ type: 'reschedule', bookingId: booking.id, name: booking.name, currentDate: booking.date })
                            }
                            className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/15"
                          >
                            {t('booking.status.reschedule')}
                          </button>
                          <button
                            onClick={() => setActionModal({ type: 'notify', bookingId: booking.id || '', name: booking.name })}
                            className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/15"
                          >
                            {t('booking.status.notify')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="mx-auto h-2 w-1/2 rounded bg-white/5" />
                      <div className="mt-3 text-xs text-slate-400">{t('dashboard.loadingBookings')}</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.logs.title')}</h2>
            <button
              onClick={handleViewAllLogs}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/40"
            >
              {t('dashboard.logs.viewAll')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-medium uppercase text-slate-400">
            <div>{t('dashboard.logs.text')}</div>
            <div>{t('dashboard.logs.intent')}</div>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {recentLogsLeft.map((log, index) => (
              <div key={index} className="py-3 text-sm text-slate-200">
                <div className="text-slate-100">{log.text}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{log.intent}</div>
              </div>
            ))}
            {recentLogsLeft.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">{t('dashboard.noData')}</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dashboard.logs.title')}</h2>
            <button
              onClick={handleViewAllLogs}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/40"
            >
              {t('dashboard.logs.viewAll')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-xs font-medium uppercase text-slate-400">
            <div>{t('dashboard.logs.text')}</div>
            <div>{t('dashboard.logs.intent')}</div>
            <div>{t('dashboard.logs.channel')}</div>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {recentLogsRight.map((log, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 py-3 text-sm text-slate-200">
                <div className="text-slate-100">{log.text}</div>
                <div className="uppercase text-xs tracking-wide text-slate-400">{log.intent}</div>
                <div className="text-xs text-slate-400">{log.channel || '-'}</div>
              </div>
            ))}
            {recentLogsRight.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">{t('dashboard.noData')}</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
        <CallsList />
      </section>

      {/* New Booking Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="text-lg font-semibold">{t('dashboard.modal.title') || 'New booking'}</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  {t('dashboard.modal.name') || 'Name'}
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  {t('dashboard.modal.date') || 'Date'}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    {t('dashboard.modal.channel') || 'Channel'}
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    <option>Website</option>
                    <option>Call</option>
                    <option>Phone</option>
                    <option>Chat</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    {t('dashboard.modal.status') || 'Status'}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                {t('dashboard.modal.close') || 'Close'}
              </button>
              <button
                disabled={isSaving}
                onClick={async () => {
                  if (!newName.trim() || !newDate.trim()) return;
                  try {
                    setIsSaving(true);
                    const res = await fetch('/api/bookings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName.trim(), date: newDate.trim(), channel: newChannel, status: newStatus })
                    });
                    if (!res.ok) throw new Error('Failed');
                    setShowNewModal(false);
                    setNewName('');
                    setNewDate('');
                    setNewChannel('Website');
                    setNewStatus('Confirmed');
                    pushToast(t('dashboard.quickActions.newBooking'));
                  } catch {
                    pushToast('Error');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400 disabled:opacity-60"
              >
                {isSaving ? (t('dashboard.modal.saving') || 'Saving…') : (t('dashboard.modal.create') || 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Action Modals */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-100 p-5">
              {actionModal.type === 'confirm' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('booking.status.confirm')}</div>
                  {!actionModal.bookingId ? (
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">{t('dashboard.table.name')} / ID</label>
                      <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">—</option>
                        {recentBookings.map((b) => (
                          <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-4">{actionModal.name || actionModal.bookingId}</div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionModal(null)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('dashboard.modal.close') || 'Close'}</button>
                    <button
                      disabled={!actionModal.bookingId}
                      onClick={async () => {
                        if (!actionModal.bookingId) return;
                        try {
                          await updateDoc(doc(db, 'bookings', actionModal.bookingId), { status: 'Confirmed' });
                          pushToast(t('booking.status.confirm'));
                        } catch {
                          pushToast('Error');
                        } finally {
                          setActionModal(null);
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >{t('booking.status.confirm')}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'cancel' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('booking.status.cancel')}</div>
                  {!actionModal.bookingId ? (
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">{t('dashboard.table.name')} / ID</label>
                      <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">—</option>
                        {recentBookings.map((b) => (
                          <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-4">{actionModal.name || actionModal.bookingId}</div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionModal(null)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('dashboard.modal.close') || 'Close'}</button>
                    <button
                      disabled={!actionModal.bookingId}
                      onClick={async () => {
                        if (!actionModal.bookingId) return;
                        try {
                          await updateDoc(doc(db, 'bookings', actionModal.bookingId), { status: 'cancelled' });
                          pushToast(t('booking.status.cancel'));
                        } catch {
                          pushToast('Error');
                        } finally {
                          setActionModal(null);
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >{t('booking.status.cancel')}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'reschedule' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('booking.status.reschedule')}</div>
                  {!actionModal.bookingId ? (
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">{t('dashboard.table.name')} / ID</label>
                      <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">—</option>
                        {recentBookings.map((b) => (
                          <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mb-4">{actionModal.name || actionModal.bookingId} {actionModal.currentDate ? `— ${actionModal.currentDate}` : ''}</div>
                  )}
                  <label className="block text-xs text-gray-500 mb-1">{t('dashboard.modal.date') || 'Date'}</label>
                  <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mb-4" />
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionModal(null)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('dashboard.modal.close') || 'Close'}</button>
                    <button
                      disabled={!rescheduleDate || !actionModal.bookingId}
                      onClick={async () => {
                        if (!actionModal.bookingId) return;
                        try {
                          await updateDoc(doc(db, 'bookings', actionModal.bookingId), { date: rescheduleDate.trim() });
                          pushToast(t('booking.status.reschedule'));
                        } catch {
                          pushToast('Error');
                        } finally {
                          setActionModal(null);
                          setRescheduleDate('');
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >{t('booking.status.reschedule')}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'notify' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('booking.status.notify')}</div>
                  {!actionModal.bookingId && (
                    <div className="mb-3">
                      <label className="block text-xs text-gray-500 mb-1">{t('dashboard.table.name')} / ID</label>
                      <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="">—</option>
                        {recentBookings.map((b) => (
                          <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <label className="block text-xs text-gray-500 mb-1">{t('dashboard.actions.notifyMsg') || 'Message to admin:'}</label>
                  <textarea value={notifyText} onChange={(e) => setNotifyText(e.target.value)} rows={4} className="w-full border rounded-md px-3 py-2 text-sm mb-4" />
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionModal(null)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('dashboard.modal.close') || 'Close'}</button>
                    <button
                      disabled={!notifyText.trim() || !actionModal.bookingId}
                      onClick={async () => {
                        if (!actionModal.bookingId) return;
                        try {
                          await addDoc(collection(db, 'notifications'), { message: notifyText.trim(), bookingId: actionModal.bookingId || null, createdAt: serverTimestamp() });
                          await fetch('/api/n8n/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: actionModal.bookingId || null, message: notifyText.trim() }) });
                          pushToast(t('booking.status.notify'));
                        } catch {
                          pushToast('Error');
                        } finally {
                          setActionModal(null);
                          setNotifyText('');
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >{t('booking.status.notify')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((m) => (
            <div key={m.id} className="bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg">{m.text}</div>
          ))}
        </div>

        {/* Export / Share */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('common.export')}</button>
            <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('common.share')}</button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentBookings.title')}</h2>
            <button 
              onClick={handleViewAllBookings}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
            >
              {t('dashboard.recentBookings.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile view - card layout */}
          <div className="md:hidden">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={booking.id || index} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">{booking.name}</div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div>{booking.date}</div>
                    <div>{booking.channel}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">{t('dashboard.recentBookings.empty')}</div>
            )}
          </div>

          {/* Desktop view - table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.name')}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.date')}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.status')}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.channel')}</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <tr key={booking.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-gray-900">{booking.name}</td>
                      <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{booking.date}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ring-1 ring-inset ${
                          booking.status === 'Confirmed' 
                            ? 'bg-green-50 text-green-700 ring-green-200' 
                            : booking.status === 'Pending'
                            ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                            : 'bg-red-50 text-red-700 ring-red-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{booking.channel}</td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'confirm', bookingId: booking.id, name: booking.name })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('booking.status.confirm')}</button>
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'cancel', bookingId: booking.id, name: booking.name })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('booking.status.cancel')}</button>
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'reschedule', bookingId: booking.id, name: booking.name, currentDate: booking.date })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('booking.status.reschedule')}</button>
                          <button
                            onClick={() => setActionModal({ type: 'notify', bookingId: booking.id || '', name: booking.name })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('booking.status.notify')}</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-gray-500">
                      <div className="mx-auto h-2 w-1/2 bg-gray-100 rounded animate-pulse" />
                      <div className="mt-3 text-xs text-gray-400">{t('dashboard.loadingBookings')}</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.logs.title')}</h2>
              <button 
                onClick={handleViewAllLogs}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
              >
                {t('dashboard.logs.viewAll')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4">
                <div className="text-xs md:text-sm font-medium text-gray-600">{t('dashboard.logs.text')}</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">{t('dashboard.logs.intent')}</div>
              </div>

              {recentLogsLeft.map((log, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 md:gap-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-xs md:text-sm text-gray-900 break-words">{log.text}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.intent}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.logs.title')}</h2>
              <button 
                onClick={handleViewAllLogs}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
              >
                {t('dashboard.logs.viewAll')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                <div className="text-xs md:text-sm font-medium text-gray-600">{t('dashboard.logs.text')}</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">{t('dashboard.logs.intent')}</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">{t('dashboard.logs.channel')}</div>
              </div>

              {recentLogsRight.map((log, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 md:gap-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-xs md:text-sm text-gray-900 break-words">{log.text}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.intent}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.channel || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="mb-8">
          <CallsList />
        </div>
      </div>
  );
};

export default Dashboard;
