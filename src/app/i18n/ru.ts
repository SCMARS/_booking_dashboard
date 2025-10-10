const ru = {
  app: {
    title: 'AI Bot Admin',
  },
  nav: {
    dashboard: 'Дашборд',
    bookings: 'Бронирования',
    logs: 'Логи',
    knowledge: 'Знания',
    settings: 'Настройки',
    logout: 'Выйти',
  },
  auth: {
    login: 'Вход',
    register: 'Регистрация',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    alreadyLoggedIn: 'Вы уже вошли. Переадресация...',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    name: 'Имя',
    placeholders: {
      email: 'Введите ваш email',
      password: 'Введите пароль',
      name: 'Введите ваше имя',
      confirmPassword: 'Подтвердите пароль',
    },
    errors: {
      fillAllFields: 'Пожалуйста, заполните все поля',
      userNotFound: 'Пользователь не найден',
      wrongPassword: 'Неверный пароль',
      invalidEmail: 'Неверный формат email',
      tooManyRequests: 'Слишком много попыток. Попробуйте позже',
      loginGeneric: 'Произошла ошибка при входе',
      registerGeneric: 'Произошла ошибка при регистрации',
      passwordsMismatch: 'Пароли не совпадают',
      weakPassword: 'Слишком слабый пароль',
      passwordMin: 'Пароль должен содержать минимум 6 символов',
    },
  },
  settings: {
    languageTitle: 'Язык',
    chooseInterface: 'Выберите язык интерфейса',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    },
    agent: {
      title: 'Профиль агента', subtitle: 'Базовые настройки агента',
      name: 'Имя агента', voice: 'Голос', lang: 'Язык и акцент', active: 'Активен',
    },
    integrations: {
      title: 'Интеграции', subtitle: 'Подключение внешних сервисов',
      sheets: 'Google Sheets', customize: 'Настроить',
      twilio: 'Twilio', connect: 'Подключить',
      crm: 'CRM', integrate: 'Интегрировать',
    },
    call: {
      title: 'Поведение на звонке', greeting: 'Скрипт приветствия', maxDuration: 'Максимальная длительность звонка', minutes: 'минут', forwardHuman: 'Перенаправлять оператору'
    },
    notifications: {
      title: 'Уведомления', subtitle: 'Email-уведомления и отчёты',
      newBookings: 'Новые бронирования', callErrors: 'Ошибки звонков', daily: 'Ежедневный отчёт', weekly: 'Еженедельный отчёт'
    }
  },
  dashboard: {
    title: 'Дашборд',
    totalBookings: 'Всего бронирований',
    viewDetails: 'Подробнее →',
    confirmedPending: 'Подтверждено / В ожидании',
    todaysSnapshot: 'Снимок за сегодня',
    callsConversion: 'Конверсия звонков в брони',
    last30Days: 'За последние 30 дней',
    recentBookings: 'Недавние бронирования',
    viewAll: 'Показать все',
    // table keys are defined below with 'actions'
    loadingBookings: 'Загрузка бронирований…',
    recentLogs: 'Недавние логи',
    logs: { text: 'Текст', intent: 'Интент', channel: 'Канал' },
    period: { today: 'Сегодня', last7: '7 дней', last30: '30 дней' },
    actions: { confirm: 'Подтвердить', cancel: 'Отменить', reschedule: 'Перенести', notify: 'Уведомить', newDate: 'Новая дата (ГГГГ-ММ-ДД):', notifyMsg: 'Сообщение администратору:' },
    modal: { title: 'Новая бронь', name: 'Имя', date: 'Дата', channel: 'Канал', status: 'Статус', close: 'Закрыть', create: 'Создать', saving: 'Сохранение…' },
    kpi: {
      ahtTitle: 'Средняя длительность звонка (AHT)',
      ahtNote: 'Оценка по числу реплик',
      confirmedCancelled: 'Подтверждено / Отменено',
      byPeriod: 'За период',
      noShowTitle: 'Неявка',
      noShowNote: 'Заглушка'
    },
    heatmap: { title: 'Тепловая карта нагрузки', weekdays: { Sun: 'Вс', Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб' } },
    missed: { calls: 'Пропущенные звонки', errors: 'Ошибки STT/TTS' },
    repeat: { title: 'Повторные звонки и дубликаты' },
    cta: { newBooking: 'Новая бронь', confirm: 'Подтвердить', cancel: 'Отменить', reschedule: 'Перенести', notifyAdmin: 'Уведомить администратора', exportCsv: 'Экспорт CSV', shareSnapshot: 'Поделиться сводкой' },
    table: { name: 'Имя', date: 'Дата', status: 'Статус', channel: 'Канал', actions: 'Действия' }
  },
  bookings: {
    title: 'Бронирования',
    new: 'Новая бронь',
    filters: { status: 'Статус', channel: 'Канал', period: 'Период', sort: 'Сортировка', reset: 'Сбросить', all: 'Все', allTime: 'За всё время', last7: 'За 7 дней', last30: 'За 30 дней', thisMonth: 'Текущий месяц', dateDesc: 'Дата ↓', dateAsc: 'Дата ↑', nameAsc: 'Имя A→Z' },
    calendar: { title: 'Календарь', daysShort: { S: 'Вс', M: 'Пн', T: 'Вт', W: 'Ср' }, headers: { status: 'Статус', channel: 'Канал', actions: 'Действия' }, details: 'Подробнее' },
    recent: { title: 'Недавние брони', viewAll: 'Показать все' },
    table: { name: 'Имя', date: 'Дата', status: 'Статус', channel: 'Канал' },
    details: {
      title: 'Детали брони',
      name: 'Имя',
      phone: 'Телефон',
      date: 'Дата',
      time: 'Время',
      partySize: 'Гостей',
      status: 'Статус',
      channel: 'Канал',
      notes: 'Заметки',
      actions: { save: 'Сохранить', confirm: 'Подтвердить', cancel: 'Отменить', reschedule: 'Перенести', close: 'Закрыть' }
    }
  },
  landing: {
    hero: {
      title: 'AI-ассистент для ресторана - Революция в сфере общественного питания',
      subtitle: 'Умная система бронирования с голосовым AI, которая принимает заказы столиков, обрабатывает заказы и обеспечивает исключительное обслуживание клиентов 24/7',
      ctaPrimary: 'Начать бесплатно',
      ctaSecondary: 'Узнать больше'
    },
    features: {
      title: 'Полное решение для управления рестораном',
      subtitle: 'Все необходимое для эффективного управления вашим рестораном и удовлетворения клиентов',
      voiceAI: {
        title: 'Голосовой AI-ассистент',
        description: 'Райли, ваша AI-хостес, принимает бронирования, отвечает на вопросы о меню и обеспечивает персонализированное обслуживание каждого гостя.'
      },
      automation: {
        title: 'Умные бронирования',
        description: 'Автоматизированное управление столиками с актуальной доступностью, управление листом ожидания и автоматические подтверждения.'
      },
      analytics: {
        title: 'Аналитика ресторана',
        description: 'Отслеживайте бронирования, пиковые часы, предпочтения клиентов и аналитику доходов для оптимизации работы ресторана.'
      }
    },
    stats: {
      title: 'Доверяют рестораны по всему миру',
      subtitle: 'Присоединяйтесь к тысячам ресторанов, уже использующих нашего AI-ассистента',
      activeUsers: 'Рестораны',
      processedRequests: 'Бронирований сделано',
      timeSaved: 'Сэкономлено времени',
      satisfiedCustomers: 'Довольные клиенты'
    },
    cta: {
      title: 'Готовы трансформировать свой ресторан?',
      subtitle: 'Присоединяйтесь к технологической революции в ресторанном бизнесе. Начните с бесплатной пробной версии сегодня.',
      createAccount: 'Создать аккаунт',
      hasAccount: 'Уже есть аккаунт?'
    }
  }
};

export default ru;


