'use client';

import { useEffect } from 'react';

export default function SimpleVapiWidget() {
  useEffect(() => {
    // Загружаем скрипт Vapi
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
  }, []);

  return (
    <vapi-widget
      public-key="ea7c4170-a2cd-4b71-a37c-bf829fc2d0e6"
      assistant-id="c459fd1f-dcc7-4716-8dc8-e8c79ce5e319"
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
