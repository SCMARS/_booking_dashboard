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
    marketing: {
      badge: 'AI Voice Host • 24/7 Reservations',
      headline: 'Give every caller a five-star experience before they arrive.',
      subtitle: 'Riley answers phones, secures bookings, and keeps your team focused on hospitality while the AI handles repetitive tasks.',
      benefits: [
        'Capture every reservation request even after closing time',
        'Sync guest details to your CRM and dashboards automatically',
        'Spot VIPs, allergies, and spending patterns instantly'
      ],
      highlight: '“Riley books 35% more covers after hours and keeps our hosts free for walk-ins.”',
      highlightAuthor: 'Lena Ortiz',
      highlightRole: 'Owner, Azul Tapas Bar',
      contact: 'Have a larger team? Talk with us →'
    }
  },
  settings: {
    title: 'Restaurant Settings',
    restaurantProfile: 'Restaurant Profile',
    businessHours: 'Business Hours',
    channels: 'Communication Channels',
    integrations: 'Integrations & Webhooks',
    notifications: 'Notifications & Templates',
    languageTitle: 'Language',
    chooseInterface: 'Choose interface language',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    }
  },
  dashboard: {
    title: 'Restaurant Dashboard',
    period: {
      today: 'Today',
      last7: 'Last 7 Days',
      last30: 'Last 30 Days'
    },
    cards: {
      bookings: {
        title: 'Total Bookings',
        cta: 'View Details →'
      },
      status: {
        title: 'Confirmed / Pending',
        helper: "Today's Snapshot"
      },
      conversion: {
        title: 'Calls to Bookings Conversion',
        helper: 'Last 30 Days'
      }
    },
    loadingBookings: 'Loading bookings…',
    noData: 'No data available yet. Start receiving calls to see insights.',
    funnel: {
      title: 'Booking Funnel',
      calls: 'Incoming Calls',
      intents: 'Detected Booking Intents',
      bookings: 'Confirmed Bookings'
    },
    channels: {
      title: 'Performance by Channel',
      headers: {
        channel: 'Channel',
        calls: 'Calls',
        bookings: 'Bookings',
        conversion: 'Conversion Rate'
      }
    },
    metrics: {
      helper: 'By selected period',
      aht: { title: 'Average Call Duration (AHT)' },
      confirmation: { title: 'Confirmed vs Cancelled' },
      noShow: { title: 'No-show Rate', helper: 'Insights coming soon' },
      missed: { title: 'Missed Calls' },
      errors: { title: 'STT / TTS Errors' },
      duplicates: { title: 'Repeat Calls & Duplicates' }
    },
    heatmap: {
      title: 'Load Heatmap',
      weekdays: { Sun: 'Sun', Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }
    },
    quickActions: {
      newBooking: 'New Booking',
      confirm: 'Confirm',
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      notify: 'Notify Admin'
    },
    modal: {
      title: 'Create Manual Booking',
      name: 'Guest Name',
      date: 'Booking Date',
      channel: 'Channel',
      status: 'Status',
      close: 'Close',
      create: 'Save Booking',
      saving: 'Saving…'
    },
    actions: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      notify: 'Notify Admin',
      newDate: 'New date (YYYY-MM-DD):',
      notifyMsg: 'Message to admin:'
    },
    table: {
      name: 'Guest',
      date: 'Date',
      status: 'Status',
      channel: 'Channel',
      actions: 'Actions'
    },
    recentBookings: {
      title: 'Recent Bookings',
      viewAll: 'View All',
      empty: 'No recent bookings yet.'
    },
    logs: {
      title: 'Recent AI Conversations',
      text: 'Text',
      intent: 'Intent',
      channel: 'Channel',
      viewAll: 'View All Logs'
    }
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
  booking: {
    status: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      reschedule: 'Reschedule',
      notify: 'Notify Admin'
    }
  },
  knowledge: {
    title: 'Knowledge Base (FAQ)',
    empty: 'No knowledge items yet. Use Import or Add Item.',
    import: 'Import CSV / JSON',
    add: 'Add FAQ Item'
  },
  common: {
    export: 'Export CSV',
    share: 'Share Snapshot',
    load: 'Load Heatmap',
    reset: 'Reset Filters',
    placeholder: 'No data to display',
    language: {
      en: 'English',
      hr: 'Croatian',
      ru: 'Russian',
      es: 'Spanish'
    }
  },
  landing: {
    hero: {
      badge: 'AI Voice Host for Modern Restaurants',
      title: 'Revolutionize Your Restaurant with an AI Voice Host',
      subtitle: 'Meet your virtual receptionist that takes reservations, answers calls, and never misses a guest - 24/7.',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'Book a Free Demo',
      bullets: [
        'Capture bookings 24/7, even after hours',
        'Reduce front-of-house workload by automating calls',
        'Upsell specials and confirm guests in seconds'
      ]
    },
    features: {
      title: 'Built for High-Volume Restaurants',
      subtitle: 'Automate every phone conversation, keep tables full, and give guests a five-star experience without adding headcount.',
      voiceAI: {
        title: 'AI Voice Assistant That Sounds Human',
        description: 'Your AI host answers every call, greets customers, and manages table reservations automatically - reducing missed calls and freeing up your team.'
      },
      booking: {
        title: 'Smart Reservations and Waitlist Management',
        description: 'No more double bookings or manual logs. Our intelligent system syncs with your schedule and keeps your tables full at all times.'
      },
      analytics: {
        title: 'Analytics That Drive Profit',
        description: 'Get insights into peak hours, top menu items, and customer preferences. Make data-driven decisions that increase your revenue.'
      }
    },
    stats: {
      title: 'Trusted by Restaurants Worldwide',
      subtitle: 'Hospitality teams count on Riley to capture every booking and delight every caller.',
      items: [
        { value: '2,500+', label: 'restaurants powered by our AI' },
        { value: '500,000+', label: 'reservations handled' },
        { value: '75%', label: 'staff time saved' },
        { value: '98%', label: 'customer satisfaction' }
      ]
    },
    workflow: {
      title: 'How Riley Handles Every Call',
      subtitle: 'From greeting to confirmation, your AI host runs a perfect flow every time.',
      steps: [
        {
          title: 'Answer & Qualify',
          description: 'Riley greets callers, understands the request, and checks live availability within seconds.'
        },
        {
          title: 'Secure the Booking',
          description: 'Smart rules prevent double bookings, manage the waitlist, and send confirmations automatically.'
        },
        {
          title: 'Share the Insight',
          description: 'Every interaction logs intent, guest details, and revenue notes directly into your dashboard.'
        }
      ]
    },
    testimonials: {
      title: 'Hospitality Teams See Real Results',
      subtitle: 'Restaurants of all sizes are switching to AI for reservations and guest support.',
      items: [
        {
          quote: 'We capture 35% more bookings after hours and my hosts can finally focus on guests in front of them.',
          author: 'Lena Ortiz',
          role: 'Owner, Azul Tapas Bar'
        },
        {
          quote: 'The analytics highlight peak demand by the hour so we schedule smarter and cut no-shows in half.',
          author: 'Marco Petrovic',
          role: 'GM, Adriatic Bistro'
        }
      ]
    },
    integrations: {
      title: 'Connects With Your Stack',
      subtitle: 'Sync bookings, guests, and notifications with the tools you already use.',
      items: [
        'OpenTable, GloriaFood, and POS exports',
        'Twilio voice, WhatsApp, and SMS',
        'Google Sheets, Slack, and email alerts',
        'Custom automations via webhooks'
      ]
    },
    cta: {
      title: 'Ready to Transform Your Restaurant?',
      subtitle: "Try the AI host that's redefining guest experience. It's free to start.",
      button: 'Book a Free Demo',
      secondary: 'Already using Riley? Log in'
    }
  }
};

export default en;
