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
  dashboard: {
    title: 'Panel',
    totalBookings: 'Reservas totales',
    viewDetails: 'Ver detalles →',
    confirmedPending: 'Confirmadas / Pendientes',
    todaysSnapshot: 'Resumen de hoy',
    callsConversion: 'Conversión de llamadas a reservas',
    last30Days: 'Últimos 30 días',
    recentBookings: 'Reservas recientes',
    viewAll: 'Ver todas',

    loadingBookings: 'Cargando reservas…',
    recentLogs: 'Registros recientes',
    logs: { text: 'Texto', intent: 'Intención', channel: 'Canal' },
    period: { today: 'Hoy', last7: 'Últimos 7 días', last30: 'Últimos 30 días' },
    actions: { confirm: 'Confirmar', cancel: 'Cancelar', reschedule: 'Reprogramar', notify: 'Notificar', newDate: 'Nueva fecha (AAAA-MM-DD):', notifyMsg: 'Mensaje al administrador:' },
    modal: { title: 'Nueva reserva', name: 'Nombre', date: 'Fecha', channel: 'Canal', status: 'Estado', close: 'Cerrar', create: 'Crear', saving: 'Guardando…' },
    kpi: {
      ahtTitle: 'Duración media de llamada (AHT)',
      ahtNote: 'Aprox. por turnos del diálogo',
      confirmedCancelled: 'Confirmadas / Canceladas',
      byPeriod: 'Por período',
      noShowTitle: 'No-show',
      noShowNote: 'Marcador'
    },
    heatmap: { title: 'Mapa de calor de carga', weekdays: { Sun: 'Dom', Mon: 'Lun', Tue: 'Mar', Wed: 'Mié', Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb' } },
    missed: { calls: 'Llamadas perdidas', errors: 'Errores STT/TTS' },
    repeat: { title: 'Llamadas repetidas y duplicados' },
    cta: { newBooking: 'Nueva reserva', confirm: 'Confirmar', cancel: 'Cancelar', reschedule: 'Reprogramar', notifyAdmin: 'Notificar a admin', exportCsv: 'Exportar CSV', shareSnapshot: 'Compartir snapshot' },
    table: { name: 'Nombre', date: 'Fecha', status: 'Estado', channel: 'Canal', actions: 'Acciones' }
  },
  bookings: {
    title: 'Reservas',
    new: 'Nueva reserva',
    filters: { status: 'Estado', channel: 'Canal', period: 'Periodo', sort: 'Orden', reset: 'Restablecer', all: 'Todas', allTime: 'Todo el tiempo', last7: 'Últimos 7 días', last30: 'Últimos 30 días', thisMonth: 'Este mes', dateDesc: 'Fecha ↓', dateAsc: 'Fecha ↑', nameAsc: 'Nombre A→Z' },
    calendar: { title: 'Calendario', daysShort: { S: 'D', M: 'L', T: 'M', W: 'X' }, headers: { status: 'Estado', channel: 'Canal', actions: 'Acciones' }, details: 'Detalles' },
    recent: { title: 'Reservas recientes', viewAll: 'Ver todas' },
    table: { name: 'Nombre', date: 'Fecha', status: 'Estado', channel: 'Canal' },
    details: {
      title: 'Detalles de la reserva',
      name: 'Nombre',
      phone: 'Teléfono',
      date: 'Fecha',
      time: 'Hora',
      partySize: 'Número de personas',
      status: 'Estado',
      channel: 'Canal',
      notes: 'Notas',
      actions: { save: 'Guardar', confirm: 'Confirmar', cancel: 'Cancelar', reschedule: 'Reprogramar', close: 'Cerrar' }
    }
  },
  landing: {
    hero: {
      title: 'Asistente de IA para restaurantes - Revolución en la industria gastronómica',
      subtitle: 'Sistema inteligente de reservas con IA de voz que maneja reservas de mesas, toma pedidos y brinda servicio excepcional al cliente 24/7',
      ctaPrimary: 'Comenzar gratis',
      ctaSecondary: 'Saber más'
    },
    features: {
      title: 'Solución completa para gestión de restaurantes',
      subtitle: 'Todo lo que necesitas para gestionar tu restaurante de manera eficiente y deleitar a tus clientes',
      voiceAI: {
        title: 'Asistente de IA de voz',
        description: 'Riley, tu anfitriona de IA, toma reservas, responde preguntas sobre el menú y brinda servicio personalizado a cada huésped.'
      },
      automation: {
        title: 'Reservas inteligentes',
        description: 'Gestión automatizada de mesas con disponibilidad en tiempo real, gestión de lista de espera y confirmaciones automáticas.'
      },
      analytics: {
        title: 'Análisis de restaurante',
        description: 'Rastrea reservas, horas pico, preferencias de clientes y análisis de ingresos para optimizar las operaciones de tu restaurante.'
      }
    },
    stats: {
      title: 'Confianza de restaurantes en todo el mundo',
      subtitle: 'Únete a miles de restaurantes que ya usan nuestro asistente de IA',
      activeUsers: 'Restaurantes',
      processedRequests: 'Reservas realizadas',
      timeSaved: 'Tiempo ahorrado',
      satisfiedCustomers: 'Clientes felices'
    },
    cta: {
      title: '¿Listo para transformar tu restaurante?',
      subtitle: 'Únete a la revolución tecnológica en la industria gastronómica. Comienza con una prueba gratuita hoy.',
      createAccount: 'Crear cuenta',
      hasAccount: '¿Ya tienes una cuenta?'
    }
  }
};

export default es;


