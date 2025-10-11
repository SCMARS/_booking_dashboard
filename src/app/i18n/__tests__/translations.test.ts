import en from '../en'
import ru from '../ru'
import hr from '../hr'
import es from '../es'

describe('Translation files', () => {
  describe('English translations', () => {
    it('should have all required keys', () => {
      expect(en.app).toBeDefined()
      expect(en.nav).toBeDefined()
      expect(en.auth).toBeDefined()
      expect(en.settings).toBeDefined()
      expect(en.dashboard).toBeDefined()
      expect(en.bookings).toBeDefined()
      expect(en.landing).toBeDefined()
    })

    it('should have landing page translations', () => {
      expect(en.landing.hero).toBeDefined()
      expect(en.landing.hero.title).toBeDefined()
      expect(en.landing.hero.subtitle).toBeDefined()
      expect(en.landing.hero.ctaPrimary).toBeDefined()
      expect(en.landing.hero.ctaSecondary).toBeDefined()

      expect(en.landing.features).toBeDefined()
      expect(en.landing.features.title).toBeDefined()
      expect(en.landing.features.subtitle).toBeDefined()
      expect(en.landing.features.voiceAI).toBeDefined()
      expect(en.landing.features.automation).toBeDefined()
      expect(en.landing.features.analytics).toBeDefined()

      expect(en.landing.stats).toBeDefined()
      expect(en.landing.stats.title).toBeDefined()
      expect(en.landing.stats.subtitle).toBeDefined()
      expect(en.landing.stats.activeUsers).toBeDefined()
      expect(en.landing.stats.processedRequests).toBeDefined()
      expect(en.landing.stats.timeSaved).toBeDefined()
      expect(en.landing.stats.satisfiedCustomers).toBeDefined()

      expect(en.landing.cta).toBeDefined()
      expect(en.landing.cta.title).toBeDefined()
      expect(en.landing.cta.subtitle).toBeDefined()
      expect(en.landing.cta.createAccount).toBeDefined()
      expect(en.landing.cta.hasAccount).toBeDefined()
    })

    it('should have restaurant-themed content', () => {
      expect(en.landing.hero.title).toContain('Restaurant')
      expect(en.landing.hero.subtitle).toContain('reservation')
      expect(en.landing.features.voiceAI.description).toContain('Riley')
      expect(en.landing.features.voiceAI.description).toContain('reservations')
    })
  })

  describe('Russian translations', () => {
    it('should have all required keys', () => {
      expect(ru.app).toBeDefined()
      expect(ru.nav).toBeDefined()
      expect(ru.auth).toBeDefined()
      expect(ru.settings).toBeDefined()
      expect(ru.dashboard).toBeDefined()
      expect(ru.bookings).toBeDefined()
      expect(ru.landing).toBeDefined()
    })

    it('should have landing page translations', () => {
      expect(ru.landing.hero).toBeDefined()
      expect(ru.landing.hero.title).toBeDefined()
      expect(ru.landing.hero.subtitle).toBeDefined()
      expect(ru.landing.hero.ctaPrimary).toBeDefined()
      expect(ru.landing.hero.ctaSecondary).toBeDefined()

      expect(ru.landing.features).toBeDefined()
      expect(ru.landing.features.title).toBeDefined()
      expect(ru.landing.features.subtitle).toBeDefined()
      expect(ru.landing.features.voiceAI).toBeDefined()
      expect(ru.landing.features.automation).toBeDefined()
      expect(ru.landing.features.analytics).toBeDefined()

      expect(ru.landing.stats).toBeDefined()
      expect(ru.landing.stats.title).toBeDefined()
      expect(ru.landing.stats.subtitle).toBeDefined()
      expect(ru.landing.stats.activeUsers).toBeDefined()
      expect(ru.landing.stats.processedRequests).toBeDefined()
      expect(ru.landing.stats.timeSaved).toBeDefined()
      expect(ru.landing.stats.satisfiedCustomers).toBeDefined()

      expect(ru.landing.cta).toBeDefined()
      expect(ru.landing.cta.title).toBeDefined()
      expect(ru.landing.cta.subtitle).toBeDefined()
      expect(ru.landing.cta.createAccount).toBeDefined()
      expect(ru.landing.cta.hasAccount).toBeDefined()
    })

    it('should have restaurant-themed content in Russian', () => {
      expect(ru.landing.hero.title).toContain('ресторан')
      expect(ru.landing.hero.subtitle).toContain('бронирование')
      expect(ru.landing.features.voiceAI.description).toContain('Райли')
      expect(ru.landing.features.voiceAI.description).toContain('бронирования')
    })
  })

  describe('Croatian translations', () => {
    it('should have all required keys', () => {
      expect(hr.app).toBeDefined()
      expect(hr.nav).toBeDefined()
      expect(hr.auth).toBeDefined()
      expect(hr.settings).toBeDefined()
      expect(hr.dashboard).toBeDefined()
      expect(hr.bookings).toBeDefined()
      expect(hr.landing).toBeDefined()
    })

    it('should have landing page translations', () => {
      expect(hr.landing.hero).toBeDefined()
      expect(hr.landing.hero.title).toBeDefined()
      expect(hr.landing.hero.subtitle).toBeDefined()
      expect(hr.landing.hero.ctaPrimary).toBeDefined()
      expect(hr.landing.hero.ctaSecondary).toBeDefined()

      expect(hr.landing.features).toBeDefined()
      expect(hr.landing.features.title).toBeDefined()
      expect(hr.landing.features.subtitle).toBeDefined()
      expect(hr.landing.features.voiceAI).toBeDefined()
      expect(hr.landing.features.automation).toBeDefined()
      expect(hr.landing.features.analytics).toBeDefined()

      expect(hr.landing.stats).toBeDefined()
      expect(hr.landing.stats.title).toBeDefined()
      expect(hr.landing.stats.subtitle).toBeDefined()
      expect(hr.landing.stats.activeUsers).toBeDefined()
      expect(hr.landing.stats.processedRequests).toBeDefined()
      expect(hr.landing.stats.timeSaved).toBeDefined()
      expect(hr.landing.stats.satisfiedCustomers).toBeDefined()

      expect(hr.landing.cta).toBeDefined()
      expect(hr.landing.cta.title).toBeDefined()
      expect(hr.landing.cta.subtitle).toBeDefined()
      expect(hr.landing.cta.createAccount).toBeDefined()
      expect(hr.landing.cta.hasAccount).toBeDefined()
    })

    it('should have restaurant-themed content in Croatian', () => {
      expect(hr.landing.hero.title).toContain('restoran')
      expect(hr.landing.hero.subtitle).toContain('rezervacija')
      expect(hr.landing.features.voiceAI.description).toContain('Riley')
      expect(hr.landing.features.voiceAI.description).toContain('rezervacije')
    })
  })

  describe('Spanish translations', () => {
    it('should have all required keys', () => {
      expect(es.app).toBeDefined()
      expect(es.nav).toBeDefined()
      expect(es.auth).toBeDefined()
      expect(es.settings).toBeDefined()
      expect(es.dashboard).toBeDefined()
      expect(es.bookings).toBeDefined()
      expect(es.landing).toBeDefined()
    })

    it('should have landing page translations', () => {
      expect(es.landing.hero).toBeDefined()
      expect(es.landing.hero.title).toBeDefined()
      expect(es.landing.hero.subtitle).toBeDefined()
      expect(es.landing.hero.ctaPrimary).toBeDefined()
      expect(es.landing.hero.ctaSecondary).toBeDefined()

      expect(es.landing.features).toBeDefined()
      expect(es.landing.features.title).toBeDefined()
      expect(es.landing.features.subtitle).toBeDefined()
      expect(es.landing.features.voiceAI).toBeDefined()
      expect(es.landing.features.automation).toBeDefined()
      expect(es.landing.features.analytics).toBeDefined()

      expect(es.landing.stats).toBeDefined()
      expect(es.landing.stats.title).toBeDefined()
      expect(es.landing.stats.subtitle).toBeDefined()
      expect(es.landing.stats.activeUsers).toBeDefined()
      expect(es.landing.stats.processedRequests).toBeDefined()
      expect(es.landing.stats.timeSaved).toBeDefined()
      expect(es.landing.stats.satisfiedCustomers).toBeDefined()

      expect(es.landing.cta).toBeDefined()
      expect(es.landing.cta.title).toBeDefined()
      expect(es.landing.cta.subtitle).toBeDefined()
      expect(es.landing.cta.createAccount).toBeDefined()
      expect(es.landing.cta.hasAccount).toBeDefined()
    })

    it('should have restaurant-themed content in Spanish', () => {
      expect(es.landing.hero.title).toContain('restaurante')
      expect(es.landing.hero.subtitle).toContain('reservas')
      expect(es.landing.features.voiceAI.description).toContain('Riley')
      expect(es.landing.features.voiceAI.description).toContain('reservas')
    })
  })

  describe('Translation consistency', () => {
    it('should have same structure across all languages', () => {
      const languages = [en, ru, hr, es]
      const languageNames = ['en', 'ru', 'hr', 'es']

      languages.forEach((lang, index) => {
        expect(lang.app).toBeDefined()
        expect(lang.nav).toBeDefined()
        expect(lang.auth).toBeDefined()
        expect(lang.settings).toBeDefined()
        expect(lang.dashboard).toBeDefined()
        expect(lang.bookings).toBeDefined()
        expect(lang.landing).toBeDefined()

        // Check landing page structure
        expect(lang.landing.hero).toBeDefined()
        expect(lang.landing.features).toBeDefined()
        expect(lang.landing.stats).toBeDefined()
        expect(lang.landing.cta).toBeDefined()

        // Check features structure
        expect(lang.landing.features.voiceAI).toBeDefined()
        expect(lang.landing.features.automation).toBeDefined()
        expect(lang.landing.features.analytics).toBeDefined()

        // Check stats structure
        expect(lang.landing.stats.activeUsers).toBeDefined()
        expect(lang.landing.stats.processedRequests).toBeDefined()
        expect(lang.landing.stats.timeSaved).toBeDefined()
        expect(lang.landing.stats.satisfiedCustomers).toBeDefined()
      })
    })

    it('should have non-empty strings for all landing page content', () => {
      const languages = [en, ru, hr, es]

      languages.forEach((lang) => {
        expect(lang.landing.hero.title).toBeTruthy()
        expect(lang.landing.hero.subtitle).toBeTruthy()
        expect(lang.landing.hero.ctaPrimary).toBeTruthy()
        expect(lang.landing.hero.ctaSecondary).toBeTruthy()

        expect(lang.landing.features.title).toBeTruthy()
        expect(lang.landing.features.subtitle).toBeTruthy()
        expect(lang.landing.features.voiceAI.title).toBeTruthy()
        expect(lang.landing.features.voiceAI.description).toBeTruthy()
        expect(lang.landing.features.automation.title).toBeTruthy()
        expect(lang.landing.features.automation.description).toBeTruthy()
        expect(lang.landing.features.analytics.title).toBeTruthy()
        expect(lang.landing.features.analytics.description).toBeTruthy()

        expect(lang.landing.stats.title).toBeTruthy()
        expect(lang.landing.stats.subtitle).toBeTruthy()
        expect(lang.landing.stats.activeUsers).toBeTruthy()
        expect(lang.landing.stats.processedRequests).toBeTruthy()
        expect(lang.landing.stats.timeSaved).toBeTruthy()
        expect(lang.landing.stats.satisfiedCustomers).toBeTruthy()

        expect(lang.landing.cta.title).toBeTruthy()
        expect(lang.landing.cta.subtitle).toBeTruthy()
        expect(lang.landing.cta.createAccount).toBeTruthy()
        expect(lang.landing.cta.hasAccount).toBeTruthy()
      })
    })
  })
})
