"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, limit, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
}

const BookingsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedMonth] = useState('');
    const [recentBookings, setRecentBookings] = useState<BookingData[]>([]);
    const [status, setStatus] = useState<string>(searchParams.get('status') || 'All');
    const [channel, setChannel] = useState<string>(searchParams.get('channel') || 'All');
    const [period, setPeriod] = useState<string>(searchParams.get('period') || 'all');
    const [sort, setSort] = useState<string>(searchParams.get('sort') || 'date_desc');

    useEffect(() => {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50));
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

    }, [status, channel, period, sort]);

    const filtered = useMemo(() => {
        let rows = [...recentBookings];
        const now = new Date();
        let after: Date | null = null;
        if (period === '7d') after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        else if (period === '30d') after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        else if (period === 'month') after = new Date(now.getFullYear(), now.getMonth(), 1);

        rows = rows.filter((b) => {
            const statusOk = status === 'All' || (b.status || '').toLowerCase() === status.toLowerCase();
            const channelOk = channel === 'All' || (b.channel || '').toLowerCase() === channel.toLowerCase();
            if (!statusOk || !channelOk) return false;
            if (!after) return true;
            const createdAt: any = (b as any).createdAt;
            if (!createdAt) return false;
            const ts = typeof createdAt?.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
            return ts >= after;
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
    }, [recentBookings, status, channel, period, sort]);

    const [details, setDetails] = useState<null | (BookingData & { id: string })>(null);
    const [saving, setSaving] = useState(false);

    return (
        <div className="p-4 md:p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('bookings.title')}</h1>
                    <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 md:px-5 py-2 rounded-lg font-medium text-white transition-colors shadow-sm">
                        {t('bookings.new')}
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 md:p-5 mb-4 border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('bookings.filters.status')}</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option>{t('bookings.filters.all')}</option>
                                <option>Confirmed</option>
                                <option>Pending</option>
                                <option>cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('bookings.filters.channel')}</label>
                            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option>{t('bookings.filters.all')}</option>
                                <option>Call</option>
                                <option>Phone</option>
                                <option>Website</option>
                                <option>Chat</option>
                                <option>WhatsApp</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('bookings.filters.period')}</label>
                            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option value="all">{t('bookings.filters.allTime')}</option>
                                <option value="7d">{t('bookings.filters.last7')}</option>
                                <option value="30d">{t('bookings.filters.last30')}</option>
                                <option value="month">{t('bookings.filters.thisMonth')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">{t('bookings.filters.sort')}</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                                <option value="date_desc">{t('bookings.filters.dateDesc')}</option>
                                <option value="date_asc">{t('bookings.filters.dateAsc')}</option>
                                <option value="name_asc">{t('bookings.filters.nameAsc')}</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                              onClick={() => { setStatus('All'); setChannel('All'); setPeriod('all'); setSort('date_desc'); }}
                              className="w-full border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              {t('bookings.filters.reset')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                <div className="bg-white rounded-xl p-4 md:p-6 mb-8 border border-gray-100 shadow-sm">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-900">{t('bookings.calendar.title')}</h2>

                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-4 text-center mb-6 text-gray-600">
                        <div className="font-medium py-2">{t('bookings.calendar.daysShort.S')}</div>
                        <div className="font-medium py-2">{t('bookings.calendar.daysShort.M')}</div>
                        <div className="font-medium py-2">{t('bookings.calendar.daysShort.T')}</div>
                        <div className="font-medium py-2">{t('bookings.calendar.daysShort.W')}</div>
                        <div className="font-medium py-2">T</div>
                        <div className="font-medium py-2">{t('bookings.calendar.headers.status')}</div>
                        <div className="font-medium py-2">{t('bookings.calendar.headers.channel')}</div>
                        <div className="font-medium py-2">{t('bookings.calendar.headers.actions')}</div>
                    </div>

                    {/* Calendar Rows */}
                    <div className="space-y-4">
                        {/* Placeholder rows for layout; real calendar left as future work */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="text-gray-700 text-center">1</div>
                            <div className="text-gray-700 text-center">2</div>
                            <div className="text-gray-700 text-center">3</div>
                            <div className="text-gray-700 text-center">4</div>
                            <div className="text-gray-700 text-center">5</div>
                            <div className="flex items-center">
                                <span className="bg-green-50 text-green-700 ring-1 ring-green-200 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-gray-700">WhatsApp</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm shadow-sm">{t('bookings.calendar.details')}</button>
                            </div>
                        </div>

                        {/* Row 2: Days 8-12 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="text-gray-700 text-center">8</div>
                            <div className="text-gray-700 text-center">9</div>
                            <div className="text-gray-700 text-center">10</div>
                            <div className="text-gray-700 text-center">11</div>
                            <div className="text-gray-700 text-center">12</div>
                            <div className="flex items-center">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span>
                            </div>
                            <div className="text-gray-700">Website</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">{t('bookings.calendar.details')}</button>
                            </div>
                        </div>

                        {/* Row 3: Days 15-19 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="text-gray-700 text-center">15</div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto">17</div>
                            </div>
                            <div className="text-gray-700 text-center">17</div>
                            <div className="text-gray-700 text-center">18</div>
                            <div className="text-gray-700 text-center">19</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-gray-700">Website</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">{t('bookings.calendar.details')}</button>
                            </div>
                        </div>

                        {/* Row 4: Days 22-26 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="text-gray-700 text-center">22</div>
                            <div className="text-gray-700 text-center">23</div>
                            <div className="text-gray-700 text-center">24</div>
                            <div className="text-gray-700 text-center">25</div>
                            <div className="text-gray-700 text-center">26</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-gray-700">Phone</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">{t('bookings.calendar.details')}</button>
                            </div>
                        </div>

                        {/* Row 5: Days 29-31 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3">
                            <div className="text-gray-700 text-center">29</div>
                            <div className="text-gray-700 text-center">30</div>
                            <div className="text-gray-700 text-center">31</div>
                            <div></div>
                            <div></div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-gray-700">WhatsApp</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{t('bookings.recent.title')}</h2>
                        <a className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-700 bg-white border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm" href={`/${language}/bookings`}>
                          {t('bookings.recent.viewAll')}
                          {/* simple chevron using CSS borders or text */}
                          →
                        </a>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('bookings.table.name')}</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('bookings.table.date')}</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('bookings.table.status')}</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">{t('bookings.table.channel')}</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filtered.length ? filtered.map((booking, idx) => (
                                <tr key={booking.id || idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${
                          booking.status === 'Confirmed'
                              ? 'bg-green-50 text-green-700 ring-green-200'
                              : booking.status === 'Pending'
                              ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                              : 'bg-red-50 text-red-700 ring-red-200'
                      }`}>
                        {booking.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.channel}</td>
                                </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                  <div className="mx-auto h-2 w-1/2 bg-gray-100 rounded animate-pulse" />
                                  <div className="mt-3 text-xs text-gray-400">{t('dashboard.loadingBookings')}</div>
                                </td>
                              </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Modal */}
                {details && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-gray-100 p-5">
                      <div className="text-lg font-semibold mb-4">{t('bookings.details.title')}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.name')}</label>
                          <input className="w-full border rounded-md px-3 py-2 text-sm" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.phone')}</label>
                          <input className="w-full border rounded-md px-3 py-2 text-sm" value={details.phone || ''} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.date')}</label>
                          <input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={details.date} onChange={(e) => setDetails({ ...details, date: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.time')}</label>
                          <input className="w-full border rounded-md px-3 py-2 text-sm" value={details.time || ''} onChange={(e) => setDetails({ ...details, time: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.partySize')}</label>
                          <input type="number" className="w-full border rounded-md px-3 py-2 text-sm" value={details.partySize || 1} onChange={(e) => setDetails({ ...details, partySize: Number(e.target.value) })} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.status')}</label>
                          <select className="w-full border rounded-md px-3 py-2 text-sm" value={details.status} onChange={(e) => setDetails({ ...details, status: e.target.value as any })}>
                            <option>Confirmed</option>
                            <option>Pending</option>
                            <option>cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.channel')}</label>
                          <select className="w-full border rounded-md px-3 py-2 text-sm" value={details.channel} onChange={(e) => setDetails({ ...details, channel: e.target.value })}>
                            <option>Call</option>
                            <option>Phone</option>
                            <option>Website</option>
                            <option>Chat</option>
                            <option>WhatsApp</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">{t('bookings.details.notes')}</label>
                          <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={3} value={details.notes || ''} onChange={(e) => setDetails({ ...details, notes: e.target.value })} />
                        </div>
                      </div>
                      <div className="mt-5 flex items-center justify-end gap-2">
                        <button onClick={() => setDetails(null)} className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">{t('bookings.details.actions.close')}</button>
                        <button
                          disabled={saving}
                          onClick={async () => {
                            if (!details?.id) return;
                            setSaving(true);
                            try {
                              const { id, ...payload } = details as any;
                              await updateDoc(doc(db, 'bookings', id), payload);
                              setDetails(null);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                        >{saving ? '...' : t('bookings.details.actions.save')}</button>
                      </div>
                    </div>
                  </div>
                )}
        </div>
    );
};

export default BookingsPage;