'use client';

import { useEffect, useState } from 'react';

export default function SimpleVapiWidget() {
  const [config, setConfig] = useState<{
    publicKey: string;
    assistantId: string;
  } | null>(null);

  useEffect(() => {
    // Получаем конфигурацию с сервера
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/vapi/config');
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Failed to fetch Vapi config:', error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!config) return;

    // Загружаем скрипт Vapi только после получения конфигурации
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [config]);

  // Показываем состояние загрузки пока не получили конфигурацию
  if (!config) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Loading Vapi...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <vapi-widget
      public-key={config.publicKey}
      assistant-id={config.assistantId}
      mode="voice"
      theme="dark"
      base-bg-color="#000000"
      accent-color="#14B8A6"
      cta-button-color="#000000"
      cta-button-text-color="#ffffff"
      border-radius="large"
      size="full"
      position="bottom-right"
      title="CALL WITH AI"
      start-button-text="Start Call"
      end-button-text="End Call"
      voice-show-transcript={true}
      consent-required={true}
      consent-title="Terms and conditions"
      consent-content="By clicking Agree, and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
      consent-storage-key="vapi_widget_consent"
    />
  );
}
