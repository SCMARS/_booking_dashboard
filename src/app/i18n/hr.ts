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
    marketing: {
      badge: 'AI domaćin • Rezervacije 24/7',
      headline: 'Priredite gostima iskustvo s pet zvjezdica prije nego stignu.',
      subtitle: 'Riley odgovara na pozive, osigurava rezervacije i oslobađa vaš tim dok AI preuzima ponavljajuće zadatke.',
      benefits: [
        'Zaprimajte svaku rezervaciju čak i nakon zatvaranja',
        'Sinkronizirajte podatke gostiju s CRM-om i analitikom automatski',
        'Odmah prepoznajte VIP goste, alergije i navike potrošnje'
      ],
      highlight: '„Riley nam donosi 35% više rezervacija poslije radnog vremena i oslobađa hostese za goste u restoranu.”',
      highlightAuthor: 'Lena Ortiz',
      highlightRole: 'Vlasnica, Azul Tapas Bar',
      contact: 'Imate veći tim? Razgovarajte s nama →'
    }
  },
  settings: {
    title: 'Postavke restorana',
    restaurantProfile: 'Profil restorana',
    businessHours: 'Radno vrijeme',
    channels: 'Komunikacijski kanali',
    integrations: 'Integracije i webhookovi',
    notifications: 'Obavijesti i predlošci',
    languageTitle: 'Jezik',
    chooseInterface: 'Odaberite jezik sučelja',
    languages: {
      en: { label: 'English', desc: 'Default language' },
      ru: { label: 'Русский', desc: 'Русский язык' },
      hr: { label: 'Hrvatski', desc: 'Hrvatski jezik' },
      es: { label: 'Español', desc: 'Idioma español' },
    }
  },
  dashboard: {
    title: 'Nadzorna ploča restorana',
    hero: {
      badge: 'Centar za rezervacije',
      subtitle: 'Pratite svaku rezervaciju, kanal i interakciju s gostima na jednom mjestu.'
    },
    period: {
      today: 'Danas',
      last7: 'Zadnjih 7 dana',
      last30: 'Zadnjih 30 dana'
    },
    filters: {
      title: 'Filteri',
      helper: 'Prilagodite prikazane rezervacije.'
    },
    cards: {
      bookings: {
        title: 'Ukupno rezervacija',
        cta: 'Pogledaj detalje →'
      },
      status: {
        title: 'Potvrđeno / Na čekanju',
        helper: 'Današnji pregled'
      },
      conversion: {
        title: 'Konverzija poziva u rezervacije',
        helper: 'Zadnjih 30 dana'
      }
    },
    loadingBookings: 'Učitavanje rezervacija…',
    noData: 'Još nema podataka. Počnite primati pozive kako biste dobili uvide.',
    funnel: {
      title: 'Lijevak rezervacija',
      calls: 'Dolazni pozivi',
      intents: 'Otkrivene namjere',
      bookings: 'Potvrđene rezervacije'
    },
    channels: {
      title: 'Učinkovitost po kanalu',
      headers: {
        channel: 'Kanal',
        calls: 'Pozivi',
        bookings: 'Rezervacije',
        conversion: 'Stopa konverzije'
      },
      labels: {
        call: 'Telefon',
        phone: 'Telefon',
        website: 'Web stranica',
        chat: 'Chat',
        whatsapp: 'WhatsApp',
        sms: 'SMS'
      }
    },
    metrics: {
      helper: 'Prema odabranom razdoblju',
      aht: { title: 'Prosječno trajanje poziva (AHT)' },
      confirmation: { title: 'Potvrđeno vs Otkazano' },
      noShow: { title: 'Stopa nedolazaka', helper: 'Uvid dolazi uskoro' },
      missed: { title: 'Propušteni pozivi' },
      errors: { title: 'STT / TTS pogreške' },
      duplicates: { title: 'Ponovljeni pozivi i duplikati' }
    },
    metricsSection: {
      title: 'Operativni puls'
    },
    heatmap: {
      title: 'Toplinska karta opterećenja',
      weekdays: { Sun: 'Ned', Mon: 'Pon', Tue: 'Uto', Wed: 'Sri', Thu: 'Čet', Fri: 'Pet', Sat: 'Sub' }
    },
    calendar: {
      helper: 'Pogledajte u kojim se danima u mjesecu gomilaju rezervacije.'
    },
    quickActions: {
      title: 'Brze radnje',
      helper: 'Ručne izmjene bez napuštanja nadzorne ploče.',
      newBooking: 'Nova rezervacija',
      confirm: 'Potvrdi',
      cancel: 'Otkaži',
      reschedule: 'Pomakni',
      notify: 'Obavijesti administratora'
    },
    modal: {
      title: 'Kreiraj ručnu rezervaciju',
      name: 'Ime gosta',
      date: 'Datum rezervacije',
      channel: 'Kanal',
      status: 'Status',
      close: 'Zatvori',
      create: 'Spremi rezervaciju',
      saving: 'Spremanje…'
    },
    actions: {
      confirm: 'Potvrdi',
      cancel: 'Otkaži',
      reschedule: 'Pomakni',
      notify: 'Obavijesti administratora',
      newDate: 'Novi datum (GGGG-MM-DD):',
      notifyMsg: 'Poruka administratoru:'
    },
    table: {
      name: 'Gost',
      date: 'Datum',
      status: 'Status',
      channel: 'Kanal',
      actions: 'Radnje'
    },
    recentBookings: {
      title: 'Nedavne rezervacije',
      subtitle: 'Fokusirajte se na goste kojima danas treba praćenje.',
      viewAll: 'Pogledaj sve',
      empty: 'Još nema nedavnih rezervacija.'
    },
    snapshot: {
      title: 'Trenutne rezervacije',
      subtitle: 'Sve potvrde iz glasa, chata i weba na jednom mjestu.',
      filtered: '{shown} od {total} rezervacija'
    },
    logs: {
      title: 'Nedavni AI razgovori',
      text: 'Tekst',
      intent: 'Namjera',
      channel: 'Kanal',
      viewAll: 'Pogledaj sve razgovore'
    }
  },
  bookings: {
    title: 'Rezervacije',
    new: 'Nova rezervacija',
    filters: { status: 'Status', channel: 'Kanal', period: 'Period', sort: 'Sortiranje', reset: 'Reset', all: 'Sve', allTime: 'Svo vrijeme', last7: 'Zadnjih 7 dana', last30: 'Zadnjih 30 dana', thisMonth: 'Ovaj mjesec', dateDesc: 'Datum ↓', dateAsc: 'Datum ↑', nameAsc: 'Ime A→Z' },
    calendar: { title: 'Kalendar', daysShort: { S: 'N', M: 'P', T: 'U', W: 'S' }, headers: { status: 'Status', channel: 'Kanal', actions: 'Radnje' }, details: 'Detalji' },
    recent: { title: 'Nedavne rezervacije', viewAll: 'Pogledaj sve' },
    table: { name: 'Ime', date: 'Datum', status: 'Status', channel: 'Kanal' },
    statuses: { confirmed: 'Potvrđeno', pending: 'Na čekanju', cancelled: 'Otkazano' },
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
  booking: {
    status: {
      confirm: 'Potvrdi',
      cancel: 'Otkaži',
      reschedule: 'Promijeni termin',
      notify: 'Obavijesti administratora'
    }
  },
  knowledge: {
    title: 'Baza znanja (FAQ)',
    empty: 'Još nema stavki. Koristite Uvoz ili dodajte pitanje.',
    import: 'Uvoz CSV / JSON',
    add: 'Dodaj FAQ stavku'
  },
  common: {
    export: 'Izvoz CSV',
    share: 'Podijeli izvještaj',
    load: 'Učitaj toplinsku kartu',
    reset: 'Poništi filtre',
    placeholder: 'Nema podataka za prikaz',
    language: {
      en: 'Engleski',
      hr: 'Hrvatski',
      ru: 'Ruski',
      es: 'Španjolski'
    }
  },
  landing: {
    hero: {
      badge: 'AI glasovni domaćin za moderne restorane',
      title: 'Revolucionirajte svoj restoran uz AI glasovnog domaćina',
      subtitle: 'Upoznajte virtualnog recepcionista koji prima rezervacije, odgovara na pozive i ne propušta nijednog gosta - 24/7.',
      ctaPrimary: 'Započni besplatno probno razdoblje',
      ctaSecondary: 'Zatraži demo',
      bullets: [
        'Primate rezervacije 24/7, čak i nakon zatvaranja',
        'Smanjite opterećenje osoblja automatizacijom poziva',
        'Promovirajte specijalnu ponudu i potvrđujte goste u nekoliko sekundi'
      ]
    },
    features: {
      title: 'Dizajnirano za restorane s velikim prometom',
      subtitle: 'Automatizirajte svaki poziv, držite stolove popunjenima i pružite gostima vrhunsko iskustvo bez dodatnog osoblja.',
      voiceAI: {
        title: 'Glasovni AI asistent koji zvuči ljudski',
        description: 'Vaš AI domaćin odgovara na svaki poziv, dočekuje goste i upravlja rezervacijama automatski - manje propuštenih poziva i veća učinkovitost tima.'
      },
      booking: {
        title: 'Pametne rezervacije i lista čekanja',
        description: 'Bez dvostrukih rezervacija i ručnih evidencija. Sustav se sinkronizira s rasporedom i drži stolove popunjenima u svakom trenutku.'
      },
      analytics: {
        title: 'Analitika koja potiče profit',
        description: 'Saznajte koji su vam sati najprometniji, koja jela najprodavanija i što gosti vole. Donosite odluke vođene podacima i povećajte prihod.'
      }
    },
    stats: {
      title: 'Restorani diljem svijeta vjeruju Rileyju',
      subtitle: 'Ugostiteljski timovi oslanjaju se na Riley kako bi zabilježili svaku rezervaciju i oduševili svakog gosta.',
      items: [
        { value: '2.500+', label: 'restorana pokreće naš AI' },
        { value: '500.000+', label: 'obrađenih rezervacija' },
        { value: '75%', label: 'uštede vremena osoblja' },
        { value: '98%', label: 'zadovoljstva gostiju' }
      ]
    },
    workflow: {
      title: 'Kako Riley vodi svaki poziv',
      subtitle: 'Od pozdrava do potvrde, vaš AI domaćin slijedi savršen scenarij.',
      steps: [
        {
          title: 'Odgovor i kvalifikacija',
          description: 'Riley pozdravlja gosta, prepoznaje zahtjev i u trenu provjerava dostupnost.'
        },
        {
          title: 'Osiguravanje rezervacije',
          description: 'Pametna pravila sprječavaju dvostruke rezervacije, vode listu čekanja i automatski šalju potvrde.'
        },
        {
          title: 'Dijeljenje uvida',
          description: 'Svaki razgovor bilježi namjeru, podatke gosta i bilješke o prihodima izravno u nadzornoj ploči.'
        }
      ]
    },
    testimonials: {
      title: 'Ugostiteljski timovi vide stvarne rezultate',
      subtitle: 'Restorani svih veličina prelaze na AI za rezervacije i podršku gostima.',
      items: [
        {
          quote: 'Bilježimo 35% više rezervacija nakon radnog vremena, a tim se konačno posvećuje gostima u restoranu.',
          author: 'Lena Ortiz',
          role: 'Vlasnica, Azul Tapas Bar'
        },
        {
          quote: 'Analitika pokazuje vršno opterećenje po satima pa pametnije planiramo smjene i prepolovili smo nedolaske.',
          author: 'Marco Petrović',
          role: 'Voditelj, Adriatic Bistro'
        }
      ]
    },
    integrations: {
      title: 'Povezuje se s vašim alatima',
      subtitle: 'Sinkronizirajte rezervacije, goste i obavijesti s alatima koje već koristite.',
      items: [
        'OpenTable, GloriaFood i POS izvozi',
        'Twilio glas, WhatsApp i SMS',
        'Google Sheets, Slack i email upozorenja',
        'Prilagođene automatizacije putem webhookova'
      ]
    },
    cta: {
      title: 'Spremni transformirati svoj restoran?',
      subtitle: 'Isprobajte AI domaćina koji ponovno definira iskustvo gostiju. Početak je besplatan.',
      button: 'Rezerviraj besplatni demo',
      secondary: 'Već koristite Riley? Prijava'
    }
  }
};

export default hr;
