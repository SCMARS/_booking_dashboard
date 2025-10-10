'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, orderBy, query, limit, getCountFromServer, where, Timestamp, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Home, 
  Calendar, 
  FileText, 
  BookOpen, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      const rows: BookingData[] = snap.docs.map((d) => ({ 
        id: d.id, 
        ...(d.data() as Omit<BookingData, 'id'>) 
      }));
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
 
        const [totalSnap, confirmedSnap, pendingSnap] = await Promise.all([
          getCountFromServer(query(bookingsCol)),
          getCountFromServer(query(bookingsCol, where('status', '==', 'Confirmed'))),
          getCountFromServer(query(bookingsCol, where('status', '==', 'Pending'))),
        ]);
 
        if (!isActive) return;
        setTotalBookings(totalSnap.data().count || 0);
        setConfirmedCount(confirmedSnap.data().count || 0);
        setPendingCount(pendingSnap.data().count || 0);
        try {
          const [bookingsCallSnap, logsCallSnap] = await Promise.all([
            getCountFromServer(query(bookingsCol, where('channel', '==', 'Call'), where('createdAt', '>=', since))),
            getCountFromServer(query(logsCol, where('channel', '==', 'Call'), where('createdAt', '>=', since))),
          ]);
          if (!isActive) return;
          const bookingsCall = bookingsCallSnap.data().count || 0;
          const logsCall = logsCallSnap.data().count || 0;
          const pct = logsCall > 0 ? Math.round((bookingsCall / logsCall) * 1000) / 10 : 0;
          setCallConversion(pct);
        } catch {
          if (!isActive) return;
          setCallConversion(null);
        }
 
        // Use count API for funnel numbers
        const [callsCount, intentsCount, bookingsCount] = await Promise.all([
          getCountFromServer(query(logsCol, where('createdAt', '>=', since))),
          getCountFromServer(query(logsCol, where('status', '==', 'intent_detected'), where('createdAt', '>=', since))),
          getCountFromServer(query(bookingsCol, where('createdAt', '>=', since))),
        ]);
        if (!isActive) return;
        const calls = callsCount.data().count || 0;
        const intents = intentsCount.data().count || 0;
        const bookings = bookingsCount.data().count || 0;
        setFunnel({ calls, intents, bookings });
 
        // Channel breakdown via counts (3 channels x 2 counts)
        const channels = ['Call', 'Website', 'WhatsApp'];
        const channelPromises = channels.map((ch) => Promise.all([
          getCountFromServer(query(logsCol, where('channel', '==', ch), where('createdAt', '>=', since))),
          getCountFromServer(query(bookingsCol, where('channel', '==', ch), where('createdAt', '>=', since))),
        ]));
        const channelSnaps = await Promise.all(channelPromises);
        if (!isActive) return;
        setChannelStats(channelSnaps.map(([cSnap, bSnap], idx) => {
          const callsV = cSnap.data().count || 0;
          const booksV = bSnap.data().count || 0;
          const conv = callsV > 0 ? Math.round((booksV / callsV) * 1000) / 10 : 0;
          return { channel: channels[idx], calls: callsV, bookings: booksV, conversion: conv };
        }));
 
        // Fetch limited logs for AHT and Heatmap only (to reduce payload)
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

  const recentLogsLeft: LogData[] = [
    { text: 'I would like to book a table', intent: 'booking' },
    { text: 'Make a reservation', intent: 'booking' },
  ];

  const recentLogsRight: LogData[] = [
    { text: 'Make a reservation', intent: 'Call', channel: 'Call' },
    { text: 'Table for 5', intent: 'Chat', channel: 'Chat' },
  ];

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

  return (
    <div className="max-w-full">
      {/* Main Content */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">{t('dashboard.title')}</h1>

        {/* Period Filter */}
        <div className="flex items-center justify-end mb-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={`${period === 'today' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'} px-3 py-1.5 text-xs md:text-sm rounded-full transition-colors`}
            >
              {t('dashboard.period.today')}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              className={`${period === '7d' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'} px-3 py-1.5 text-xs md:text-sm rounded-full transition-colors`}
            >
              {t('dashboard.period.last7')}
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={`${period === '30d' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'} px-3 py-1.5 text-xs md:text-sm rounded-full transition-colors`}
            >
              {t('dashboard.period.last30')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <button
              onClick={handleViewAllBookings}
              onKeyPress={(e) => handleKeyPress(e, handleViewAllBookings)}
            className="group text-left bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow md:hover:shadow-md transition-all"
          >
            <div className="text-xs md:text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">B</span>
              {t('dashboard.totalBookings')}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{totalBookings}</div>
            <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-500 transition-colors">{t('dashboard.viewDetails')}</div>
          </button>
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-xs md:text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">S</span>
              {t('dashboard.confirmedPending')}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{confirmedCount} / {pendingCount}</div>
            <div className="mt-2 text-xs text-gray-400">{t('dashboard.todaysSnapshot')}</div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="text-xs md:text-sm text-gray-500 mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-600">C</span>
              {t('dashboard.callsConversion')}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{callConversion == null ? '—' : `${callConversion}%`}</div>
            <div className="mt-2 text-xs text-gray-400">{t('dashboard.last30Days')}</div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.funnel.title') || 'Funnel'}</h2>
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">{t('dashboard.funnel.calls') || 'Calls'}</div>
              <div className="text-2xl font-bold text-gray-900">{funnel.calls}</div>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">{t('dashboard.funnel.intents') || 'Intents'}</div>
              <div className="text-2xl font-bold text-gray-900">{funnel.intents}</div>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="text-xs text-gray-500 mb-1">{t('dashboard.funnel.bookings') || 'Bookings'}</div>
              <div className="text-2xl font-bold text-gray-900">{funnel.bookings}</div>
            </div>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.channels.title') || 'Channels'}</h2>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('dashboard.channels.headers.channel') || 'Channel'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('dashboard.channels.headers.calls') || 'Calls'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('dashboard.channels.headers.bookings') || 'Bookings'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">{t('dashboard.channels.headers.conversion') || 'Conversion'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {channelStats.map((row) => (
                  <tr key={row.channel}>
                    <td className="px-4 py-3 text-sm text-gray-800">{row.channel}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{row.calls}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{row.bookings}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{row.conversion}%</td>
                  </tr>
                ))}
                {!channelStats.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">{t('dashboard.noData') || 'No data'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1">Average call duration (AHT)</div>
            <div className="text-2xl font-bold text-gray-900">{kpi.ahtSec == null ? '—' : `${kpi.ahtSec}s`}</div>
            <div className="text-xs text-gray-400">{t('dashboard.kpi.byPeriod') || 'By period'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1">Confirmed / Cancelled</div>
            <div className="text-2xl font-bold text-gray-900">{kpi.confirmed} / {kpi.cancelled}</div>
            <div className="text-xs text-gray-400">By period</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-xs text-gray-500 mb-1">No-show</div>
            <div className="text-2xl font-bold text-gray-900">—</div>
            <div className="text-xs text-gray-400">Placeholder</div>
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Load heatmap</h2>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            <div className="grid grid-cols-25 gap-1" style={{ gridTemplateColumns: 'repeat(25, minmax(0,1fr))' }}>
              <div></div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-[10px] text-gray-400 text-center">{h}</div>
              ))}
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, dow) => (
                <React.Fragment key={d}>
                  <div className="text-[10px] text-gray-400 text-right pr-1">{d}</div>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const val = heatmap[dow]?.[h] || 0;
                    const intensity = val === 0 ? 'bg-gray-50' : val < 3 ? 'bg-emerald-100' : val < 6 ? 'bg-emerald-200' : 'bg-emerald-400';
                    return <div key={h} className={`h-4 rounded ${intensity}`} title={`${d} ${h}:00 — ${val}`}></div>;
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Missed/Failed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">Missed calls</div>
            <div className="text-gray-900 text-xl font-bold">{missedFailed.missed}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">STT/TTS errors</div>
            <div className="text-gray-900 text-xl font-bold">{missedFailed.errors}</div>
          </div>
        </div>

        {/* Repeat calls / duplicates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="text-sm font-semibold text-gray-900 mb-2">Repeat calls & duplicates</div>
          <div className="text-gray-900 text-xl font-bold">{repeatPct}%</div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNewModal(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">New booking</button>
            <button onClick={() => setActionModal({ type: 'confirm' })} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Confirm</button>
            <button onClick={() => setActionModal({ type: 'cancel' })} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => setActionModal({ type: 'reschedule' })} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Reschedule</button>
            <button onClick={() => setActionModal({ type: 'notify' })} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Notify admin</button>
          </div>
        </div>

        {/* New Booking Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-gray-100 p-5">
              <div className="text-lg font-semibold mb-4">{t('dashboard.modal.title') || 'New booking'}</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('dashboard.modal.name') || 'Name'}</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('dashboard.modal.date') || 'Date'}</label>
                  <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('dashboard.modal.channel') || 'Channel'}</label>
                    <select value={newChannel} onChange={(e) => setNewChannel(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option>Website</option>
                      <option>Call</option>
                      <option>Phone</option>
                      <option>Chat</option>
                      <option>WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('dashboard.modal.status') || 'Status'}</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full border rounded-md px-3 py-2 text-sm">
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button onClick={() => setShowNewModal(false)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('dashboard.modal.close') || 'Close'}</button>
                <button
                  disabled={isSaving}
                  onClick={async () => {
                    if (!newName.trim() || !newDate.trim()) return;
                    try {
                      setIsSaving(true);
                      const res = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newName.trim(), date: newDate.trim(), channel: newChannel, status: newStatus }),
                      });
                      if (!res.ok) throw new Error('Failed');
                      setShowNewModal(false);
                      setNewName(''); setNewDate(''); setNewChannel('Website'); setNewStatus('Confirmed');
                      pushToast(t('dashboard.cta.newBooking') || 'New booking');
                    } catch {
                      pushToast('Error');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                >{isSaving ? (t('dashboard.modal.saving') || 'Saving…') : (t('dashboard.modal.create') || 'Create')}</button>
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
                  <div className="text-lg font-semibold mb-2">{t('dashboard.actions.confirm') || 'Confirm'}</div>
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
                      onClick={async () => { if (!actionModal.bookingId) return; try { await updateDoc(doc(db, 'bookings', actionModal.bookingId), { status: 'Confirmed' }); pushToast(t('dashboard.actions.confirm') || 'Confirm'); } catch { pushToast('Error'); } finally { setActionModal(null); } }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >{t('dashboard.actions.confirm') || 'Confirm'}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'cancel' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('dashboard.actions.cancel') || 'Cancel'}</div>
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
                      onClick={async () => { if (!actionModal.bookingId) return; try { await updateDoc(doc(db, 'bookings', actionModal.bookingId), { status: 'cancelled' }); pushToast(t('dashboard.actions.cancel') || 'Cancel'); } catch { pushToast('Error'); } finally { setActionModal(null); } }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >{t('dashboard.actions.cancel') || 'Cancel'}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'reschedule' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('dashboard.actions.reschedule') || 'Reschedule'}</div>
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
                      onClick={async () => { if (!actionModal.bookingId) return; try { await updateDoc(doc(db, 'bookings', actionModal.bookingId), { date: rescheduleDate.trim() }); pushToast(t('dashboard.actions.reschedule') || 'Reschedule'); } catch { pushToast('Error'); } finally { setActionModal(null); setRescheduleDate(''); } }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >{t('dashboard.actions.reschedule') || 'Reschedule'}</button>
                  </div>
                </div>
              )}
              {actionModal.type === 'notify' && (
                <div>
                  <div className="text-lg font-semibold mb-2">{t('dashboard.cta.notifyAdmin') || 'Notify admin'}</div>
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
                      onClick={async () => { if (!actionModal.bookingId) return; try { await addDoc(collection(db, 'notifications'), { message: notifyText.trim(), bookingId: actionModal.bookingId || null, createdAt: serverTimestamp() }); await fetch('/api/n8n/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: actionModal.bookingId || null, message: notifyText.trim() }) }); pushToast(t('dashboard.cta.notifyAdmin') || 'Notify admin'); } catch { pushToast('Error'); } finally { setActionModal(null); setNotifyText(''); } }}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                    >{t('dashboard.cta.notifyAdmin') || 'Notify admin'}</button>
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
            <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Export CSV</button>
            <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">Share snapshot</button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentBookings')}</h2>
            <button 
              onClick={handleViewAllBookings}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
            >
              {t('dashboard.viewAll')}
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
              <div className="p-4 text-center text-gray-500">No recent bookings</div>
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
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">{t('dashboard.table.actions') || 'Actions'}</th>
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
                          >{t('dashboard.actions.confirm') || 'Confirm'}</button>
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'cancel', bookingId: booking.id, name: booking.name })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('dashboard.actions.cancel') || 'Cancel'}</button>
                          <button
                            onClick={() => booking.id && setActionModal({ type: 'reschedule', bookingId: booking.id, name: booking.name, currentDate: booking.date })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('dashboard.actions.reschedule') || 'Reschedule'}</button>
                          <button
                            onClick={() => setActionModal({ type: 'notify', bookingId: booking.id || '', name: booking.name })}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                          >{t('dashboard.actions.notify') || 'Notify'}</button>
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentLogs')}</h2>
              <button 
                onClick={handleViewAllLogs}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
              >
                {t('dashboard.viewAll')}
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
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('dashboard.recentLogs')}</h2>
              <button 
                onClick={handleViewAllLogs}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
              >
                {t('dashboard.viewAll')}
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
      </div>
    </div>
  );
};

export default Dashboard;
