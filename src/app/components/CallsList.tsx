'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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
  createdAt: Date;
  type: string;
}

export default function CallsList() {
  const { t } = useLanguage();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Загрузка звонков из Firebase
  const loadCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logs?type=call_summary&limit=20');
      const data = await response.json();
      
      if (data.success) {
        setCalls(data.logs || []);
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

  const formatDate = (date: Date) => {
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-2">Loading calls...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
          <button
            onClick={syncWithVapi}
            disabled={syncing}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Syncing...
              </>
            ) : (
              'Sync with Vapi'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Call ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {call.callId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.phoneNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.duration ? formatDuration(call.duration) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(call.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      // Показать детали звонка
                      console.log('Call details:', call);
                    }}
                    className="text-teal-600 hover:text-teal-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {calls.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No calls found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try syncing with Vapi to load recent calls
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
