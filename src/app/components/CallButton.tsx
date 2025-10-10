'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CallButtonProps {
  phoneNumber?: string;
  assistantId?: string;
}

export default function CallButton({ phoneNumber, assistantId }: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');
  const { t } = useLanguage();

  const initiateCall = async () => {
    setIsCalling(true);
    setCallStatus('Creating test call session...');

    try {
      const response = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId || 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
          // Для тестирования создаем входящий звонок
          // Для реальных исходящих звонков нужен phoneNumberId из Vapi
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCallStatus('Call initiated successfully!');
        console.log('Call ID:', data.callId);
      } else {
        setCallStatus('Failed to initiate call: ' + data.error);
      }
    } catch (error) {
      console.error('Call error:', error);
      setCallStatus('Error: ' + error);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={initiateCall}
        disabled={isCalling}
        className={`px-6 py-3 rounded-full font-semibold text-white transition-all duration-200 ${
          isCalling
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 hover:scale-105'
        }`}
      >
        {isCalling ? 'Calling...' : '📞 Start AI Call'}
      </button>
      
      {callStatus && (
        <p className={`text-sm text-center ${
          callStatus.includes('successfully') 
            ? 'text-green-600' 
            : callStatus.includes('Failed') || callStatus.includes('Error')
            ? 'text-red-600'
            : 'text-blue-600'
        }`}>
          {callStatus}
        </p>
      )}
      
      {!phoneNumber && (
        <p className="text-sm text-gray-500 text-center">
          Enter a phone number to enable calling
        </p>
      )}
    </div>
  );
}
