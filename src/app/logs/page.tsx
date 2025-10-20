"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ArrowUpRight, Filter, MessagesSquare, Search, Sparkles, Table, XCircle } from 'lucide-react';
import { db } from '@/app/lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

type TranscriptTurn = {
  role: string;
  message: string;
};

type LogItem = {
  id: string;
  timestamp?: string;
  createdAt?: Date | null;
  channel?: string;
  status?: string;
  intent?: string;
  summary?: string;
  bookingId?: string;
  dialog?: TranscriptTurn[];
  [key: string]: any;
};

type Summary = {
  total: number;
  channels: number;
  statuses: number;
  channelMap: Map<string, number>;
};

const channelStyles: Record<string, string> = {
  call: 'bg-blue-500/10 text-blue-600 ring-blue-500/30',
  phone: 'bg-blue-500/10 text-blue-600 ring-blue-500/30',
  website: 'bg-purple-500/10 text-purple-600 ring-purple-500/30',
  chat: 'bg-sky-500/10 text-sky-600 ring-sky-500/30',
  whatsapp: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30',
  sms: 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/30',
  email: 'bg-amber-500/10 text-amber-600 ring-amber-500/30',
};

const resolveStatusTone = (status?: string) => {
  if (!status) return 'bg-slate-200 text-slate-700 ring-slate-300';
  const value = status.toLowerCase();
  if (value.includes('success') || value.includes('complete') || value.includes('confirmed')) {
    return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30';
  }
  if (value.includes('fail') || value.includes('error') || value.includes('cancel')) {
    return 'bg-rose-500/10 text-rose-600 ring-rose-500/30';
  }
  if (value.includes('pending') || value.includes('queue') || value.includes('processing')) {
    return 'bg-amber-500/10 text-amber-600 ring-amber-500/30';
  }
  return 'bg-slate-200 text-slate-700 ring-slate-300';
};

const formatTimestamp = (value: Date | string | undefined | null, locale: string) => {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (err) {
    return date.toISOString();
  }
};

const buildSummary = (items: LogItem[]): Summary => {
  const channelMap = new Map<string, number>();
  const statusSet = new Set<string>();
  const channelSet = new Set<string>();

  items.forEach((item) => {
    const key = (item.channel || 'Unknown').trim() || 'Unknown';
    channelMap.set(key, (channelMap.get(key) || 0) + 1);
    if (key) channelSet.add(key);
    if (item.status) statusSet.add(item.status);
  });

  return {
    total: items.length,
    channels: channelSet.size,
    statuses: statusSet.size,
    channelMap,
  };
};

const normalizeDialog = (log: LogItem) => log.dialog || [];

export default function LogsPage() {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selected, setSelected] = useState<LogItem | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      const rows: LogItem[] = snap.docs.map((docu) => {
        const data = docu.data() as any;
        const createdAt: Date | null = data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : null);
        return {
          id: docu.id,
          ...data,
          createdAt,
          timestamp: data.timestamp || (createdAt ? createdAt.toISOString() : undefined),
        };
      });
      setLogs(rows);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const buildSearchText = (log: LogItem) =>
    [
      log.timestamp,
      log.channel,
      log.status,
      log.intent,
      log.summary,
      log.bookingId,
      ...normalizeDialog(log).map((turn) => `${turn.role}: ${turn.message}`),
    ]
      .filter(Boolean)
      .join(' \n ')
      .toLowerCase();

  const matchesChannel = (log: LogItem, target: string) =>
    target === 'All' || (log.channel || '').toLowerCase() === target.toLowerCase();

  const matchesStatus = (log: LogItem, target: string) =>
    target === 'All' || (log.status || '').toLowerCase() === target.toLowerCase();

  const matchesSearch = (log: LogItem, term: string) => {
    if (!term) return true;
    return buildSearchText(log).includes(term);
  };

  const channelOptions = useMemo(() => {
    const base = logs.filter(
      (log) => matchesStatus(log, statusFilter) && matchesSearch(log, debouncedSearch)
    );
    const counts = new Map<string, number>();
    base.forEach((log) => {
      const name = (log.channel || 'Unknown').trim() || 'Unknown';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const items = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    return [{ value: 'All', count: base.length }, ...items];
  }, [logs, statusFilter, debouncedSearch]);

  const statusOptions = useMemo(() => {
    const base = logs.filter(
      (log) => matchesChannel(log, channelFilter) && matchesSearch(log, debouncedSearch)
    );
    const counts = new Map<string, number>();
    base.forEach((log) => {
      const key = (log.status || '—').trim() || '—';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const items = Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    return [{ value: 'All', count: base.length }, ...items];
  }, [logs, channelFilter, debouncedSearch]);

  const filteredLogs = useMemo(() => {
    if (!logs.length) return [];
    return logs.filter(
      (log) =>
        matchesChannel(log, channelFilter) &&
        matchesStatus(log, statusFilter) &&
        matchesSearch(log, debouncedSearch)
    );
  }, [logs, channelFilter, statusFilter, debouncedSearch]);

  const overallSummary = useMemo(() => buildSummary(logs), [logs]);
  const filteredSummary = useMemo(() => buildSummary(filteredLogs), [filteredLogs]);

  const heroStats = useMemo(
    () => [
      {
        label: t('logs.metrics.total'),
        value: overallSummary.total,
        helper: t('logs.metrics.totalHelper'),
        icon: <Sparkles className="h-5 w-5 text-white/70" />,
      },
      {
        label: t('logs.metrics.filtered'),
        value: filteredSummary.total,
        helper: t('logs.metrics.filteredHelper'),
        icon: <Search className="h-5 w-5 text-white/70" />,
      },
      {
        label: t('logs.metrics.channels'),
        value: filteredSummary.channels,
        helper: t('logs.metrics.channelsHelper'),
        icon: <MessagesSquare className="h-5 w-5 text-white/70" />,
      },
      {
        label: t('logs.metrics.statuses'),
        value: filteredSummary.statuses,
        helper: t('logs.metrics.statusesHelper'),
        icon: <Filter className="h-5 w-5 text-white/70" />,
      },
    ],
    [overallSummary, filteredSummary, t]
  );

  const channelBreakdown = useMemo(() => {
    return Array.from(filteredSummary.channelMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredSummary]);

  const timelineLogs = useMemo(() => filteredLogs.slice(0, 8), [filteredLogs]);

  const resetFilters = () => {
    setChannelFilter('All');
    setStatusFilter('All');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),transparent_45%)]" aria-hidden />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/90">
              {t('logs.title')}
            </span>
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">{t('logs.title')}</h1>
              <p className="mt-3 text-sm text-slate-200/80 md:text-base">{t('logs.hero.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200/70">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {filteredSummary.total} / {overallSummary.total} {t('logs.metrics.badgeVisible')}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {channelFilter === 'All' ? t('logs.filters.allChannels') : `${t('logs.filters.channel')} · ${channelFilter}`}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {statusFilter === 'All' ? t('logs.filters.allStatuses') : `${t('logs.filters.status')} · ${statusFilter}`}
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
                  <span className="text-xs text-slate-200/70">{item.helper}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <a
            href={`/${language}/dashboard`}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20"
          >
            {t('logs.hero.ctaDashboard')}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('logs.filters.title')}</p>
                <p className="text-xs text-slate-500">{t('logs.filters.helper')}</p>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('logs.filters.searchPlaceholder')}
                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  <XCircle className="h-4 w-4" />
                  {t('logs.filters.reset')}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('logs.filters.channel')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {channelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setChannelFilter(opt.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        channelFilter === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.value}</span>
                      <span className={channelFilter === opt.value ? 'text-white/80' : 'text-slate-400'}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('logs.filters.status')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                        statusFilter === opt.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.value}</span>
                      <span className={statusFilter === opt.value ? 'text-white/80' : 'text-slate-400'}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('logs.table.headline')}</h2>
                <p className="text-xs text-slate-500">{t('logs.table.helper')}</p>
              </div>
            </div>
            <div className="hidden min-h-[320px] overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-3">{t('logs.table.timestamp')}</th>
                    <th className="px-6 py-3">{t('logs.table.channel')}</th>
                    <th className="px-6 py-3">{t('logs.table.summary')}</th>
                    <th className="px-6 py-3">{t('logs.table.status')}</th>
                    <th className="px-6 py-3">{t('logs.table.booking')}</th>
                    <th className="px-6 py-3 text-right">{t('logs.table.view')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.length ? (
                    filteredLogs.map((log) => {
                      const channelKey = log.channel?.toLowerCase?.() || 'unknown';
                      const channelClass = channelStyles[channelKey] || 'bg-slate-200 text-slate-700 ring-slate-300';
                      const turns = normalizeDialog(log);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatTimestamp(log.createdAt || log.timestamp, language)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${channelClass}`}>
                              {log.channel || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {turns.length ? (
                              <div className="space-y-1">
                                {turns.slice(0, 2).map((turn, idx) => (
                                  <div key={idx} className="text-xs text-slate-600">
                                    <span className="font-medium text-slate-800">{turn.role}:</span> {turn.message}
                                  </div>
                                ))}
                                {turns.length > 2 && (
                                  <div className="text-xs text-slate-400">+{turns.length - 2} {t('logs.table.moreTurns')}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">{t('logs.detail.noDialog')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${resolveStatusTone(log.status)}`}>
                              {log.status || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {log.bookingId ? (
                              <a
                                href={`/${language}/bookings?bookingId=${log.bookingId}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                              >
                                {t('logs.detail.bookingLink')}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelected(log)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                              {t('logs.table.view')}
                              <Table className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        {logs.length ? (
                          <p className="text-sm font-medium text-slate-500">{t('logs.noResults')}</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="mx-auto h-16 w-16 rounded-full border border-dashed border-slate-200" />
                            <p className="text-sm font-medium text-slate-500">{t('logs.empty')}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 p-5 text-sm md:hidden">
              {filteredLogs.length ? (
                filteredLogs.map((log) => {
                  const channelKey = log.channel?.toLowerCase?.() || 'unknown';
                  const channelClass = channelStyles[channelKey] || 'bg-slate-200 text-slate-700 ring-slate-300';
                  const turns = normalizeDialog(log);
                  return (
                    <div key={log.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{formatTimestamp(log.createdAt || log.timestamp, language)}</p>
                          <div className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset ${channelClass}`}>
                            {log.channel || '—'}
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${resolveStatusTone(log.status)}`}>
                          {log.status || '—'}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        {turns.length ? (
                          turns.slice(0, 2).map((turn, idx) => (
                            <p key={idx}>
                              <span className="font-semibold text-slate-800">{turn.role}:</span> {turn.message}
                            </p>
                          ))
                        ) : (
                          <p className="text-slate-400">{t('logs.detail.noDialog')}</p>
                        )}
                        {turns.length > 2 && (
                          <p className="text-[11px] text-slate-400">+{turns.length - 2} {t('logs.table.moreTurns')}</p>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
                        {log.bookingId ? (
                          <a
                            href={`/${language}/bookings?bookingId=${log.bookingId}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            {t('logs.detail.bookingLink')}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setSelected(log)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          {t('logs.table.view')}
                          <Table className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-xs text-slate-500">
                  {logs.length ? t('logs.noResults') : t('logs.empty')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('logs.channelMix.title')}</h3>
            <p className="text-xs text-slate-500">{t('logs.channelMix.helper')}</p>
            <div className="mt-4 space-y-3">
              {channelBreakdown.length ? (
                channelBreakdown.map((item) => (
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
                  {t('logs.channelMix.empty')}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('logs.timeline.title')}</h3>
            <p className="text-xs text-slate-500">{t('logs.timeline.helper')}</p>
            <div className="mt-4 space-y-4">
              {timelineLogs.length ? (
                timelineLogs.map((log) => (
                  <button
                    key={`timeline-${log.id}`}
                    onClick={() => setSelected(log)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-slate-100"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatTimestamp(log.createdAt || log.timestamp, language)}</span>
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                        {log.status || '—'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{log.channel || '—'}</span>
                      {log.intent && <span className="text-xs text-slate-500">{log.intent}</span>}
                    </div>
                    {log.dialog?.[0]?.message && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{log.dialog[0].message}</p>
                    )}
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-500">
                  {t('logs.timeline.empty')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{t('logs.detail.title')}</h3>
                <p className="text-xs text-slate-500">{formatTimestamp(selected.createdAt || selected.timestamp, language)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('logs.table.channel')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.channel || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('logs.table.status')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.status || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('logs.detail.intent')}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selected.intent || '—'}</p>
              </div>
            </div>

            {selected.bookingId && (
              <div className="mt-4">
                <a
                  href={`/${language}/bookings?bookingId=${selected.bookingId}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {t('logs.detail.bookingLink')}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="mt-6 max-h-[360px] space-y-3 overflow-y-auto pr-2">
              {normalizeDialog(selected).length ? (
                normalizeDialog(selected).map((turn, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {turn.role === 'assistant'
                        ? t('logs.detail.ai')
                        : turn.role === 'user'
                        ? t('logs.detail.guest')
                        : t('logs.detail.unknown')}
                    </p>
                    <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{turn.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  {t('logs.detail.noDialog')}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                {t('logs.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
