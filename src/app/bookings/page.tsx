"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, limit, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, CheckCircle2, Clock3, XCircle, Search, ChevronLeft, ChevronRight, ArrowUpRight, Plus } from 'lucide-react';

interface BookingData {
  id?: string;
  name: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'cancelled';
  channel: string;
  phone?: string;
  time?: string;
  partySize?: number;
  notes?: string;
  [key: string]: any;
}

type DayListState = { dateLabel: string; isoDate: string; bookings: BookingData[] } | null;

const statusStyles: Record<BookingData['status'], string> = {
  Confirmed: 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/30',
  Pending: 'bg-amber-400/10 text-amber-500 ring-amber-500/30',
  cancelled: 'bg-rose-500/10 text-rose-500 ring-rose-500/30',
};

const channelStyles: Record<string, string> = {
  call: 'bg-blue-500/10 text-blue-500 ring-blue-500/30',
  phone: 'bg-blue-500/10 text-blue-500 ring-blue-500/30',
  website: 'bg-purple-500/10 text-purple-500 ring-purple-500/30',
  chat: 'bg-sky-500/10 text-sky-500 ring-sky-500/30',
  whatsapp: 'bg-green-500/10 text-green-500 ring-green-500/30',
  sms: 'bg-cyan-500/10 text-cyan-500 ring-cyan-500/30',
};

const StatusBadge = ({ status }: { status: BookingData['status'] }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
      statusStyles[status] || 'bg-slate-200 text-slate-700 ring-slate-300'
    }`}
  >
    {status}
  </span>
);

const ChannelBadge = ({ channel }: { channel: string }) => {
  const key = channel?.toLowerCase?.() || 'unknown';
  const classes = channelStyles[key] || 'bg-slate-200 text-slate-700 ring-slate-300';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}>
      {channel || '—'}
    </span>
  );
};

const formatDate = (value: string, locale: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  } catch (err) {
    return value;
  }
};

const normalizeDate = (value?: string) => {
  if (!value) return null;
  const [y, m, d] = value.split('T')[0]?.split('-') ?? [];
  if (!y || !m || !d) return null;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return { year, month, day };
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const computeDateKey = (year: number, monthIndex: number, day: number) => {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const BookingsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [recentBookings, setRecentBookings] = useState<BookingData[]>([]);
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'All');
  const [channel, setChannel] = useState<string>(searchParams.get('channel') || 'All');
  const [period, setPeriod] = useState<string>(searchParams.get('period') || 'all');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'date_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [details, setDetails] = useState<null | (BookingData & { id: string })>(null);
  const [dayList, setDayList] = useState<DayListState>(null);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    partySize: 1,
    status: 'Confirmed' as BookingData['status'],
    channel: 'Website',
    notes: '',
  });
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(500));
    const unsub = onSnapshot(q, (snap) => {
      const rows: BookingData[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setRecentBookings(rows);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.set('status', status);
    if (channel && channel !== 'All') params.set('channel', channel);
    if (period && period !== 'all') params.set('period', period);
    if (sort && sort !== 'date_desc') params.set('sort', sort);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
  }, [status, channel, period, sort, pathname, router]);

  const totals = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    const channelMap = new Map<string, number>();

    for (const booking of recentBookings) {
      if (booking.status === 'Confirmed') confirmed += 1;
      else if (booking.status === 'Pending') pending += 1;
      else if (booking.status === 'cancelled') cancelled += 1;

      const key = (booking.channel || 'Unknown').trim() || 'Unknown';
      channelMap.set(key, (channelMap.get(key) || 0) + 1);
    }

    return {
      total: recentBookings.length,
      confirmed,
      pending,
      cancelled,
      channelMap,
    };
  }, [recentBookings]);

  const filtered = useMemo(() => {
    let rows = [...recentBookings];
    const now = new Date();
    let after: Date | null = null;
    if (period === '7d') after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === '30d') after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === 'month') after = new Date(now.getFullYear(), now.getMonth(), 1);

    const term = searchTerm.trim().toLowerCase();

    rows = rows.filter((b) => {
      const statusOk = status === 'All' || (b.status || '').toLowerCase() === status.toLowerCase();
      const channelOk = channel === 'All' || (b.channel || '').toLowerCase() === channel.toLowerCase();
      if (!statusOk || !channelOk) return false;
      if (after) {
        const createdAt: any = (b as any).createdAt;
        if (!createdAt) return false;
        const ts = typeof createdAt?.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
        if (ts < after) return false;
      }
      if (!term) return true;
      const haystack = [b.name, b.channel, b.notes, b.phone, b.status, b.date].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });

    rows.sort((a, b) => {
      if (sort === 'date_asc' || sort === 'date_desc') {
        const ad: any = (a as any).createdAt;
        const bd: any = (b as any).createdAt;
        const at = typeof ad?.toDate === 'function' ? ad.toDate().getTime() : new Date(ad || 0).getTime();
        const bt = typeof bd?.toDate === 'function' ? bd.toDate().getTime() : new Date(bd || 0).getTime();
        return sort === 'date_asc' ? at - bt : bt - at;
      }
      if (sort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return rows;
  }, [recentBookings, status, channel, period, sort, searchTerm]);

  const filteredTotals = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    const channelMap = new Map<string, number>();

    for (const booking of filtered) {
      if (booking.status === 'Confirmed') confirmed += 1;
      else if (booking.status === 'Pending') pending += 1;
      else if (booking.status === 'cancelled') cancelled += 1;

      const key = (booking.channel || 'Unknown').trim() || 'Unknown';
      channelMap.set(key, (channelMap.get(key) || 0) + 1);
    }

    return {
      total: filtered.length,
      confirmed,
      pending,
      cancelled,
      channelMap,
    };
  }, [filtered]);

  const channelOptions = useMemo(() => {
    const items = Array.from(totals.channelMap.entries()).map(([key, count]) => ({
      value: key,
      count,
    }));
    items.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    return [{ value: 'All', count: totals.total }, ...items];
  }, [totals]);

  const calendarMonthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(calendarCursor);
    } catch (err) {
      return `${calendarCursor.getFullYear()}-${calendarCursor.getMonth() + 1}`;
    }
  }, [language, calendarCursor]);

  const calendarMatrix = useMemo(() => {
    const year = calendarCursor.getFullYear();
    const monthIndex = calendarCursor.getMonth();
    const first = new Date(year, monthIndex, 1);
    const leadPadding = first.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const monthKey = getMonthKey(calendarCursor);
    const dayBuckets = new Map<number, { confirmed: number; pending: number; cancelled: number; bookings: BookingData[] }>();

    for (const booking of recentBookings) {
      const normalized = normalizeDate(booking.date);
      if (!normalized) continue;
      const ym = `${normalized.year}-${String(normalized.month).padStart(2, '0')}`;
      if (ym !== monthKey) continue;
      const day = normalized.day;
      const entry = dayBuckets.get(day) || { confirmed: 0, pending: 0, cancelled: 0, bookings: [] };
      if (booking.status === 'Confirmed') entry.confirmed += 1;
      else if (booking.status === 'Pending') entry.pending += 1;
      else if (booking.status === 'cancelled') entry.cancelled += 1;
      entry.bookings.push(booking);
      dayBuckets.set(day, entry);
    }

    const cells: Array<{ day: number | null; data?: { confirmed: number; pending: number; cancelled: number; bookings: BookingData[] } }> = [];
    for (let i = 0; i < leadPadding; i += 1) cells.push({ day: null });
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, data: dayBuckets.get(day) });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null });

    return cells;
  }, [calendarCursor, recentBookings]);

  const handleStatusChange = async (bookingId: string, nextStatus: BookingData['status']) => {
    if (!bookingId) return;
    setUpdatingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: nextStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDetailsSave = async () => {
    if (!details?.id) return;
    setDetailsSaving(true);
    try {
      const { id, ...payload } = details as any;
      await updateDoc(doc(db, 'bookings', id), payload);
      setDetails(null);
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!newForm.name.trim() || !newForm.date.trim()) return;
    setCreateSaving(true);
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      setShowNew(false);
      setNewForm({
        name: '',
        phone: '',
        date: '',
        time: '',
        partySize: 1,
        status: 'Confirmed',
        channel: 'Website',
        notes: '',
      });
    } finally {
      setCreateSaving(false);
    }
  };

  const openDayList = (day: number, items: BookingData[] | undefined) => {
    if (!day || !items?.length) {
      setDayList({
        dateLabel: formatDate(computeDateKey(calendarCursor.getFullYear(), calendarCursor.getMonth(), day), language),
        isoDate: computeDateKey(calendarCursor.getFullYear(), calendarCursor.getMonth(), day),
        bookings: items || [],
      });
      return;
    }
    const iso = computeDateKey(calendarCursor.getFullYear(), calendarCursor.getMonth(), day);
    const label = formatDate(iso, language);
    setDayList({ dateLabel: label, isoDate: iso, bookings: items });
  };

  const resetFilters = () => {
    setStatus('All');
    setChannel('All');
    setPeriod('all');
    setSort('date_desc');
    setSearchTerm('');
  };

  const heroStats = [
    {
      label: t('dashboard.cards.bookings.title') || 'Total bookings',
      value: totals.total,
      delta: filteredTotals.total,
      icon: <CalendarDays className="h-5 w-5 text-white/70" />,
    },
    {
      label: t('bookings.statuses.confirmed') || 'Confirmed',
      value: totals.confirmed,
      delta: filteredTotals.confirmed,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
    },
    {
      label: t('bookings.statuses.pending') || 'Pending',
      value: totals.pending,
      delta: filteredTotals.pending,
      icon: <Clock3 className="h-5 w-5 text-amber-300" />,
    },
    {
      label: t('bookings.statuses.cancelled') || 'Cancelled',
      value: totals.cancelled,
      delta: filteredTotals.cancelled,
      icon: <XCircle className="h-5 w-5 text-rose-300" />,
    },
  ];

  const periodOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: t('bookings.filters.allTime') },
    { value: '7d', label: t('bookings.filters.last7') },
    { value: '30d', label: t('bookings.filters.last30') },
    { value: 'month', label: t('bookings.filters.thisMonth') },
  ];

  const sortOptions: Array<{ value: string; label: string }> = [
    { value: 'date_desc', label: t('bookings.filters.dateDesc') },
    { value: 'date_asc', label: t('bookings.filters.dateAsc') },
    { value: 'name_asc', label: t('bookings.filters.nameAsc') },
  ];

  const statusOptions = [
    { value: 'All', label: t('bookings.filters.all'), count: totals.total },
    { value: 'Confirmed', label: t('bookings.statuses.confirmed'), count: totals.confirmed },
    { value: 'Pending', label: t('bookings.statuses.pending'), count: totals.pending },
    { value: 'cancelled', label: t('bookings.statuses.cancelled'), count: totals.cancelled },
  ];

  const filteredChannelBreakdown = useMemo(() => {
    return Array.from(filteredTotals.channelMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredTotals.channelMap]);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),transparent_45%)]" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/90">
              {t('bookings.title')}
            </span>
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">{t('bookings.title')}</h1>
              <p className="mt-3 text-sm text-slate-200/80 md:text-base">
                {t('bookings.hero.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200/70">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {filteredTotals.total} / {totals.total} {t('bookings.metrics.visibleBadge')}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {channel === 'All'
                  ? t('bookings.metrics.selectedChannelAll')
                  : `${t('bookings.metrics.selectedChannelPrefix')} · ${channel}`}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {periodOptions.find((opt) => opt.value === period)?.label || period}
              </span>
            </div>
          </div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-lg backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-center justify-between text-xs font-medium text-slate-200/70">
                  <span>{item.label}</span>
                  {item.icon}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{item.value}</span>
                  <span className="text-xs text-slate-200/70">{item.delta} shown</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            {t('bookings.new')}
          </button>
          <a
            href={`/${language}/dashboard`}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20"
          >
            {t('nav.dashboard')}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('bookings.filters.smartTitle')}</p>
                <p className="text-xs text-slate-500">{t('bookings.filters.smartDescription')}</p>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('bookings.filters.searchPlaceholder')}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  {t('bookings.filters.reset')}
                </button>
              </div>
            </div>
            <div className="mt-5 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('bookings.filters.status')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        status === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={status === opt.value ? 'text-white/80' : 'text-slate-400'}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('bookings.filters.channel')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {channelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setChannel(opt.value === 'All' ? 'All' : opt.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        channel === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.value}</span>
                      <span className={channel === opt.value ? 'text-white/80' : 'text-slate-400'}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('bookings.filters.period')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {periodOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPeriod(opt.value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                          period === opt.value
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('bookings.filters.sort')}</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="mt-2 w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition focus:border-slate-400 focus:bg-white"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('bookings.recent.title')}</h2>
                <p className="text-xs text-slate-500">
                  {filteredTotals.total} {t('bookings.table.filteredCountSuffix')}
                </p>
              </div>
              <a
                href={`/${language}/bookings`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                {t('bookings.recent.viewAll')}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <div className="hidden min-h-[300px] overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-3">{t('bookings.table.name')}</th>
                    <th className="px-6 py-3">{t('bookings.table.date')}</th>
                    <th className="px-6 py-3">{t('bookings.table.status')}</th>
                    <th className="px-6 py-3">{t('bookings.table.channel')}</th>
                    <th className="px-6 py-3">{t('dashboard.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.length ? (
                    filtered.map((booking) => (
                      <tr key={booking.id || `${booking.name}-${booking.date}`} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4 text-slate-900">
                          <div className="font-medium">{booking.name || '—'}</div>
                          <div className="text-xs text-slate-500">{booking.phone || booking.notes}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{formatDate(booking.date, language)}</div>
                          {booking.time && <div className="text-xs text-slate-400">{booking.time}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4">
                          <ChannelBadge channel={booking.channel} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => booking.id && setDetails({ ...(booking as any), id: booking.id })}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                              {t('bookings.calendar.details')}
                            </button>
                            <button
                              disabled={!booking.id || updatingId === booking.id}
                              onClick={() => booking.id && handleStatusChange(booking.id, 'Confirmed')}
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {t('bookings.details.actions.confirm')}
                            </button>
                            <button
                              disabled={!booking.id || updatingId === booking.id}
                              onClick={() => booking.id && handleStatusChange(booking.id, 'cancelled')}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {t('bookings.details.actions.cancel')}
                            </button>
                            <button
                              onClick={() => booking.id && setDetails({ ...(booking as any), id: booking.id })}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                              {t('bookings.details.actions.reschedule')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="mx-auto h-16 w-16 rounded-full border border-dashed border-slate-200" />
                        <p className="mt-4 text-sm font-medium text-slate-500">{t('dashboard.loadingBookings')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 p-5 text-sm md:hidden">
              {filtered.length ? (
                filtered.map((booking, idx) => (
                  <div key={booking.id || `${booking.name}-${idx}`} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{booking.name || '—'}</p>
                        <p className="text-xs text-slate-500">{formatDate(booking.date, language)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <p className="font-semibold text-slate-600">{t('bookings.table.channel')}</p>
                        <div className="mt-1">
                          <ChannelBadge channel={booking.channel} />
                        </div>
                      </div>
                      {booking.time && (
                        <div>
                          <p className="font-semibold text-slate-600">{t('bookings.details.time')}</p>
                          <p className="mt-1">{booking.time}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <button
                        type="button"
                        onClick={() => booking.id && setDetails({ ...(booking as any), id: booking.id })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        {t('bookings.calendar.details')}
                      </button>
                      <button
                        type="button"
                        disabled={!booking.id || updatingId === booking.id}
                        onClick={() => booking.id && handleStatusChange(booking.id, 'Confirmed')}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t('bookings.details.actions.confirm')}
                      </button>
                      <button
                        type="button"
                        disabled={!booking.id || updatingId === booking.id}
                        onClick={() => booking.id && handleStatusChange(booking.id, 'cancelled')}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t('bookings.details.actions.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={() => booking.id && setDetails({ ...(booking as any), id: booking.id })}
                        className="rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        {t('bookings.details.actions.reschedule')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-xs text-slate-500">
                  <div className="mx-auto h-2 w-1/2 rounded bg-slate-100 animate-pulse" />
                  <p className="mt-3 text-slate-400">{t('dashboard.loadingBookings')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{t('bookings.calendar.title')}</h3>
                <p className="text-xs text-slate-500">{t('bookings.calendar.helper')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-slate-700">{calendarMonthLabel}</span>
                <button
                  onClick={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              <div>{t('bookings.calendar.daysShort.S')}</div>
              <div>{t('bookings.calendar.daysShort.M')}</div>
              <div>{t('bookings.calendar.daysShort.T')}</div>
              <div>{t('bookings.calendar.daysShort.W')}</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarMatrix.map((cell, idx) => {
                if (cell.day == null) {
                  return <div key={`pad-${idx}`} className="h-16 rounded-xl bg-slate-50" />;
                }
                const isSelected = dayList?.isoDate === computeDateKey(calendarCursor.getFullYear(), calendarCursor.getMonth(), cell.day);
                const totalsForDay = cell.data;
                return (
                  <button
                    key={`day-${cell.day}`}
                    onClick={() => openDayList(cell.day!, totalsForDay?.bookings)}
                    className={`relative flex h-16 flex-col rounded-xl border p-2 text-left transition ${
                      isSelected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-semibold">{cell.day}</span>
                    {totalsForDay ? (
                      <div className={`mt-auto grid grid-cols-3 gap-1 text-[10px] ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                        <span className="rounded-full bg-emerald-500/10 px-1 py-0.5 text-center">{totalsForDay.confirmed}</span>
                        <span className="rounded-full bg-amber-500/10 px-1 py-0.5 text-center">{totalsForDay.pending}</span>
                        <span className="rounded-full bg-rose-500/10 px-1 py-0.5 text-center">{totalsForDay.cancelled}</span>
                      </div>
                    ) : (
                      <span className={`mt-auto text-[10px] ${isSelected ? 'text-white/70' : 'text-slate-300'}`}>—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('bookings.channelMix.title')}</h3>
            <p className="text-xs text-slate-500">{t('bookings.channelMix.helper')}</p>
            <div className="mt-4 space-y-3">
              {filteredChannelBreakdown.length ? (
                filteredChannelBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
                  {t('bookings.channelMix.empty')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t('bookings.details.title')}</h3>
              <button onClick={() => setDetails(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.name')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.phone')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.phone || ''}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.date')}</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.date || ''}
                  onChange={(e) => setDetails({ ...details, date: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.time')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.time || ''}
                  onChange={(e) => setDetails({ ...details, time: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.partySize')}</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.partySize || 1}
                  onChange={(e) => setDetails({ ...details, partySize: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.status')}</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.status}
                  onChange={(e) => setDetails({ ...details, status: e.target.value as BookingData['status'] })}
                >
                  <option value="Confirmed">{t('bookings.statuses.confirmed')}</option>
                  <option value="Pending">{t('bookings.statuses.pending')}</option>
                  <option value="cancelled">{t('bookings.statuses.cancelled')}</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.channel')}</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={details.channel}
                  onChange={(e) => setDetails({ ...details, channel: e.target.value })}
                >
                  <option value="Call">Call</option>
                  <option value="Phone">Phone</option>
                  <option value="Website">Website</option>
                  <option value="Chat">Chat</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </label>
              <label className="md:col-span-2 text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.notes')}</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  rows={3}
                  value={details.notes || ''}
                  onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  disabled={!details?.id || updatingId === details.id}
                  onClick={() => details?.id && handleStatusChange(details.id, 'Confirmed')}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('bookings.details.actions.confirm')}
                </button>
                <button
                  disabled={!details?.id || updatingId === details.id}
                  onClick={() => details?.id && handleStatusChange(details.id, 'cancelled')}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('bookings.details.actions.cancel')}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetails(null)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  {t('bookings.details.actions.close')}
                </button>
                <button
                  disabled={detailsSaving}
                  onClick={handleDetailsSave}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {detailsSaving ? '…' : t('bookings.details.actions.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dayList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{dayList.dateLabel}</h3>
                <p className="text-xs text-slate-500">
                  {dayList.bookings.length} {t('bookings.dayList.countLabel')}
                </p>
              </div>
              <button onClick={() => setDayList(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="divide-y divide-slate-200">
              {dayList.bookings.length ? (
                dayList.bookings.map((b) => (
                  <div key={b.id || `${b.name}-${b.date}`} className="flex flex-wrap items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(b.date, language)} · {b.channel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.id && (
                        <>
                          <button
                            onClick={() => setDetails({ ...(b as any), id: b.id as string })}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                          >
                            {t('bookings.calendar.details')}
                          </button>
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => b.id && handleStatusChange(b.id, 'Confirmed')}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {t('bookings.details.actions.confirm')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-sm text-slate-500">{t('bookings.dayList.empty')}</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setDayList(null)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
                {t('bookings.details.actions.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t('bookings.new')}</h3>
              <button onClick={() => setShowNew(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.name')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.phone')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.date')}</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.time')}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.time}
                  onChange={(e) => setNewForm({ ...newForm, time: e.target.value })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.partySize')}</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.partySize}
                  onChange={(e) => setNewForm({ ...newForm, partySize: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.status')}</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.status}
                  onChange={(e) => setNewForm({ ...newForm, status: e.target.value as BookingData['status'] })}
                >
                  <option value="Confirmed">{t('bookings.statuses.confirmed')}</option>
                  <option value="Pending">{t('bookings.statuses.pending')}</option>
                  <option value="cancelled">{t('bookings.statuses.cancelled')}</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.channel')}</span>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  value={newForm.channel}
                  onChange={(e) => setNewForm({ ...newForm, channel: e.target.value })}
                >
                  <option value="Website">Website</option>
                  <option value="Call">Call</option>
                  <option value="Phone">Phone</option>
                  <option value="Chat">Chat</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </label>
              <label className="md:col-span-2 text-sm text-slate-600">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-slate-500">{t('bookings.details.notes')}</span>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                  rows={3}
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                {t('bookings.details.actions.close')}
              </button>
              <button
                disabled={createSaving || !newForm.name.trim() || !newForm.date.trim()}
                onClick={handleCreateBooking}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createSaving ? '…' : t('bookings.details.actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
