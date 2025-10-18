'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  RefreshCw,
  Download,
  Share2,
  Phone,
  Clock3,
  Filter,
  Minus
} from 'lucide-react';

interface Call {
  id: string;
  callId: string;
  phoneNumber?: string;
  status: string;
  duration?: number;
  endedReason?: string;
  transcript?: string;
  summary?: string;
  analysis?: any;
  createdAt: string | Date;
  type: string;
}

export default function CallsList() {
  const { t } = useLanguage();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ended' | 'in-progress' | 'failed'>('all');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Загрузка звонков из Firebase
  const loadCalls = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/logs?type=call_summary&limit=40');
      const data = await response.json();
      
      if (data.success) {
        setCalls(data.logs || []);
        setLastSyncedAt(new Date());
      } else {
        setError(data.error || 'Failed to load calls');
      }
    } catch (err) {
      setError('Failed to load calls');
      console.error('Error loading calls:', err);
    } finally {
      setLoading(false);
    }
  };

  // Синхронизация с Vapi
  const syncWithVapi = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/vapi/calls?sync=true&limit=50');
      const data = await response.json();
      
      if (data.success) {
        await loadCalls(); // Перезагружаем список
        console.log('✅ Synced with Vapi successfully');
        setLastSyncedAt(new Date());
      } else {
        setError(data.error || 'Failed to sync with Vapi');
      }
    } catch (err) {
      setError('Failed to sync with Vapi');
      console.error('Error syncing with Vapi:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ended':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resolveLabel = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const filteredCalls = useMemo(() => {
    return calls
      .filter((call) => {
        if (statusFilter !== 'all' && call.status !== statusFilter) return false;
        if (!searchTerm.trim()) return true;
        const query = searchTerm.toLowerCase();
        return (
          call.callId.toLowerCase().includes(query) ||
          (call.phoneNumber || 'n/a').toLowerCase().includes(query) ||
          (call.summary || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [calls, statusFilter, searchTerm]);

  const metrics = useMemo(() => {
    const total = calls.length;
    const ended = calls.filter((c) => c.status === 'ended').length;
    const failed = calls.filter((c) => c.status === 'failed').length;
    const withDuration = calls.filter((c) => typeof c.duration === 'number' && c.duration > 0);
    const totalDuration = withDuration.reduce((sum, c) => sum + (c.duration || 0), 0);
    const avgDuration = withDuration.length ? totalDuration / withDuration.length : 0;
    return { total, ended, failed, avgDuration };
  }, [calls]);

  const handleExport = async () => {
    if (!filteredCalls.length) {
      setError('Nothing to export yet');
      return;
    }
    setError(null);
    const header = ['callId', 'phoneNumber', 'status', 'duration', 'createdAt'];
    const rows = filteredCalls.map((call) => [
      call.callId,
      call.phoneNumber || 'N/A',
      call.status,
      call.duration ? `${call.duration}` : 'N/A',
      new Date(call.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vapi-calls-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const shareText = `Latest ${filteredCalls.length} calls captured via Vapi.`;
      if (navigator.share) {
        await navigator.share({ title: 'Recent Calls Snapshot', text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setError(null);
    } catch (err) {
      console.error('Share failed', err);
      setError('Could not share snapshot');
    }
  };

  const statusFilters: Array<{ label: string; value: 'all' | 'ended' | 'in-progress' | 'failed' }> = [
    { label: 'All', value: 'all' },
    { label: 'Ended', value: 'ended' },
    { label: 'In progress', value: 'in-progress' },
    { label: 'Failed', value: 'failed' },
  ];

  const renderLoading = () => (
    <div className="p-6 space-y-4">
      <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/60">{resolveLabel('dashboard.recentCalls.title', 'Recent Calls')}</p>
            <h3 className="text-2xl font-semibold mt-1">Vapi activity stream</h3>
            <p className="mt-2 text-sm text-white/70">
              {lastSyncedAt
                ? `Last synced ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Sync now to pull the freshest call transcripts.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={syncWithVapi}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync with Vapi
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <Share2 className="h-4 w-4" />
              Share snapshot
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 shadow-inner">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total captured</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-900">{metrics.total}</span>
              <span className="text-xs text-slate-400">calls</span>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-inner">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Ended successfully</p>
            <div className="mt-2 flex items-baseline gap-2 text-emerald-700">
              <span className="text-2xl font-semibold">{metrics.ended}</span>
              <span className="text-xs text-emerald-500">calls</span>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-inner">
            <p className="text-xs font-medium uppercase tracking-wide text-rose-600">Failed calls</p>
            <div className="mt-2 flex items-baseline gap-2 text-rose-700">
              <span className="text-2xl font-semibold">{metrics.failed}</span>
              <span className="text-xs text-rose-500">alerts</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-inner">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Average duration</p>
            <div className="mt-2 flex items-center gap-2 text-slate-900">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <span className="text-lg font-semibold">
                {metrics.avgDuration ? formatDuration(Math.round(metrics.avgDuration)) : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by call ID, phone, or summary"
              className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <Filter className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === item.value
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {statusFilter === item.value ? <Phone className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          renderLoading()
        ) : filteredCalls.length ? (
          <>
            <div className="hidden w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Call ID</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3">Summary</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm text-slate-700">
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">
                        {call.callId.slice(0, 10)}
                      </td>
                      <td className="px-6 py-3 text-slate-900">
                        {call.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(call.status)}`}>
                          <Phone className="h-3.5 w-3.5" />
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {call.duration ? formatDuration(call.duration) : '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {formatDate(call.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {call.summary ? call.summary.slice(0, 70) + (call.summary.length > 70 ? '…' : '') : '—'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => console.log('Call details:', call)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {filteredCalls.map((call) => (
                <div key={call.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-600">{call.callId.slice(0, 10)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(call.status)}`}>
                      {call.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {call.phoneNumber || 'N/A'}</p>
                    <p className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> {call.duration ? formatDuration(call.duration) : '—'}</p>
                    <p>{formatDate(call.createdAt)}</p>
                  </div>
                  {call.summary && (
                    <p className="mt-3 text-sm text-slate-600">
                      {call.summary.slice(0, 120)}{call.summary.length > 120 ? '…' : ''}
                    </p>
                  )}
                  <button
                    onClick={() => console.log('Call details:', call)}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    View full call
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Phone className="h-6 w-6" />
            </div>
            <p className="mt-4 text-lg font-semibold text-slate-900">No calls just yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Trigger a sync to import the latest call summaries from Vapi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
