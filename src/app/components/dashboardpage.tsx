'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, orderBy, query, limit, where, Timestamp, getDocs, doc, updateDoc, addDoc, serverTimestamp, getCountFromServer } from 'firebase/firestore';
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
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'Confirmed' | 'Pending' | 'cancelled'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | string>('all');
  const [periodFilter, setPeriodFilter] = useState<'allTime' | 'last7' | 'last30' | 'thisMonth'>('allTime');
  const [sortOption, setSortOption] = useState<'dateDesc' | 'dateAsc' | 'nameAsc'>('dateDesc');

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  useEffect(() => {
    // Загружаем последние звонки и фильтруем на клиенте, чтобы избежать требований к индексам
    const q = query(
      collection(db, 'logs'),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows: BookingData[] = snap.docs
        .map((docu) => {
          const data = docu.data() as any;
          const createdAt: Date = data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date());
          return {
            id: docu.id,
            callId: data.callId,
            type: data.type,
            endedReason: data.endedReason,
            channel: data.channel || 'Call',
            createdAt,
          };
        })
        .filter((item) => item.type === 'call_summary' && (item.endedReason || '').toLowerCase() === 'customer-ended-call')
        .slice(0, 10)
        .map((item) => ({
          id: item.id,
          name: item.callId ? `Call ${String(item.callId).slice(0, 8)}…` : 'Unknown Call',
          date: item.createdAt.toISOString().split('T')[0],
          status: 'Confirmed' as const,
          channel: item.channel,
        }));
      setRecentBookings(rows);
    });

    return () => unsub();
  }, []);

  const handleViewAllBookings = () => {
    router.push(`/${language}/bookings`);
  };

  const handleViewAllLogs = () => {
    router.push(`/${language}/logs`);
  };

  const resolveLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const periodLabel =
    period === 'today'
      ? t('dashboard.period.today')
      : period === '7d'
      ? t('dashboard.period.last7')
      : t('dashboard.period.last30');

  const funnelMax = Math.max(funnel.calls, funnel.intents, funnel.bookings, 1);
  const funnelItems = [
    { label: t('dashboard.funnel.calls'), value: funnel.calls, color: 'bg-teal-400' },
    { label: t('dashboard.funnel.intents'), value: funnel.intents, color: 'bg-sky-400' },
    { label: t('dashboard.funnel.bookings'), value: funnel.bookings, color: 'bg-purple-400' },
  ];

  const metricCards = [
    {
      title: t('dashboard.metrics.aht.title'),
      value: kpi.ahtSec != null ? `${kpi.ahtSec}s` : '—',
      helper: t('dashboard.metrics.helper'),
    },
    {
      title: t('dashboard.metrics.confirmation.title'),
      value: `${kpi.confirmed} / ${kpi.cancelled}`,
      helper: t('dashboard.metrics.helper'),
    },
    {
      title: t('dashboard.metrics.noShow.title'),
      value: '—',
      helper: t('dashboard.metrics.noShow.helper'),
    },
  ];

  const opsSummary = [
    { title: t('dashboard.metrics.missed.title'), value: missedFailed.missed, color: 'bg-orange-400/80' },
    { title: t('dashboard.metrics.errors.title'), value: missedFailed.errors, color: 'bg-rose-500/80' },
    { title: t('dashboard.metrics.duplicates.title'), value: `${repeatPct}%`, color: 'bg-purple-500/80' },
  ];

  const quickActionsList = [
    { label: t('booking.status.confirm'), handler: () => setActionModal({ type: 'confirm' }) },
    { label: t('booking.status.cancel'), handler: () => setActionModal({ type: 'cancel' }) },
    { label: t('booking.status.reschedule'), handler: () => setActionModal({ type: 'reschedule' }) },
    { label: t('booking.status.notify'), handler: () => setActionModal({ type: 'notify' }) },
  ];

  const channelOptions = useMemo(() => {
    const unique = new Set<string>();
    recentBookings.forEach((booking) => {
      if (booking.channel) {
        unique.add(booking.channel);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [recentBookings]);

  const periodOptions: Array<{ value: 'allTime' | 'last7' | 'last30' | 'thisMonth'; label: string }> = [
    { value: 'allTime', label: t('bookings.filters.allTime') },
    { value: 'last7', label: t('bookings.filters.last7') },
    { value: 'last30', label: t('bookings.filters.last30') },
    { value: 'thisMonth', label: t('bookings.filters.thisMonth') },
  ];

  const sortOptions: Array<{ value: 'dateDesc' | 'dateAsc' | 'nameAsc'; label: string }> = [
    { value: 'dateDesc', label: t('bookings.filters.dateDesc') },
    { value: 'dateAsc', label: t('bookings.filters.dateAsc') },
    { value: 'nameAsc', label: t('bookings.filters.nameAsc') },
  ];

  const filteredRecentBookings = useMemo(() => {
    let items = [...recentBookings];

    if (bookingStatusFilter !== 'all') {
      items = items.filter((booking) => booking.status === bookingStatusFilter);
    }

    if (channelFilter !== 'all') {
      const target = channelFilter.toLowerCase();
      items = items.filter((booking) => (booking.channel || '').toLowerCase() === target);
    }

    if (periodFilter !== 'allTime') {
      const now = new Date();
      items = items.filter((booking) => {
        const parsed = new Date(booking.date);
        if (Number.isNaN(parsed.getTime())) return false;
        if (periodFilter === 'thisMonth') {
          return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
        }
        const diffDays = Math.abs(parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return periodFilter === 'last7' ? diffDays <= 7 : diffDays <= 30;
      });
    }

    items.sort((a, b) => {
      if (sortOption === 'nameAsc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
        return 0;
      }
      return sortOption === 'dateAsc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    return items;
  }, [recentBookings, bookingStatusFilter, channelFilter, periodFilter, sortOption]);

  const filteredCount = filteredRecentBookings.length;

  const bookingStats = useMemo(
    () => ({
      total: totalBookings,
      confirmed: confirmedCount,
      pending: pendingCount,
      cancelled: kpi.cancelled,
    }),
    [totalBookings, confirmedCount, pendingCount, kpi.cancelled]
  );

  const bookingStatusOptions: Array<{
    label: string;
    value: 'all' | 'Confirmed' | 'Pending' | 'cancelled';
    className: string;
  }> = [
    { label: resolveLabel('bookings.filters.all', 'All'), value: 'all', className: 'bg-slate-100 text-slate-600' },
    { label: resolveLabel('bookings.statuses.confirmed', 'Confirmed'), value: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
    { label: resolveLabel('bookings.statuses.pending', 'Pending'), value: 'Pending', className: 'bg-amber-100 text-amber-700' },
    { label: resolveLabel('bookings.statuses.cancelled', 'Cancelled'), value: 'cancelled', className: 'bg-rose-100 text-rose-700' },
  ];

  const bookingStatusStyles: Record<BookingData['status'], string> = {
    Confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  const formatBookingStatus = (status: BookingData['status']) => {
    const key = status === 'cancelled' ? 'cancelled' : status.toLowerCase();
    return resolveLabel(`bookings.statuses.${key}`, status === 'cancelled' ? 'Cancelled' : status);
  };

  const formatChannelLabel = (channel: string) => {
    const key = (channel || '').toLowerCase();
    return resolveLabel(`dashboard.channels.labels.${key}`, channel || '-');
  };

  const calendarState = useMemo(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat(language || 'en', { month: 'long', year: 'numeric' });
    const label = formatter.format(now);
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const offset = start.getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const cells = Array.from({ length: 42 }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
    const weeks: Array<Array<number | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return { label, weeks, month: now.getMonth(), year: now.getFullYear() };
  }, [language]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<number, number>();
    filteredRecentBookings.forEach((booking) => {
      const parsed = new Date(booking.date);
      if (Number.isNaN(parsed.getTime())) return;
      if (parsed.getMonth() === calendarState.month && parsed.getFullYear() === calendarState.year) {
        const day = parsed.getDate();
        map.set(day, (map.get(day) || 0) + 1);
      }
    });
    return map;
  }, [filteredRecentBookings, calendarState.month, calendarState.year]);

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
    resolveLabel(`dashboard.heatmap.weekdays.${day}`, day)
  );

  const hasFiltersApplied =
    bookingStatusFilter !== 'all' || channelFilter !== 'all' || periodFilter !== 'allTime' || sortOption !== 'dateDesc';

  const resetFilters = () => {
    setBookingStatusFilter('all');
    setChannelFilter('all');
    setPeriodFilter('allTime');
    setSortOption('dateDesc');
  };

  const today = new Date();

  const filteredLabelTemplate = resolveLabel('dashboard.snapshot.filtered', '{shown} of {total} bookings');
  const filteredLabel = filteredLabelTemplate
    .replace('{shown}', String(filteredCount))
    .replace('{total}', String(recentBookings.length));

  const exportRecentBookings = () => {
    if (!filteredRecentBookings.length) {
      return;
    }
    const header = ['guest', 'date', 'status', 'channel'];
    const rows = filteredRecentBookings.map((booking) => [
      booking.name,
      booking.date,
      booking.status,
      booking.channel,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recent-bookings-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareBookingsSnapshot = async () => {
    const snapshot = `Bookings: ${bookingStats.total} total / ${bookingStats.confirmed} confirmed / ${bookingStats.pending} pending.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bookings Snapshot', text: snapshot });
        return;
      }
      await navigator.clipboard.writeText(snapshot);
    } catch (error) {
      console.error('Share snapshot error', error);
    }
  };

  useEffect(() => {
    let isActive = true;
    async function loadCounts() {
      try {
        const logsCol = collection(db, 'logs');
        const now = new Date();
        const start =
          period === 'today'
            ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
            : period === '7d'
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const since = Timestamp.fromDate(start);

        const [totalSnap, confirmedSnap, pendingSnap] = await Promise.all([
          getCountFromServer(
            query(logsCol, where('type', '==', 'call_summary'), where('endedReason', '==', 'customer-ended-call'))
          ),
          getCountFromServer(
            query(
              logsCol,
              where('type', '==', 'call_summary'),
              where('endedReason', '==', 'customer-ended-call'),
              where('status', '==', 'ended')
            )
          ),
          getCountFromServer(
            query(logsCol, where('type', '==', 'call_event'), where('status', '==', 'call_started'))
          ),
        ]);

        if (!isActive) return;
        setTotalBookings(totalSnap.data().count || 0);
        setConfirmedCount(confirmedSnap.data().count || 0);
        setPendingCount(pendingSnap.data().count || 0);

        try {
          const [successfulCallsSnap, totalCallsSnap] = await Promise.all([
            getCountFromServer(
              query(
                logsCol,
                where('type', '==', 'call_summary'),
                where('endedReason', '==', 'customer-ended-call'),
                where('createdAt', '>=', since)
              )
            ),
            getCountFromServer(
              query(
                logsCol,
                where('type', 'in', ['call_event', 'call_summary']),
                where('createdAt', '>=', since)
              )
            ),
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

        const [callsCount, intentsCount, bookingsCount] = await Promise.all([
          getCountFromServer(query(logsCol, where('type', '==', 'call_event'), where('createdAt', '>=', since))),
          getCountFromServer(query(logsCol, where('status', '==', 'intent_detected'), where('createdAt', '>=', since))),
          getCountFromServer(
            query(
              logsCol,
              where('type', '==', 'call_summary'),
              where('endedReason', '==', 'customer-ended-call'),
              where('createdAt', '>=', since)
            )
          ),
        ]);
        if (!isActive) return;

        const calls = callsCount.data().count || 0;
        const intents = intentsCount.data().count || 0;
        const bookings = bookingsCount.data().count || 0;
        setFunnel({ calls, intents, bookings });

        const channels = ['Call'];
        const channelSnaps = await Promise.all(
          channels.map((ch) =>
            Promise.all([
              getCountFromServer(query(logsCol, where('channel', '==', ch), where('createdAt', '>=', since))),
              getCountFromServer(
                query(
                  logsCol,
                  where('channel', '==', ch),
                  where('type', '==', 'call_summary'),
                  where('endedReason', '==', 'customer-ended-call'),
                  where('createdAt', '>=', since)
                )
              ),
            ])
          )
        );
        if (!isActive) return;
        setChannelStats(
          channelSnaps.map(([callsSnap, bookingsSnap], idx) => {
            const callCount = callsSnap.data().count || 0;
            const bookingCount = bookingsSnap.data().count || 0;
            const conv = callCount > 0 ? Math.round((bookingCount / callCount) * 1000) / 10 : 0;
            return { channel: channels[idx], calls: callCount, bookings: bookingCount, conversion: conv };
          })
        );

        const logsForDetails = await getDocs(
          query(logsCol, where('createdAt', '>=', since), orderBy('createdAt', 'desc'), limit(2000))
        );
        if (!isActive) return;

        const durations = logsForDetails.docs
          .map((docu) => {
            const data = docu.data() as any;
            if (typeof data?.durationSec === 'number') return data.durationSec;
            if (typeof data?.durationMs === 'number') return Math.round(data.durationMs / 1000);
            return null;
          })
          .filter((value): value is number => typeof value === 'number');
        const ahtSec = durations.length
          ? Math.round(durations.reduce((acc, curr) => acc + curr, 0) / durations.length)
          : null;

        const missedStatuses = new Set(['missed', 'no_answer', 'failed']);
        const missed = logsForDetails.docs.filter((docu) =>
          missedStatuses.has(((docu.data() as any)?.status || '').toLowerCase())
        ).length;
        const errors = logsForDetails.docs.filter(
          (docu) => Array.isArray((docu.data() as any)?.errors) && (docu.data() as any).errors.length > 0
        ).length;
        const cancelledSummaries = logsForDetails.docs.filter((docu) => {
          const status = ((docu.data() as any)?.status || '').toLowerCase();
          return status.includes('cancel');
        }).length;
        setKpi({ confirmed: bookings, cancelled: cancelledSummaries, ahtSec });
        setMissedFailed({ missed, errors });

        const numbers = logsForDetails.docs
          .map((docu) => ((docu.data() as any)?.clientNumber || '').trim())
          .filter(Boolean);
        const freq = new Map<string, number>();
        for (const phone of numbers) freq.set(phone, (freq.get(phone) || 0) + 1);
        const repeatCalls = numbers.filter((phone) => (freq.get(phone) || 0) > 1).length;
        const repeatPctCalc = calls > 0 ? Math.round((repeatCalls / calls) * 1000) / 10 : 0;
        setRepeatPct(repeatPctCalc);

        const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
        logsForDetails.docs.forEach((docu) => {
          const data = docu.data() as any;
          let timestamp: Date | null = null;
          if (data?.createdAt?.toDate) {
            timestamp = data.createdAt.toDate();
          } else if (data?.timestamp) {
            const parsed = Date.parse(data.timestamp);
            timestamp = Number.isNaN(parsed) ? null : new Date(parsed);
          }
          if (!timestamp) return;
          const dow = timestamp.getDay();
          const hour = timestamp.getHours();
          grid[dow][hour] = (grid[dow][hour] || 0) + 1;
        });
        setHeatmap(grid);

      } catch (error) {
        console.error('loadCounts error', error);
      }
    }

    loadCounts();
    return () => {
      isActive = false;
    };
  }, [period]);

  useEffect(() => {
    const loadRecentLogs = async () => {
      try {
        const response = await fetch('/api/logs?type=call_summary&limit=10');
        const data = await response.json();

        if (data.success && data.logs) {
          const callsWithTranscripts = data.logs.filter((log: any) => log.transcript);
          const leftLogs = callsWithTranscripts.slice(0, 5).map((log: any) => ({
            text: log.transcript?.substring(0, 50) + '...' || 'No transcript',
            intent: log.endedReason === 'customer-ended-call' ? 'booking' : 'other',
          }));
          const rightLogs = callsWithTranscripts.slice(0, 5).map((log: any) => ({
            text: log.transcript?.substring(0, 30) + '...' || 'No transcript',
            intent: log.endedReason === 'customer-ended-call' ? 'booking' : 'other',
            channel: 'Call',
          }));
          setRecentLogsLeft(leftLogs);
          setRecentLogsRight(rightLogs);
        }
      } catch (error) {
        console.error('Error loading recent logs:', error);
        setRecentLogsLeft([]);
        setRecentLogsRight([]);
      }
    };

    loadRecentLogs();
  }, []);

  return (
    <div className="space-y-10 text-slate-100">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 shadow-2xl sm:px-10">
        <div className="pointer-events-none absolute -top-32 right-10 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-100">
              {resolveLabel('dashboard.hero.badge', 'Bookings Control Center')}
            </span>
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">{t('bookings.title')}</h1>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                {resolveLabel(
                  'dashboard.hero.subtitle',
                  resolveLabel('dashboard.stats.subtitle', 'Track every reservation, channel, and guest interaction in one place.')
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-400"
              >
                {t('dashboard.quickActions.newBooking')}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={handleViewAllBookings}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/10"
              >
                {t('dashboard.recentBookings.viewAll')}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="w-full max-w-xl space-y-4">
            <div className="flex justify-start lg:justify-end">
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
                    {key === 'today'
                      ? t('dashboard.period.today')
                      : key === '7d'
                      ? t('dashboard.period.last7')
                      : t('dashboard.period.last30')}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">{resolveLabel('dashboard.cards.bookings.title', 'Total bookings')}</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{totalBookings}</p>
                <p className="text-[11px] text-slate-400">{periodLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">{resolveLabel('dashboard.metrics.confirmation.title', 'Confirmed vs Cancelled')}</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {confirmedCount} / {pendingCount}
                </p>
                <p className="text-[11px] text-slate-400">{resolveLabel('dashboard.cards.status.helper', "Today's Snapshot")}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">{resolveLabel('dashboard.cards.conversion.title', 'Conversion')}</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{callConversion == null ? '—' : `${callConversion}%`}</p>
                <p className="text-[11px] text-slate-400">{resolveLabel('dashboard.cards.conversion.helper', 'Last 30 Days')}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">{t('dashboard.metrics.aht.title')}</p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{kpi.ahtSec != null ? `${kpi.ahtSec}s` : '—'}</p>
                <p className="text-[11px] text-slate-400">{t('dashboard.metrics.helper')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {opsSummary.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
            >
              <span className="text-slate-200">{item.title}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{resolveLabel('dashboard.filters.title', 'Filters')}</h2>
                <p className="text-xs text-slate-400">{resolveLabel('dashboard.filters.helper', 'Refine the bookings shown below.')}</p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasFiltersApplied}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('bookings.filters.reset')}
              </button>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('bookings.filters.status')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bookingStatusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBookingStatusFilter(option.value)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        bookingStatusFilter === option.value ? 'bg-white text-slate-900 shadow-lg' : `${option.className} hover:shadow`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('bookings.filters.channel')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setChannelFilter('all')}
                    className={`inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold transition ${
                      channelFilter === 'all' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {resolveLabel('bookings.filters.all', 'All')}
                  </button>
                  {channelOptions.map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setChannelFilter(channel)}
                      className={`inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold transition ${
                        channelFilter === channel ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {formatChannelLabel(channel)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('bookings.filters.period')}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPeriodFilter(option.value)}
                      className={`rounded-2xl border border-white/15 px-4 py-2 text-xs font-semibold transition ${
                        periodFilter === option.value ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t('bookings.filters.sort')}</p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortOption(option.value)}
                      className={`rounded-2xl border border-white/15 px-4 py-2 text-xs font-semibold transition ${
                        sortOption === option.value ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">{resolveLabel('dashboard.quickActions.title', 'Quick actions')}</h2>
            <p className="mt-1 text-xs text-slate-400">{resolveLabel('dashboard.quickActions.helper', 'Handle manual updates without leaving the dashboard.')}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActionsList.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.handler}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-white">{resolveLabel('dashboard.metricsSection.title', 'Operations pulse')}</h2>
            <div className="grid gap-3">
              {metricCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-300">{card.title}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{card.value}</p>
                  <p className="text-[11px] text-slate-400">{card.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{t('bookings.calendar.title')}</h2>
                <p className="text-xs text-slate-400">{resolveLabel('dashboard.calendar.helper', 'See where bookings cluster this month.')}</p>
              </div>
              <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200">{calendarState.label}</span>
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {weekdayLabels.map((label) => (
                  <div key={label} className="py-1 text-center">{label}</div>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                {calendarState.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return <div key={dayIndex} className="aspect-square rounded-lg bg-white/5" />;
                      }
                      const count = bookingsByDay.get(day) || 0;
                      const isToday =
                        day === today.getDate() &&
                        calendarState.month === today.getMonth() &&
                        calendarState.year === today.getFullYear();
                      return (
                        <div
                          key={dayIndex}
                          className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-semibold transition ${
                            count > 0 ? 'bg-teal-500/20 text-teal-100 ring-1 ring-inset ring-teal-400/50' : 'bg-white/5 text-slate-300'
                          } ${isToday ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-teal-400/80' : ''}`}
                        >
                          {day}
                          {count > 0 && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-teal-300" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 text-slate-900 shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{resolveLabel('dashboard.snapshot.title', 'Current bookings')}</p>
                <h2 className="mt-1 text-2xl font-semibold">{resolveLabel('dashboard.snapshot.subtitle', 'Every confirmation from voice, chat, and web in one queue.')}</h2>
                <p className="mt-2 text-sm text-slate-500">{filteredLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportRecentBookings}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('common.export')}
                </button>
                <button
                  type="button"
                  onClick={shareBookingsSnapshot}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('common.share')}
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{resolveLabel('dashboard.cards.bookings.title', 'Total bookings')}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{bookingStats.total}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{resolveLabel('bookings.statuses.confirmed', 'Confirmed')}</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">{bookingStats.confirmed}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{resolveLabel('bookings.statuses.pending', 'Pending')}</p>
                <p className="mt-2 text-2xl font-semibold text-amber-700">{bookingStats.pending}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">{resolveLabel('bookings.statuses.cancelled', 'Cancelled')}</p>
                <p className="mt-2 text-2xl font-semibold text-rose-700">{bookingStats.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.funnel.title')}</h3>
                <span className="text-xs text-slate-500">{periodLabel}</span>
              </div>
              <div className="mt-6 space-y-4">
                {funnelItems.map((item) => {
                  const width = funnelMax ? Math.round((item.value / funnelMax) * 100) : 0;
                  const displayWidth = item.value > 0 ? Math.max(width, 10) : 0;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{item.label}</span>
                        <span className="text-slate-900">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${displayWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.channels.title')}</h3>
                <span className="text-xs text-slate-500">{resolveLabel('dashboard.metrics.helper', 'By selected period')}</span>
              </div>
              {channelStats.length ? (
                <div className="mt-6 space-y-4">
                  {channelStats.map((row) => (
                    <div key={row.channel} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{formatChannelLabel(row.channel)}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {row.conversion}% {resolveLabel('dashboard.channels.headers.conversion', 'Conversion')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
                        <span>{row.calls} {resolveLabel('dashboard.channels.headers.calls', 'Calls')}</span>
                        <span>{row.bookings} {resolveLabel('dashboard.channels.headers.bookings', 'Bookings')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  {t('dashboard.noData')}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recentBookings.title')}</h2>
                <p className="text-sm text-slate-500">{resolveLabel('dashboard.recentBookings.subtitle', 'Focus on the guests you need to follow up with today.')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleViewAllBookings}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('dashboard.recentBookings.viewAll')}
                </button>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">{t('dashboard.table.name')}</th>
                    <th className="px-6 py-3">{t('dashboard.table.date')}</th>
                    <th className="px-6 py-3">{t('dashboard.table.status')}</th>
                    <th className="px-6 py-3">{t('dashboard.table.channel')}</th>
                    <th className="px-6 py-3 text-right">{t('dashboard.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredRecentBookings.length ? (
                    filteredRecentBookings.map((booking, index) => (
                      <tr key={booking.id || index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-medium text-slate-900">{booking.name}</td>
                        <td className="px-6 py-4 text-slate-500">{booking.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${bookingStatusStyles[booking.status]}`}>
                            {formatBookingStatus(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatChannelLabel(booking.channel)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => booking.id && setActionModal({ type: 'confirm', bookingId: booking.id, name: booking.name })}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                            >
                              {t('booking.status.confirm')}
                            </button>
                            <button
                              type="button"
                              onClick={() => booking.id && setActionModal({ type: 'cancel', bookingId: booking.id, name: booking.name })}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                            >
                              {t('booking.status.cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                booking.id && setActionModal({ type: 'reschedule', bookingId: booking.id, name: booking.name, currentDate: booking.date })
                              }
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                            >
                              {t('booking.status.reschedule')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionModal({ type: 'notify', bookingId: booking.id || '', name: booking.name })}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                            >
                              {t('booking.status.notify')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        <div className="mx-auto h-2 w-1/2 rounded bg-slate-100 animate-pulse" />
                        <p className="mt-3 text-xs text-slate-400">{t('dashboard.loadingBookings')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-4 md:hidden">
              {filteredRecentBookings.length ? (
                filteredRecentBookings.map((booking, index) => (
                  <div key={booking.id || index} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{booking.name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${bookingStatusStyles[booking.status]}`}>
                        {formatBookingStatus(booking.status)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <p className="font-medium text-slate-600">{t('dashboard.table.date')}</p>
                        <p>{booking.date}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-600">{t('dashboard.table.channel')}</p>
                        <p>{formatChannelLabel(booking.channel)}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <button
                        type="button"
                        onClick={() => booking.id && setActionModal({ type: 'confirm', bookingId: booking.id, name: booking.name })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-white"
                      >
                        {t('booking.status.confirm')}
                      </button>
                      <button
                        type="button"
                        onClick={() => booking.id && setActionModal({ type: 'cancel', bookingId: booking.id, name: booking.name })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-white"
                      >
                        {t('booking.status.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => booking.id && setActionModal({ type: 'reschedule', bookingId: booking.id, name: booking.name, currentDate: booking.date })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-white"
                      >
                        {t('booking.status.reschedule')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionModal({ type: 'notify', bookingId: booking.id || '', name: booking.name })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-white"
                      >
                        {t('booking.status.notify')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                  {resolveLabel('dashboard.recentBookings.empty', 'No recent bookings yet.')}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.logs.title')}</h2>
                <button
                  type="button"
                  onClick={handleViewAllLogs}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('dashboard.logs.viewAll')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {recentLogsLeft.length ? (
                  recentLogsLeft.map((log, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="font-medium text-slate-900">{log.text}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{log.intent}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    {t('dashboard.noData')}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.logs.title')}</h2>
                <button
                  type="button"
                  onClick={handleViewAllLogs}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('dashboard.logs.viewAll')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {recentLogsRight.length ? (
                  recentLogsRight.map((log, index) => (
                    <div key={index} className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p className="col-span-2 font-medium text-slate-900">{log.text}</p>
                      <div className="flex flex-col items-end text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span>{log.intent}</span>
                        <span className="mt-1 text-[11px] font-normal normal-case text-slate-400">{formatChannelLabel(log.channel || '-')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    {t('dashboard.noData')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl">
            <CallsList />
          </div>
        </div>
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
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
            {actionModal.type === 'confirm' && (
              <div>
                <div className="mb-2 text-lg font-semibold">{t('booking.status.confirm')}</div>
                {!actionModal.bookingId ? (
                  <div className="mb-4">
                    <label className="mb-1 block text-xs text-slate-500">{t('dashboard.table.name')} / ID</label>
                    <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">—</option>
                      {recentBookings.map((b) => (
                        <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-slate-600">{actionModal.name}</p>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">{t('dashboard.modal.close') || 'Close'}</button>
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
                    className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-400 disabled:opacity-60"
                  >
                    {t('booking.status.confirm')}
                  </button>
                </div>
              </div>
            )}
            {actionModal.type === 'cancel' && (
              <div>
                <div className="mb-2 text-lg font-semibold">{t('booking.status.cancel')}</div>
                {!actionModal.bookingId ? (
                  <div className="mb-4">
                    <label className="mb-1 block text-xs text-slate-500">{t('dashboard.table.name')} / ID</label>
                    <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">—</option>
                      {recentBookings.map((b) => (
                        <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-slate-600">{actionModal.name}</p>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">{t('dashboard.modal.close') || 'Close'}</button>
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
                    className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
                  >
                    {t('booking.status.cancel')}
                  </button>
                </div>
              </div>
            )}
            {actionModal.type === 'reschedule' && (
              <div>
                <div className="mb-2 text-lg font-semibold">{t('booking.status.reschedule')}</div>
                <p className="mb-3 text-sm text-slate-600">
                  {actionModal.name} · {actionModal.currentDate}
                </p>
                <label className="mb-1 block text-xs text-slate-500">{t('dashboard.modal.date') || 'Date'}</label>
                <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="mb-4 w-full rounded-md border px-3 py-2 text-sm" />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">{t('dashboard.modal.close') || 'Close'}</button>
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
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    {t('booking.status.reschedule')}
                  </button>
                </div>
              </div>
            )}
            {actionModal.type === 'notify' && (
              <div>
                <div className="mb-2 text-lg font-semibold">{t('booking.status.notify')}</div>
                {!actionModal.bookingId && (
                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-slate-500">{t('dashboard.table.name')} / ID</label>
                    <select onChange={(e) => setActionModal((m) => m && { ...m, bookingId: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">
                      <option value="">—</option>
                      {recentBookings.map((b) => (
                        <option key={b.id || b.name} value={b.id}>{`${b.name} (${b.id})`}</option>
                      ))}
                    </select>
                  </div>
                )}
                <label className="mb-1 block text-xs text-slate-500">{t('dashboard.actions.notifyMsg') || 'Message to admin:'}</label>
                <textarea value={notifyText} onChange={(e) => setNotifyText(e.target.value)} rows={4} className="mb-4 w-full rounded-md border px-3 py-2 text-sm" />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setActionModal(null)} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">{t('dashboard.modal.close') || 'Close'}</button>
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
                    className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
                  >
                    {t('booking.status.notify')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((m) => (
          <div key={m.id} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white shadow-lg">{m.text}</div>
        ))}
      </div>
    </div>
  );


};

export default Dashboard;
