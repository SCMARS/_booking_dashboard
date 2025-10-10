'use client';

import { useState } from 'react';

export default function VapiTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWebhook = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vapi/webhook', {
        method: 'GET',
      });
      const data = await response.json();
      setTestResult(`✅ Webhook test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Webhook test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAssistants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vapi/assistants', {
        method: 'GET',
      });
      const data = await response.json();
      setTestResult(`✅ Assistants test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Assistants test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCall = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          assistantId: '13b8bfd2-f6c0-4a78-9e85-d46744296327',
        }),
      });
      const data = await response.json();
      setTestResult(`✅ Call test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Call test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">🧪 Vapi API Tests</h3>
      
      <div className="space-y-3">
        <button
          onClick={testWebhook}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Webhook
        </button>
        
        <button
          onClick={testAssistants}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Assistants API
        </button>
        
        <button
          onClick={testCall}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Call API
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="text-sm overflow-auto">{testResult}</pre>
        </div>
      )}
      
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Testing...</span>
        </div>
      )}
    </div>
  );
}
