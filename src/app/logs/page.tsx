"use client";

import { useEffect, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

type LogItem = {
  id: string;
  timestamp?: string;
  channel?: string;
  status?: string;
  dialog?: Array<{ role: string; message: string }>;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [channel, setChannel] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [debounced, setDebounced] = useState<string>('');
  const { language } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const rows: LogItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setLogs(rows);
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = logs.filter((log) => {
    const channelOk = channel === 'All' || (log.channel || '').toLowerCase() === channel.toLowerCase();
    if (!channelOk) return false;
    if (!debounced) return true;

    const textPool = [
      log.timestamp || '',
      log.channel || '',
      log.status || '',
      ...(log.dialog?.map((d) => `${d.role}: ${d.message}`) || []),
    ]
      .join(' \n ')
      .toLowerCase();
    return textPool.includes(debounced);
  });

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-heading mb-6">Logs</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="All">All Channels</option>
            <option value="Phone">Phone</option>
            <option value="Website">Website</option>
            <option value="Chat">Chat</option>
            <option value="Call">Call</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text"
            className="border rounded-md px-3 py-2 text-sm flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Channel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Text</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length ? filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{log.timestamp || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{log.channel || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {log.dialog?.length
                      ? (
                        <div className="space-y-1">
                          {log.dialog.slice(0, 2).map((d, idx) => (
                            <div key={idx} className="text-gray-700"><span className="font-medium">{d.role}:</span> {d.message}</div>
                          ))}
                          {log.dialog.length > 2 && <div className="text-xs text-gray-400">+{log.dialog.length - 2} more…</div>}
                        </div>
                      )
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                      {log.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {'bookingId' in (log as any) && (log as any).bookingId ? (
                      <a className="text-blue-600 hover:underline" href={`/${language}/bookings?bookingId=${(log as any).bookingId}`}>View</a>
                    ) : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="mx-auto h-2 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="mt-3 text-xs text-gray-400">Loading logs…</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}