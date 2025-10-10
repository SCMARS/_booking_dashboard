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
  dashboard: {
    title: 'Dashboard',
    totalBookings: 'Total bookings',
    viewDetails: 'View details →',
    confirmedPending: 'Confirmed / Pending',
    todaysSnapshot: "Today's snapshot",
    callsConversion: 'Calls to bookings conversion',
    last30Days: 'Last 30 days',
    recentBookings: 'Recent bookings',
    viewAll: 'View all',
    loadingBookings: 'Loading bookings…',
    recentLogs: 'Recent logs',
    logs: { text: 'Text', intent: 'Intent', channel: 'Channel' },
    period: { today: 'Today', last7: 'Last 7 days', last30: 'Last 30 days' },
    actions: { confirm: 'Confirm', cancel: 'Cancel', reschedule: 'Reschedule', notify: 'Notify', newDate: 'New date (YYYY-MM-DD):', notifyMsg: 'Message to admin:' },
    modal: { title: 'New booking', name: 'Name', date: 'Date', channel: 'Channel', status: 'Status', close: 'Close', create: 'Create', saving: 'Saving…' },
    kpi: {
      ahtTitle: 'Average call duration (AHT)',
      ahtNote: 'Approx. by dialog turns',
      confirmedCancelled: 'Confirmed / Cancelled',
      byPeriod: 'By period',
      noShowTitle: 'No-show',
      noShowNote: 'Placeholder'
    },
    heatmap: { title: 'Load heatmap', weekdays: { Sun: 'Sun', Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' } },
    missed: { calls: 'Missed calls', errors: 'STT/TTS errors' },
    repeat: { title: 'Repeat calls & duplicates' },
    cta: { newBooking: 'New booking', confirm: 'Confirm', cancel: 'Cancel', reschedule: 'Reschedule', notifyAdmin: 'Notify admin', exportCsv: 'Export CSV', shareSnapshot: 'Share snapshot' },
    table: { name: 'Name', date: 'Date', status: 'Status', channel: 'Channel', actions: 'Actions' }
  },
  bookings: {
    title: 'Bookings',
    new: 'New booking',
    filters: { status: 'Status', channel: 'Channel', period: 'Period', sort: 'Sort', reset: 'Reset', all: 'All', allTime: 'All time', last7: 'Last 7 days', last30: 'Last 30 days', thisMonth: 'This month', dateDesc: 'Date desc', dateAsc: 'Date asc', nameAsc: 'Name A→Z' },
    calendar: { title: 'Calendar', daysShort: { S: 'S', M: 'M', T: 'T', W: 'W' }, headers: { status: 'Status', channel: 'Channel', actions: 'Actions' }, details: 'Details' },
    recent: { title: 'Recent bookings', viewAll: 'View all' },
    table: { name: 'Name', date: 'Date', status: 'Status', channel: 'Channel' },
    details: {
      title: 'Booking details',
      name: 'Name',
      phone: 'Phone',
      date: 'Date',
      time: 'Time',
      partySize: 'Party size',
      status: 'Status',
      channel: 'Channel',
      notes: 'Notes',
      actions: { save: 'Save', confirm: 'Confirm', cancel: 'Cancel', reschedule: 'Reschedule', close: 'Close' }
    }
  },
  landing: {
    hero: {
      title: 'AI Restaurant Assistant - Revolutionize Your Dining Experience',
      subtitle: 'Smart reservation system with voice AI that handles table bookings, takes orders, and provides exceptional customer service 24/7',
      ctaPrimary: 'Start Free',
      ctaSecondary: 'Learn More'
    },
    features: {
      title: 'Complete Restaurant Management Solution',
      subtitle: 'Everything you need to manage your restaurant efficiently and delight your customers',
      voiceAI: {
        title: 'Voice AI Assistant',
        description: 'Riley, your AI hostess, takes reservations, answers questions about the menu, and provides personalized service to every guest.'
      },
      automation: {
        title: 'Smart Reservations',
        description: 'Automated table management with real-time availability, waitlist management, and automatic confirmations.'
      },
      analytics: {
        title: 'Restaurant Analytics',
        description: 'Track reservations, peak hours, customer preferences, and revenue insights to optimize your restaurant operations.'
      }
    },
    stats: {
      title: 'Trusted by Restaurants Worldwide',
      subtitle: 'Join thousands of restaurants already using our AI assistant',
      activeUsers: 'Restaurants',
      processedRequests: 'Reservations Made',
      timeSaved: 'Time Saved',
      satisfiedCustomers: 'Happy Customers'
    },
    cta: {
      title: 'Ready to Transform Your Restaurant?',
      subtitle: 'Join the restaurant technology revolution. Start with a free trial today.',
      createAccount: 'Create Account',
      hasAccount: 'Already have an account?'
    }
  }
};

export default en;


