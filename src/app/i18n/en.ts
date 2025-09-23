const en = {
  app: {
    title: 'AI Bot Admin',
  },
  nav: {
    dashboard: 'Dashboard',
    bookings: 'Bookings',
    logs: 'Logs',
    knowledge: 'Knowledge',
    settings: 'Settings',
    logout: 'Logout',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    alreadyLoggedIn: 'You are already signed in. Redirecting...',
    signIn: 'Sign in',
    signUp: 'Sign up',
    name: 'Name',
    placeholders: {
      email: 'Enter your email',
      password: 'Enter password',
      name: 'Enter your name',
      confirmPassword: 'Confirm password',
    },
    errors: {
      fillAllFields: 'Please fill in all fields',
      userNotFound: 'User not found',
      wrongPassword: 'Incorrect password',
      invalidEmail: 'Invalid email format',
      tooManyRequests: 'Too many attempts. Try again later',
      loginGeneric: 'An error occurred during sign in',
      registerGeneric: 'An error occurred during sign up',
      passwordsMismatch: 'Passwords do not match',
      weakPassword: 'Password is too weak',
      passwordMin: 'Password must be at least 6 characters',
    },
  },
  settings: {
    languageTitle: 'Language',
    chooseInterface: 'Choose interface language',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    },
    agent: {
      title: 'Agent Profile', subtitle: 'Basic agent profile settings',
      name: 'Agent name', voice: 'Voice', lang: 'Language & accent', active: 'Active',
    },
    integrations: {
      title: 'Integrations', subtitle: 'Connect external services',
      sheets: 'Google Sheets', customize: 'Customize',
      twilio: 'Twilio', connect: 'Connect',
      crm: 'CRM', integrate: 'Integrate',
    },
    call: {
      title: 'Call Behavior', greeting: 'Greeting script', maxDuration: 'Maximum call duration', minutes: 'minutes', forwardHuman: 'Forward to human'
    },
    notifications: {
      title: 'Notifications', subtitle: 'Email alerts and reports',
      newBookings: 'New bookings', callErrors: 'Call errors', daily: 'Daily report', weekly: 'Weekly report'
    }
  },
};

export default en;


