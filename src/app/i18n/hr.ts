const hr = {
  app: {
    title: 'AI Bot Admin',
  },
  nav: {
    dashboard: 'Nadzorna ploča',
    bookings: 'Rezervacije',
    logs: 'Zapisi',
    knowledge: 'Znanje',
    settings: 'Postavke',
    logout: 'Odjava',
  },
  auth: {
    login: 'Prijava',
    register: 'Registracija',
    email: 'Email',
    password: 'Lozinka',
    confirmPassword: 'Potvrdi lozinku',
    alreadyLoggedIn: 'Već ste prijavljeni. Preusmjeravanje...',
    signIn: 'Prijavi se',
    signUp: 'Registriraj se',
    name: 'Ime',
    placeholders: {
      email: 'Unesite svoj email',
      password: 'Unesite lozinku',
      name: 'Unesite svoje ime',
      confirmPassword: 'Potvrdite lozinku',
    },
    errors: {
      fillAllFields: 'Molimo ispunite sva polja',
      userNotFound: 'Korisnik nije pronađen',
      wrongPassword: 'Netočna lozinka',
      invalidEmail: 'Neispravan format emaila',
      tooManyRequests: 'Previše pokušaja. Pokušajte kasnije',
      loginGeneric: 'Došlo je do pogreške pri prijavi',
      registerGeneric: 'Došlo je do pogreške pri registraciji',
      passwordsMismatch: 'Lozinke se ne podudaraju',
      weakPassword: 'Lozinka je preslaba',
      passwordMin: 'Lozinka mora imati najmanje 6 znakova',
    },
  },
  settings: {
    languageTitle: 'Jezik',
    chooseInterface: 'Odaberite jezik sučelja',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    },
    agent: {
      title: 'Profil agenta', subtitle: 'Osnovne postavke agenta',
      name: 'Ime agenta', voice: 'Glas', lang: 'Jezik i naglasak', active: 'Aktivan',
    },
    integrations: {
      title: 'Integracije', subtitle: 'Povežite vanjske servise',
      sheets: 'Google Sheets', customize: 'Prilagodi',
      twilio: 'Twilio', connect: 'Poveži',
      crm: 'CRM', integrate: 'Integriraj',
    },
    call: {
      title: 'Ponašanje poziva', greeting: 'Pozdravna skripta', maxDuration: 'Maksimalno trajanje poziva', minutes: 'minuta', forwardHuman: 'Proslijedi agentu'
    },
    notifications: {
      title: 'Obavijesti', subtitle: 'Email obavijesti i izvještaji',
      newBookings: 'Nove rezervacije', callErrors: 'Greške poziva', daily: 'Dnevni izvještaj', weekly: 'Tjedni izvještaj'
    }
  },
  dashboard: {
    title: 'Nadzorna ploča',
    totalBookings: 'Ukupno rezervacija',
    viewDetails: 'Pogledaj detalje →',
    confirmedPending: 'Potvrđeno / Na čekanju',
    todaysSnapshot: 'Današnji pregled',
    callsConversion: 'Konverzija poziva u rezervacije',
    last30Days: 'Zadnjih 30 dana',
    recentBookings: 'Nedavne rezervacije',
    viewAll: 'Pogledaj sve',
    // table keys are defined below with 'actions'
    loadingBookings: 'Učitavanje rezervacija…',
    recentLogs: 'Nedavni zapisi',
    logs: { text: 'Tekst', intent: 'Nakana', channel: 'Kanal' },
    period: { today: 'Danas', last7: 'Zadnjih 7 dana', last30: 'Zadnjih 30 dana' },
    actions: { confirm: 'Potvrdi', cancel: 'Otkaži', reschedule: 'Promijeni', notify: 'Obavijesti', newDate: 'Novi datum (GGGG-MM-DD):', notifyMsg: 'Poruka administratoru:' },
    modal: { title: 'Nova rezervacija', name: 'Ime', date: 'Datum', channel: 'Kanal', status: 'Status', close: 'Zatvori', create: 'Kreiraj', saving: 'Spremanje…' },
    kpi: {
      ahtTitle: 'Prosječno trajanje poziva (AHT)',
      ahtNote: 'Približno po broju replika',
      confirmedCancelled: 'Potvrđeno / Otkazano',
      byPeriod: 'Za period',
      noShowTitle: 'Nije došao',
      noShowNote: 'Placeholder'
    },
    heatmap: { title: 'Toplinska karta opterećenja', weekdays: { Sun: 'Ned', Mon: 'Pon', Tue: 'Uto', Wed: 'Sri', Thu: 'Čet', Fri: 'Pet', Sat: 'Sub' } },
    missed: { calls: 'Propušteni pozivi', errors: 'STT/TTS greške' },
    repeat: { title: 'Ponavljani pozivi i duplikati' },
    cta: { newBooking: 'Nova rezervacija', confirm: 'Potvrdi', cancel: 'Otkaži', reschedule: 'Promijeni', notifyAdmin: 'Obavijesti administratora', exportCsv: 'Izvoz CSV', shareSnapshot: 'Podijeli pregled' },
    table: { name: 'Ime', date: 'Datum', status: 'Status', channel: 'Kanal', actions: 'Radnje' }
  },
  bookings: {
    title: 'Rezervacije',
    new: 'Nova rezervacija',
    filters: { status: 'Status', channel: 'Kanal', period: 'Period', sort: 'Sortiranje', reset: 'Reset', all: 'Sve', allTime: 'Svo vrijeme', last7: 'Zadnjih 7 dana', last30: 'Zadnjih 30 dana', thisMonth: 'Ovaj mjesec', dateDesc: 'Datum ↓', dateAsc: 'Datum ↑', nameAsc: 'Ime A→Z' },
    calendar: { title: 'Kalendar', daysShort: { S: 'N', M: 'P', T: 'U', W: 'S' }, headers: { status: 'Status', channel: 'Kanal', actions: 'Radnje' }, details: 'Detalji' },
    recent: { title: 'Nedavne rezervacije', viewAll: 'Pogledaj sve' },
    table: { name: 'Ime', date: 'Datum', status: 'Status', channel: 'Kanal' },
    details: {
      title: 'Detalji rezervacije',
      name: 'Ime',
      phone: 'Telefon',
      date: 'Datum',
      time: 'Vrijeme',
      partySize: 'Broj gostiju',
      status: 'Status',
      channel: 'Kanal',
      notes: 'Bilješke',
      actions: { save: 'Spremi', confirm: 'Potvrdi', cancel: 'Otkaži', reschedule: 'Promijeni', close: 'Zatvori' }
    }
  },
  landing: {
    hero: {
      title: 'AI asistent za restoran - Revolucija u ugostiteljstvu',
      subtitle: 'Pametni sustav rezervacija s glasovnim AI-om koji prima narudžbe stolova, obrađuje narudžbe i pruža izuzetnu uslugu klijentima 24/7',
      ctaPrimary: 'Počni besplatno',
      ctaSecondary: 'Saznaj više'
    },
    features: {
      title: 'Kompletno rješenje za upravljanje restoranom',
      subtitle: 'Sve što trebate za učinkovito upravljanje vašim restoranom i zadovoljavanje klijenata',
      voiceAI: {
        title: 'Glasovni AI asistent',
        description: 'Riley, vaša AI domaćica, prima rezervacije, odgovara na pitanja o jelovniku i pruža personaliziranu uslugu svakom gostu.'
      },
      automation: {
        title: 'Pametne rezervacije',
        description: 'Automatizirano upravljanje stolovima s realnom dostupnošću, upravljanje listom čekanja i automatske potvrde.'
      },
      analytics: {
        title: 'Analitika restorana',
        description: 'Pratite rezervacije, najprometnije sate, preferencije klijenata i analitiku prihoda za optimizaciju rada restorana.'
      }
    },
    stats: {
      title: 'Povjerenje restorana diljem svijeta',
      subtitle: 'Pridružite se tisućama restorana koji već koriste našeg AI asistenta',
      activeUsers: 'Restorani',
      processedRequests: 'Rezervacija napravljeno',
      timeSaved: 'Ušteda vremena',
      satisfiedCustomers: 'Zadovoljni klijenti'
    },
    cta: {
      title: 'Spremni transformirati svoj restoran?',
      subtitle: 'Pridružite se tehnološkoj revoluciji u ugostiteljstvu. Počnite s besplatnom probnom verzijom danas.',
      createAccount: 'Stvori račun',
      hasAccount: 'Već imate račun?'
    }
  }
};

export default hr;


