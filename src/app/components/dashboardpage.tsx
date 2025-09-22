'use client';

import React from 'react';
import { 
  Home, 
  Calendar, 
  FileText, 
  BookOpen, 
  Settings,
  ShoppingCart,
  ChevronRight
} from 'lucide-react';

interface BookingData {
  name: string;
  date: string;
  status: 'Confirmed' | 'Pending';
  channel: string;
}

interface LogData {
  text: string;
  intent: string;
  channel?: string;
}

const Dashboard: React.FC = () => {
  const recentBookings: BookingData[] = [
    { name: 'Vanessa C.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'WhatsApp' },
    { name: 'Mark T.', date: 'Apr 21, 2024', status: 'Pending', channel: 'Website' },
    { name: 'Anna H.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'Website' },
    { name: 'John D.', date: 'Apr 21, 2024', status: 'Confirmed', channel: 'Phone' },
  ];

  const recentLogsLeft: LogData[] = [
    { text: 'I would like to book a table', intent: 'booking' },
    { text: 'Make a reservation', intent: 'booking' },
  ];

  const recentLogsRight: LogData[] = [
    { text: 'Make a reservation', intent: 'Call', channel: 'Call' },
    { text: 'Table for 5', intent: 'Chat', channel: 'Chat' },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Calendar, label: 'Bookings', active: false },
    { icon: FileText, label: 'Logs', active: false },
    { icon: BookOpen, label: 'Knowledge', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="max-w-full">
      {/* Main Content */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Total bookings</div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900">324</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Confirmed / Pending</div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900">210 / 39</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-gray-600 mb-2">Calls to bookings conversion</div>
            <div className="text-2xl md:text-4xl font-bold text-gray-900">61.1%</div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg mb-8">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent bookings</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">View all</button>
          </div>

          {/* Mobile view - card layout */}
          <div className="md:hidden">
            {recentBookings.map((booking, index) => (
              <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium text-gray-900">{booking.name}</div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'Confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <div>{booking.date}</div>
                  <div>{booking.channel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view - table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-600">Channel</th>
                  <th className="px-4 md:px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentBookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-gray-900">{booking.name}</td>
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{booking.date}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{booking.channel}</td>
                    <td className="px-4 md:px-6 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-white rounded-lg">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent logs</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">View all</button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4">
                <div className="text-xs md:text-sm font-medium text-gray-600">Text</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">Intent</div>
              </div>

              {recentLogsLeft.map((log, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 md:gap-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-xs md:text-sm text-gray-900 break-words">{log.text}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.intent}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Recent logs</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">View all</button>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                <div className="text-xs md:text-sm font-medium text-gray-600">Text</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">Intent</div>
                <div className="text-xs md:text-sm font-medium text-gray-600">Channel</div>
              </div>

              {recentLogsRight.map((log, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 md:gap-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-xs md:text-sm text-gray-900 break-words">{log.text}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.intent}</div>
                  <div className="text-xs md:text-sm text-gray-600">{log.channel}</div>
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
