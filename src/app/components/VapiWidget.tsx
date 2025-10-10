'use client';

import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function VapiWidget() {
  const { language } = useLanguage();

  useEffect(() => {
    // Load Vapi widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Language-specific configurations
  const getWidgetConfig = (lang: string) => {
    const configs = {
      en: {
        title: "CALL WITH AI",
        startButtonText: "Start Call",
        endButtonText: "End Call",
        chatFirstMessage: "Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?",
        chatPlaceholder: "Type your message...",
        consentTitle: "Terms and conditions",
        consentContent: "By clicking Agree, and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
      },
      ru: {
        title: "ЗВОНОК С ИИ",
        startButtonText: "Начать звонок",
        endButtonText: "Завершить звонок",
        chatFirstMessage: "Спасибо за звонок в Wellness Partners. Меня зовут Райли, я ваш помощник по записи. Как я могу помочь вам сегодня?",
        chatPlaceholder: "Введите ваше сообщение...",
        consentTitle: "Условия использования",
        consentContent: "Нажимая «Согласен», я даю согласие на запись, хранение и передачу моих сообщений сторонним поставщикам услуг, как описано в наших Условиях использования."
      },
      hr: {
        title: "POZIV S AI",
        startButtonText: "Počni poziv",
        endButtonText: "Završi poziv",
        chatFirstMessage: "Hvala vam što ste nazvali Wellness Partners. Ja sam Riley, vaš asistent za zakazivanje. Kako vam mogu pomoći danas?",
        chatPlaceholder: "Upišite svoju poruku...",
        consentTitle: "Uvjeti korištenja",
        consentContent: "Klikom na 'Slažem se' pristajem na snimanje, pohranjivanje i dijeljenje mojih komunikacija s trećim stranama, kako je opisano u našim Uvjetima korištenja."
      },
      es: {
        title: "LLAMADA CON IA",
        startButtonText: "Iniciar llamada",
        endButtonText: "Terminar llamada",
        chatFirstMessage: "Gracias por llamar a Wellness Partners. Soy Riley, su asistente de programación. ¿Cómo puedo ayudarle hoy?",
        chatPlaceholder: "Escribe tu mensaje...",
        consentTitle: "Términos y condiciones",
        consentContent: "Al hacer clic en 'Aceptar', consiento la grabación, almacenamiento y compartir mis comunicaciones con proveedores de servicios de terceros, como se describe en nuestros Términos de Servicio."
      }
    };
    return configs[lang as keyof typeof configs] || configs.en;
  };

  const config = getWidgetConfig(language);

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
      title={config.title}
      start-button-text={config.startButtonText}
      end-button-text={config.endButtonText}
      voice-show-transcript={true}
      consent-required={true}
      consent-title={config.consentTitle}
      consent-content={config.consentContent}
      consent-storage-key="vapi_widget_consent"
    />
  );
}
