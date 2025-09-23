const es = {
  app: {
    title: 'AI Bot Admin',
  },
  nav: {
    dashboard: 'Panel',
    bookings: 'Reservas',
    logs: 'Registros',
    knowledge: 'Conocimiento',
    settings: 'Ajustes',
    logout: 'Cerrar sesión',
  },
  auth: {
    login: 'Iniciar sesión',
    register: 'Registro',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    alreadyLoggedIn: 'Ya has iniciado sesión. Redirigiendo...',
    signIn: 'Entrar',
    signUp: 'Registrarse',
    name: 'Nombre',
    placeholders: {
      email: 'Introduce tu email',
      password: 'Introduce la contraseña',
      name: 'Introduce tu nombre',
      confirmPassword: 'Confirma la contraseña',
    },
    errors: {
      fillAllFields: 'Por favor, completa todos los campos',
      userNotFound: 'Usuario no encontrado',
      wrongPassword: 'Contraseña incorrecta',
      invalidEmail: 'Formato de email no válido',
      tooManyRequests: 'Demasiados intentos. Inténtalo más tarde',
      loginGeneric: 'Se produjo un error al iniciar sesión',
      registerGeneric: 'Se produjo un error al registrarse',
      passwordsMismatch: 'Las contraseñas no coinciden',
      weakPassword: 'La contraseña es demasiado débil',
      passwordMin: 'La contraseña debe tener al menos 6 caracteres',
    },
  },
  settings: {
    languageTitle: 'Idioma',
    chooseInterface: 'Elige el idioma de la interfaz',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    },
    agent: {
      title: 'Perfil del agente', subtitle: 'Configuración básica del agente',
      name: 'Nombre del agente', voice: 'Voz', lang: 'Idioma y acento', active: 'Activo',
    },
    integrations: {
      title: 'Integraciones', subtitle: 'Conecta servicios externos',
      sheets: 'Google Sheets', customize: 'Personalizar',
      twilio: 'Twilio', connect: 'Conectar',
      crm: 'CRM', integrate: 'Integrar',
    },
    call: {
      title: 'Comportamiento en llamadas', greeting: 'Guion de saludo', maxDuration: 'Duración máxima de la llamada', minutes: 'minutos', forwardHuman: 'Derivar a humano'
    },
    notifications: {
      title: 'Notificaciones', subtitle: 'Alertas por email e informes',
      newBookings: 'Nuevas reservas', callErrors: 'Errores de llamadas', daily: 'Informe diario', weekly: 'Informe semanal'
    }
  },
};

export default es;


