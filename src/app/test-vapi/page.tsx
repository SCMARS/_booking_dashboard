'use client';

import { useLanguage } from '../contexts/LanguageContext';
import VapiTest from '../components/VapiTest';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TestVapiPage() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href={`/${language}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Vapi API Testing</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🧪 Vapi API Tests</h2>
            <p className="text-gray-600">
              Test your Vapi configuration and API endpoints. Make sure your environment variables are set correctly.
            </p>
          </div>

          <VapiTest />
        </div>

        {/* Configuration Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Configuration Check</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Make sure your <code className="bg-blue-100 px-1 rounded">.env.local</code> file contains:</p>
            <ul className="ml-4 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">VAPI_PRIVATE_KEY</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">VAPI_PUBLIC_KEY</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">VAPI_ASSISTANT_ID</code></li>
            </ul>
            <p>• Restart your server after changing environment variables</p>
            <p>• Check the console for any error messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
