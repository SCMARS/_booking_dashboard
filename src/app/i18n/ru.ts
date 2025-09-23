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
};

export default ru;


