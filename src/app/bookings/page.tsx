'use client';
import React, { useState } from 'react';
import { User } from 'lucide-react';

interface BookingData {
    id: number;
    name: string;
    date: string;
    status: 'Confirmed' | 'Pending';
    channel: string;
    dayOfMonth: number;
}

const BookingsPage: React.FC = () => {
    const [selectedMonth] = useState('April 2024');

    const recentBookings: BookingData[] = [
        { id: 1, name: 'Vanessa C.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'WhatsApp', dayOfMonth: 21 },
        { id: 2, name: 'Mark T.', date: 'Apr 21, 2024', status: 'Pending', channel: 'Website', dayOfMonth: 21 },
        { id: 3, name: 'Anna H.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'Website', dayOfMonth: 21 },
        { id: 4, name: 'John D.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'Phone', dayOfMonth: 21 },
    ];

    return (
        <div className="min-h-screen bg-slate-800 text-white">
            {/* Header */}
            <div className="bg-slate-900 p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">AI Bot Admin</h1>
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-300" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Bookings</h1>
                    <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
                        New booking
                    </button>
                </div>

                {/* Calendar View */}
                <div className="bg-slate-700 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-6">{selectedMonth}</h2>

                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-4 text-center mb-6">
                        <div className="text-slate-400 font-medium py-2">S</div>
                        <div className="text-slate-400 font-medium py-2">M</div>
                        <div className="text-slate-400 font-medium py-2">T</div>
                        <div className="text-slate-400 font-medium py-2">W</div>
                        <div className="text-slate-400 font-medium py-2">T</div>
                        <div className="text-slate-400 font-medium py-2">Status</div>
                        <div className="text-slate-400 font-medium py-2">Channel</div>
                        <div className="text-slate-400 font-medium py-2">Actions</div>
                    </div>

                    {/* Calendar Rows */}
                    <div className="space-y-4">
                        {/* Row 1: Days 1-5 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-slate-600">
                            <div className="text-slate-300 text-center">1</div>
                            <div className="text-slate-300 text-center">2</div>
                            <div className="text-slate-300 text-center">3</div>
                            <div className="text-slate-300 text-center">4</div>
                            <div className="text-slate-300 text-center">5</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-slate-300">WhatsApp</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>

                        {/* Row 2: Days 8-12 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-slate-600">
                            <div className="text-slate-300 text-center">8</div>
                            <div className="text-slate-300 text-center">9</div>
                            <div className="text-slate-300 text-center">10</div>
                            <div className="text-slate-300 text-center">11</div>
                            <div className="text-slate-300 text-center">12</div>
                            <div className="flex items-center">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Pending</span>
                            </div>
                            <div className="text-slate-300">Website</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>

                        {/* Row 3: Days 15-19 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-slate-600">
                            <div className="text-slate-300 text-center">15</div>
                            <div className="text-center">
                                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto">17</div>
                            </div>
                            <div className="text-slate-300 text-center">17</div>
                            <div className="text-slate-300 text-center">18</div>
                            <div className="text-slate-300 text-center">19</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-slate-300">Website</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>

                        {/* Row 4: Days 22-26 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-slate-600">
                            <div className="text-slate-300 text-center">22</div>
                            <div className="text-slate-300 text-center">23</div>
                            <div className="text-slate-300 text-center">24</div>
                            <div className="text-slate-300 text-center">25</div>
                            <div className="text-slate-300 text-center">26</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-slate-300">Phone</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>

                        {/* Row 5: Days 29-31 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3">
                            <div className="text-slate-300 text-center">29</div>
                            <div className="text-slate-300 text-center">30</div>
                            <div className="text-slate-300 text-center">31</div>
                            <div></div>
                            <div></div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-slate-300">WhatsApp</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm">Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between p-6 border-b border-slate-600">
                        <h2 className="text-xl font-semibold">Recent bookings</h2>
                        <button className="text-blue-400 hover:text-blue-300 font-medium">View all</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Channel</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-600">
                            {recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-600">
                                    <td className="px-6 py-4 text-sm font-medium text-white">{booking.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{booking.date}</td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'Confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{booking.channel}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;