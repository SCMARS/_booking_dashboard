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
        <div className="p-4 md:p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 md:px-6 py-2 rounded-lg font-medium text-white transition-colors">
                        New booking
                    </button>
                </div>

                {/* Calendar View */}
                <div className="bg-white rounded-lg p-4 md:p-6 mb-8 border border-gray-100">
                    <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-900">{selectedMonth}</h2>

                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-4 text-center mb-6 text-gray-600">
                        <div className="font-medium py-2">S</div>
                        <div className="font-medium py-2">M</div>
                        <div className="font-medium py-2">T</div>
                        <div className="font-medium py-2">W</div>
                        <div className="font-medium py-2">T</div>
                        <div className="font-medium py-2">Status</div>
                        <div className="font-medium py-2">Channel</div>
                        <div className="font-medium py-2">Actions</div>
                    </div>

                    {/* Calendar Rows */}
                    <div className="space-y-4">
                        {/* Row 1: Days 1-5 */}
                        <div className="grid grid-cols-8 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="text-gray-700 text-center">1</div>
                            <div className="text-gray-700 text-center">2</div>
                            <div className="text-gray-700 text-center">3</div>
                            <div className="text-gray-700 text-center">4</div>
                            <div className="text-gray-700 text-center">5</div>
                            <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Confirmed</span>
                            </div>
                            <div className="text-gray-700">WhatsApp</div>
                            <div className="flex justify-center">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">Details</button>
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">Details</button>
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">Details</button>
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
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">Details</button>
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
                <div className="bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent bookings</h2>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">View all</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Channel</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'Confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{booking.channel}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
        </div>
    );
};

export default BookingsPage;