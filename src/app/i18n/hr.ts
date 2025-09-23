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
};

export default hr;


