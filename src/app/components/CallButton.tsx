'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CallButtonProps {
  phoneNumber?: string;
  assistantId?: string;
}

export default function CallButton({ phoneNumber, assistantId }: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string>('');
  const { t } = useLanguage();

  // Проверяем конфигурацию при загрузке
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/vapi/config');
        const data = await response.json();
        
        if (!data.success) {
          setConfigError(data.error || 'Failed to load Vapi configuration');
        } else {
          setConfigError('');
        }
      } catch (error) {
        setConfigError('Network error: ' + error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfig();
  }, []);

  const initiateCall = async () => {
    setIsCalling(true);
    setCallStatus('Creating test call session...');

    try {
      // Сначала получаем конфигурацию
      const configResponse = await fetch('/api/vapi/config');
      const configData = await configResponse.json();
      
      if (!configData.success) {
        setCallStatus('Failed to get Vapi config: ' + configData.error);
        return;
      }

      const response = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId || configData.config.assistantId,
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
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600">Loading Vapi config...</span>
        </div>
      ) : configError ? (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">⚠️ Vapi Configuration Error</p>
          <p className="text-xs text-gray-500 max-w-xs">{configError}</p>
          <p className="text-xs text-gray-400 mt-1">Check your .env.local file</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
