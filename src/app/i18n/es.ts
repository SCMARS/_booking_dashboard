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
    marketing: {
      badge: 'Anfitriona IA • Reservas 24/7',
      headline: 'Ofrece una experiencia cinco estrellas antes de que el cliente llegue.',
      subtitle: 'Riley atiende llamadas, asegura reservas y libera a tu equipo mientras la IA gestiona las tareas repetitivas.',
      benefits: [
        'Recibe cada solicitud de reserva incluso después del cierre',
        'Sincroniza los datos de los clientes con tu CRM y analítica automáticamente',
        'Detecta VIP, alergias y patrones de gasto al instante'
      ],
      highlight: '“Riley captura un 35% más de reservas fuera de horario y libera a nuestras anfitrionas para los clientes en el local.”',
      highlightAuthor: 'Lena Ortiz',
      highlightRole: 'Propietaria, Azul Tapas Bar',
      contact: '¿Equipo grande? Hablemos →'
    }
  },
  settings: {
    title: 'Configuración del restaurante',
    restaurantProfile: 'Perfil del restaurante',
    businessHours: 'Horario comercial',
    channels: 'Canales de comunicación',
    integrations: 'Integraciones y webhooks',
    notifications: 'Notificaciones y plantillas',
    languageTitle: 'Idioma',
    chooseInterface: 'Elige el idioma de la interfaz',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    }
  },
  dashboard: {
    title: 'Panel del restaurante',
    hero: {
      badge: 'Centro de control de reservas',
      subtitle: 'Supervisa cada reserva, canal e interacción con huéspedes en un solo lugar.'
    },
    period: {
      today: 'Hoy',
      last7: 'Últimos 7 días',
      last30: 'Últimos 30 días'
    },
    filters: {
      title: 'Filtros',
      helper: 'Refina las reservas mostradas abajo.'
    },
    cards: {
      bookings: {
        title: 'Reservas totales',
        cta: 'Ver detalles →'
      },
      status: {
        title: 'Confirmadas / Pendientes',
        helper: 'Instantánea de hoy'
      },
      conversion: {
        title: 'Conversión de llamadas a reservas',
        helper: 'Últimos 30 días'
      }
    },
    loadingBookings: 'Cargando reservas…',
    noData: 'Aún no hay datos. Empieza a recibir llamadas para ver información.',
    funnel: {
      title: 'Embudo de reservas',
      calls: 'Llamadas entrantes',
      intents: 'Intenciones detectadas',
      bookings: 'Reservas confirmadas'
    },
    channels: {
      title: 'Rendimiento por canal',
      headers: {
        channel: 'Canal',
        calls: 'Llamadas',
        bookings: 'Reservas',
        conversion: 'Tasa de conversión'
      },
      labels: {
        call: 'Teléfono',
        phone: 'Teléfono',
        website: 'Sitio web',
        chat: 'Chat',
        whatsapp: 'WhatsApp',
        sms: 'SMS'
      }
    },
    metrics: {
      helper: 'Según el período seleccionado',
      aht: { title: 'Duración media de llamada (AHT)' },
      confirmation: { title: 'Confirmadas vs Canceladas' },
      noShow: { title: 'Tasa de no presentación', helper: 'Información disponible pronto' },
      missed: { title: 'Llamadas perdidas' },
      errors: { title: 'Errores STT / TTS' },
      duplicates: { title: 'Llamadas repetidas y duplicadas' }
    },
    metricsSection: {
      title: 'Pulso operativo'
    },
    heatmap: {
      title: 'Mapa de calor de demanda',
      weekdays: { Sun: 'Dom', Mon: 'Lun', Tue: 'Mar', Wed: 'Mié', Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb' }
    },
    calendar: {
      helper: 'Descubre en qué días del mes se concentran las reservas.'
    },
    quickActions: {
      title: 'Acciones rápidas',
      helper: 'Gestiona cambios manuales sin salir del panel.',
      newBooking: 'Nueva reserva',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      reschedule: 'Reprogramar',
      notify: 'Notificar al administrador'
    },
    modal: {
      title: 'Crear reserva manual',
      name: 'Nombre del huésped',
      date: 'Fecha de la reserva',
      channel: 'Canal',
      status: 'Estado',
      close: 'Cerrar',
      create: 'Guardar reserva',
      saving: 'Guardando…'
    },
    actions: {
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      reschedule: 'Reprogramar',
      notify: 'Notificar al administrador',
      newDate: 'Nueva fecha (AAAA-MM-DD):',
      notifyMsg: 'Mensaje para el administrador:'
    },
    table: {
      name: 'Huésped',
      date: 'Fecha',
      status: 'Estado',
      channel: 'Canal',
      actions: 'Acciones'
    },
    recentBookings: {
      title: 'Reservas recientes',
      subtitle: 'Concéntrate en los invitados que necesitan seguimiento hoy.',
      viewAll: 'Ver todo',
      empty: 'Aún no hay reservas recientes.'
    },
    snapshot: {
      title: 'Reservas actuales',
      subtitle: 'Todas las confirmaciones de voz, chat y web en una sola cola.',
      filtered: '{shown} de {total} reservas'
    },
    logs: {
      title: 'Conversaciones recientes con IA',
      text: 'Texto',
      intent: 'Intención',
      channel: 'Canal',
      viewAll: 'Ver todas las conversaciones'
    }
  },
  bookings: {
    title: 'Reservas',
    new: 'Nueva reserva',
    hero: { subtitle: 'Mantente al tanto de cada reserva con sincronización en vivo desde Firebase. Filtra, confirma o reprograma en segundos sin salir de esta vista.' },
    filters: {
      status: 'Estado',
      channel: 'Canal',
      period: 'Periodo',
      sort: 'Orden',
      reset: 'Restablecer',
      all: 'Todas',
      allTime: 'Todo el tiempo',
      last7: 'Últimos 7 días',
      last30: 'Últimos 30 días',
      thisMonth: 'Este mes',
      dateDesc: 'Fecha ↓',
      dateAsc: 'Fecha ↑',
      nameAsc: 'Nombre A→Z',
      smartTitle: 'Filtros inteligentes',
      smartDescription: 'Combina estado, canal, periodo y búsqueda para reducir la cola.',
      searchPlaceholder: 'Busca por invitados, teléfono, notas…'
    },
    calendar: {
      title: 'Calendario',
      helper: 'Toca un día para ver todo el contexto de reservas.',
      daysShort: { S: 'D', M: 'L', T: 'M', W: 'X' },
      headers: { status: 'Estado', channel: 'Canal', actions: 'Acciones' },
      details: 'Detalles'
    },
    recent: { title: 'Reservas recientes', viewAll: 'Ver todas' },
    table: {
      name: 'Nombre',
      date: 'Fecha',
      status: 'Estado',
      channel: 'Canal',
      filteredCountSuffix: 'reservas coinciden con tus filtros.'
    },
    metrics: {
      visibleBadge: 'visibles',
      selectedChannelAll: 'Todos los canales',
      selectedChannelPrefix: 'Canal'
    },
    channelMix: {
      title: 'Mezcla de canales',
      helper: 'Resultados filtrados por canal para decidir rápido.',
      empty: 'No hay reservas en esta vista.'
    },
    dayList: {
      countLabel: 'reservas',
      empty: 'No hay reservas para este día.'
    },
    statuses: { confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada' },
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
  booking: {
    status: {
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      reschedule: 'Reprogramar',
      notify: 'Notificar al administrador'
    }
  },
  logs: {
    title: 'Registros de conversaciones',
    hero: {
      subtitle: 'Revisa cada conversación del asistente, identifica intenciones de reserva y controla los traspasos entre canales en tiempo real.',
      ctaDashboard: 'Volver al panel'
    },
    metrics: {
      total: 'Registros totales',
      totalHelper: 'Todo el tiempo',
      filtered: 'En vista',
      filteredHelper: 'Coinciden con los filtros',
      channels: 'Canales',
      channelsHelper: 'Únicos en vista',
      statuses: 'Estados',
      statusesHelper: 'Únicos en vista',
      badgeVisible: 'visibles'
    },
    filters: {
      title: 'Filtros',
      helper: 'Refina las transcripciones por canal, estado, intención o texto.',
      channel: 'Canal',
      status: 'Estado',
      searchPlaceholder: 'Busca en transcripción, intención, estado…',
      reset: 'Restablecer filtros',
      allChannels: 'Todos los canales',
      allStatuses: 'Todos los estados'
    },
    table: {
      headline: 'Archivo de conversaciones',
      helper: 'Transcripciones filtradas en tiempo real.',
      timestamp: 'Fecha y hora',
      channel: 'Canal',
      summary: 'Vista previa',
      status: 'Estado',
      booking: 'Reserva',
      view: 'Ver',
      moreTurns: 'más'
    },
    empty: 'Cargando registros…',
    noResults: 'No hay conversaciones que coincidan con tus filtros.',
    channelMix: {
      title: 'Mezcla de canales',
      helper: 'Volumen por canal en la vista actual.',
      empty: 'No hay canales en la vista actual.'
    },
    timeline: {
      title: 'Cronología en vivo',
      helper: 'Últimas derivaciones del asistente entre canales.',
      empty: 'Aún no hay eventos para estos filtros.'
    },
    detail: {
      title: 'Detalle de la conversación',
      ai: 'IA',
      guest: 'Cliente',
      unknown: 'Desconocido',
      intent: 'Intención',
      bookingLink: 'Abrir reserva',
      close: 'Cerrar',
      noDialog: 'No hay transcripción disponible.'
    }
  },
  settingsPage: {
    hero: {
      badge: 'Centro de control',
      title: 'Configura tu restaurante',
      subtitle: 'Mantén alineados canales, automatizaciones y políticas con la operación del equipo.',
      discard: 'Descartar',
      save: 'Guardar cambios'
    },
    summary: {
      maxGuests: { title: 'Máx. comensales por mesa', helper: 'Control de capacidad' },
      activeChannels: { title: 'Canales activos', helper: 'Voz · Chat · Web · WhatsApp' },
      locale: { title: 'Formato y moneda', helper: '' },
      automation: { title: 'Automatizaciones', helper: 'Notificaciones activas' }
    },
    channels: {
      title: 'Canales y estados',
      description: 'Define dónde escucha la IA y cómo se reportan tus estados personalizados.',
      call: { title: 'Llamadas', description: 'Asistente de voz para llamadas' },
      website: { title: 'Sitio web', description: 'Widget de reservas online' },
      whatsapp: { title: 'WhatsApp', description: 'Flujo de reservas en WhatsApp' },
      chat: { title: 'Chat', description: 'Chat embebido en el sitio' },
      customStatuses: 'Estados personalizados',
      addStatus: 'Añadir estado',
      reportAs: 'Reportar como ·',
      placeholder: 'Confirmada',
      remove: 'Eliminar',
      reportOptions: {
        booked: 'Confirmada',
        cancelled: 'Cancelada',
        noShow: 'No asistió',
        seated: 'En mesa'
      }
    },
    integrations: {
      title: 'Integraciones',
      description: 'Conecta automatizaciones, calendarios y exportaciones programadas.',
      n8nUrl: 'URL webhook de n8n',
      n8nSecret: 'Secreto n8n',
      googleCalendar: 'Google Calendar',
      connect: 'Conectar',
      ics: 'URL de feed ICS',
      csvSchedule: 'Frecuencia de exportación CSV',
      csv: {
        disabled: 'Desactivado',
        hourly: 'Cada hora',
        daily_06: 'Diario a las 06:00',
        weekly_mon: 'Semanal los lunes'
      }
    },
    locale: {
      title: 'Idioma y localización',
      description: 'Cambia el idioma del equipo y los formatos para tus invitados.',
      dateFormat: 'Formato de fecha',
      timeFormat: 'Formato de hora',
      currency: 'Moneda'
    },
    notifications: {
      title: 'Notificaciones',
      description: 'Elige destinos y personaliza el contenido de los avisos.',
      telegram: 'ID de chat / canal de Telegram',
      telegramPlaceholder: '@tu_canal o 123456789',
      email: 'E-mail de notificaciones',
      triggers: {
        new: 'Nueva reserva',
        cancel: 'Cancelación',
        errors: 'Errores y reintentos',
        daily: 'Resumen diario'
      },
      templates: {
        new: 'Plantilla de nueva reserva',
        cancel: 'Plantilla de cancelación'
      }
    }
  },
  knowledge: {
    title: 'Base de conocimiento (FAQ)',
    empty: 'Aún no hay artículos. Usa Importar o agrega uno.',
    import: 'Importar CSV / JSON',
    add: 'Agregar artículo FAQ'
  },
  common: {
    export: 'Exportar CSV',
    share: 'Compartir informe',
    load: 'Cargar mapa de calor',
    reset: 'Restablecer filtros',
    placeholder: 'No hay datos para mostrar',
    language: {
      en: 'Inglés',
      hr: 'Croata',
      ru: 'Ruso',
      es: 'Español'
    }
  },
  landing: {
    hero: {
      badge: 'Anfitriona de voz IA para restaurantes modernos',
      title: 'Revoluciona tu restaurante con una anfitriona de voz IA',
      subtitle: 'Conoce a tu recepcionista virtual que gestiona reservas, responde llamadas y nunca pierde un huésped, las 24 horas.',
      ctaPrimary: 'Comienza prueba gratuita',
      ctaSecondary: 'Solicitar demo',
      bullets: [
        'Recibe reservas 24/7, incluso después del cierre',
        'Reduce la carga del personal automatizando las llamadas',
        'Impulsa especiales y confirma a los clientes en segundos'
      ]
    },
    features: {
      title: 'Pensado para restaurantes de alto volumen',
      subtitle: 'Automatiza cada llamada, llena tus mesas y ofrece una experiencia memorable sin contratar más personal.',
      voiceAI: {
        title: 'Asistente de voz IA que suena humano',
        description: 'Tu anfitriona IA responde cada llamada, recibe a los clientes y gestiona las reservas automáticamente, reduciendo llamadas perdidas y liberando a tu equipo.'
      },
      booking: {
        title: 'Reservas inteligentes y lista de espera',
        description: 'Olvídate de las dobles reservas y los registros manuales. El sistema se sincroniza con tu agenda y mantiene las mesas siempre ocupadas.'
      },
      analytics: {
        title: 'Analítica que impulsa el beneficio',
        description: 'Obtén información sobre horas pico, platos estrella y preferencias de los clientes. Toma decisiones basadas en datos y haz crecer tus ingresos.'
      }
    },
    stats: {
      title: 'Restaurantes de todo el mundo confían en Riley',
      subtitle: 'Los equipos de hospitalidad confían en Riley para capturar cada reserva y sorprender a cada invitado.',
      items: [
        { value: '2.500+', label: 'restaurantes impulsados por nuestra IA' },
        { value: '500.000+', label: 'reservas gestionadas' },
        { value: '75%', label: 'tiempo ahorrado al personal' },
        { value: '98%', label: 'satisfacción de los clientes' }
      ]
    },
    workflow: {
      title: 'Cómo Riley gestiona cada llamada',
      subtitle: 'De la bienvenida a la confirmación, tu anfitriona IA sigue un flujo perfecto.',
      steps: [
        {
          title: 'Responder y calificar',
          description: 'Riley saluda al cliente, comprende la solicitud y verifica la disponibilidad en segundos.'
        },
        {
          title: 'Asegurar la reserva',
          description: 'Las reglas inteligentes evitan dobles reservas, gestionan la lista de espera y envían confirmaciones automáticas.'
        },
        {
          title: 'Compartir el insight',
          description: 'Cada interacción registra intención, datos del cliente y notas de ingresos directamente en tu panel.'
        }
      ]
    },
    testimonials: {
      title: 'Los equipos de hospitalidad ven resultados reales',
      subtitle: 'Restaurantes de todos los tamaños se están pasando a la IA para las reservas y la atención a invitados.',
      items: [
        {
          quote: 'Capturamos un 35% más de reservas después del horario y mi equipo puede centrarse en los clientes del local.',
          author: 'Lena Ortiz',
          role: 'Propietaria, Azul Tapas Bar'
        },
        {
          quote: 'La analítica muestra la demanda pico por hora, así programamos mejor y reducimos las ausencias a la mitad.',
          author: 'Marco Petrovic',
          role: 'Gerente general, Adriatic Bistro'
        }
      ]
    },
    integrations: {
      title: 'Se integra con tu stack',
      subtitle: 'Sincroniza reservas, clientes y avisos con las herramientas que ya usas.',
      items: [
        'Exportaciones a OpenTable, GloriaFood y POS',
        'Twilio voz, WhatsApp y SMS',
        'Google Sheets, Slack y alertas por email',
        'Automatizaciones personalizadas con webhooks'
      ]
    },
    cta: {
      title: '¿Listo para transformar tu restaurante?',
      subtitle: 'Prueba la anfitriona IA que redefine la experiencia del cliente. Empieza gratis.',
      button: 'Agenda un demo gratuito',
      secondary: '¿Ya usas Riley? Inicia sesión'
    }
  }
};

export default es;
