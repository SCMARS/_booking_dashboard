declare namespace JSX {
  interface IntrinsicElements {
    'vapi-widget': {
      'public-key': string;
      'assistant-id': string;
      mode?: 'chat' | 'voice';
      theme?: 'light' | 'dark';
      'base-bg-color'?: string;
      'accent-color'?: string;
      'cta-button-color'?: string;
      'cta-button-text-color'?: string;
      'border-radius'?: 'small' | 'medium' | 'large';
      size?: 'small' | 'medium' | 'full';
      position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
      title?: string;
      'start-button-text'?: string;
      'end-button-text'?: string;
      'chat-first-message'?: string;
      'chat-placeholder'?: string;
      'voice-show-transcript'?: boolean;
      'consent-required'?: boolean;
      'consent-title'?: string;
      'consent-content'?: string;
      'consent-storage-key'?: string;
    };
  }
}
