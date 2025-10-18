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
      expect(en.landing.hero.badge).toBeDefined()
      expect(en.landing.hero.title).toBeDefined()
      expect(en.landing.hero.subtitle).toBeDefined()
      expect(en.landing.hero.ctaPrimary).toBeDefined()
      expect(en.landing.hero.ctaSecondary).toBeDefined()
      expect(Array.isArray(en.landing.hero.bullets)).toBe(true)
      expect((en.landing.hero.bullets as any[]).length).toBeGreaterThan(0)

      expect(en.landing.features).toBeDefined()
      expect(en.landing.features.title).toBeDefined()
      expect(en.landing.features.subtitle).toBeDefined()
      expect(en.landing.features.voiceAI).toBeDefined()
      expect(en.landing.features.booking).toBeDefined()
      expect(en.landing.features.analytics).toBeDefined()

      expect(en.landing.stats).toBeDefined()
      expect(en.landing.stats.title).toBeDefined()
      expect(en.landing.stats.subtitle).toBeDefined()
      expect(Array.isArray(en.landing.stats.items)).toBe(true)
      expect((en.landing.stats.items as any[]).length).toBeGreaterThanOrEqual(4)
      ;(en.landing.stats.items as any[]).forEach((item) => {
        expect(item.value).toBeTruthy()
        expect(item.label).toBeTruthy()
      })

      expect(en.landing.workflow).toBeDefined()
      expect(en.landing.workflow.title).toBeDefined()
      expect(en.landing.workflow.subtitle).toBeDefined()
      expect(Array.isArray(en.landing.workflow.steps)).toBe(true)
      expect((en.landing.workflow.steps as any[]).length).toBeGreaterThanOrEqual(3)
      ;(en.landing.workflow.steps as any[]).forEach((step) => {
        expect(step.title).toBeTruthy()
        expect(step.description).toBeTruthy()
      })

      expect(en.landing.testimonials).toBeDefined()
      expect(en.landing.testimonials.title).toBeDefined()
      expect(en.landing.testimonials.subtitle).toBeDefined()
      expect(Array.isArray(en.landing.testimonials.items)).toBe(true)
      expect((en.landing.testimonials.items as any[]).length).toBeGreaterThanOrEqual(2)
      ;(en.landing.testimonials.items as any[]).forEach((item) => {
        expect(item.quote).toBeTruthy()
        expect(item.author).toBeTruthy()
        expect(item.role).toBeTruthy()
      })

      expect(en.landing.integrations).toBeDefined()
      expect(en.landing.integrations.title).toBeDefined()
      expect(en.landing.integrations.subtitle).toBeDefined()
      expect(Array.isArray(en.landing.integrations.items)).toBe(true)
      expect((en.landing.integrations.items as any[]).length).toBeGreaterThanOrEqual(3)
      ;(en.landing.integrations.items as any[]).forEach((item) => {
        expect(item).toBeTruthy()
      })

      expect(en.landing.cta).toBeDefined()
      expect(en.landing.cta.title).toBeDefined()
      expect(en.landing.cta.subtitle).toBeDefined()
      expect(en.landing.cta.button).toBeDefined()
      expect(en.landing.cta.secondary).toBeDefined()
    })

    it('should have restaurant-themed content', () => {
      expect(en.landing.hero.title).toContain('Restaurant')
      expect(en.landing.hero.subtitle).toContain('reservation')
      expect(en.landing.features.voiceAI.description).toContain('AI host')
      expect(en.landing.features.voiceAI.description).toContain('reservations')
      expect((en.landing.hero.bullets as any[])[0]).toContain('bookings')
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
      expect(ru.landing.hero.badge).toBeDefined()
      expect(Array.isArray(ru.landing.hero.bullets)).toBe(true)
      expect((ru.landing.hero.bullets as any[]).length).toBeGreaterThan(0)

      expect(ru.landing.features).toBeDefined()
      expect(ru.landing.features.title).toBeDefined()
      expect(ru.landing.features.subtitle).toBeDefined()
      expect(ru.landing.features.voiceAI).toBeDefined()
      expect(ru.landing.features.booking).toBeDefined()
      expect(ru.landing.features.analytics).toBeDefined()

      expect(ru.landing.stats).toBeDefined()
      expect(ru.landing.stats.title).toBeDefined()
      expect(ru.landing.stats.subtitle).toBeDefined()
      expect(Array.isArray(ru.landing.stats.items)).toBe(true)
      expect((ru.landing.stats.items as any[]).length).toBeGreaterThanOrEqual(4)
      ;(ru.landing.stats.items as any[]).forEach((item) => {
        expect(item.value).toBeTruthy()
        expect(item.label).toBeTruthy()
      })

      expect(ru.landing.workflow).toBeDefined()
      expect(ru.landing.workflow.title).toBeDefined()
      expect(ru.landing.workflow.subtitle).toBeDefined()
      expect(Array.isArray(ru.landing.workflow.steps)).toBe(true)
      expect((ru.landing.workflow.steps as any[]).length).toBeGreaterThanOrEqual(3)
      ;(ru.landing.workflow.steps as any[]).forEach((step) => {
        expect(step.title).toBeTruthy()
        expect(step.description).toBeTruthy()
      })

      expect(ru.landing.testimonials).toBeDefined()
      expect(ru.landing.testimonials.title).toBeDefined()
      expect(ru.landing.testimonials.subtitle).toBeDefined()
      expect(Array.isArray(ru.landing.testimonials.items)).toBe(true)
      expect((ru.landing.testimonials.items as any[]).length).toBeGreaterThanOrEqual(2)
      ;(ru.landing.testimonials.items as any[]).forEach((item) => {
        expect(item.quote).toBeTruthy()
        expect(item.author).toBeTruthy()
        expect(item.role).toBeTruthy()
      })

      expect(ru.landing.integrations).toBeDefined()
      expect(ru.landing.integrations.title).toBeDefined()
      expect(ru.landing.integrations.subtitle).toBeDefined()
      expect(Array.isArray(ru.landing.integrations.items)).toBe(true)
      expect((ru.landing.integrations.items as any[]).length).toBeGreaterThanOrEqual(3)
      ;(ru.landing.integrations.items as any[]).forEach((item) => {
        expect(item).toBeTruthy()
      })

      expect(ru.landing.cta).toBeDefined()
      expect(ru.landing.cta.title).toBeDefined()
      expect(ru.landing.cta.subtitle).toBeDefined()
      expect(ru.landing.cta.button).toBeDefined()
      expect(ru.landing.cta.secondary).toBeDefined()
    })

    it('should have restaurant-themed content in Russian', () => {
      expect(ru.landing.hero.title).toContain('ресторан')
      expect(ru.landing.hero.subtitle).toContain('брони')
      expect(ru.landing.features.voiceAI.description).toContain('AI')
      expect(ru.landing.features.voiceAI.description).toContain('брони')
      expect((ru.landing.hero.bullets as any[])[0]).toContain('брони')
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
      expect(hr.landing.hero.badge).toBeDefined()
      expect(Array.isArray(hr.landing.hero.bullets)).toBe(true)
      expect((hr.landing.hero.bullets as any[]).length).toBeGreaterThan(0)

      expect(hr.landing.features).toBeDefined()
      expect(hr.landing.features.title).toBeDefined()
      expect(hr.landing.features.subtitle).toBeDefined()
      expect(hr.landing.features.voiceAI).toBeDefined()
      expect(hr.landing.features.booking).toBeDefined()
      expect(hr.landing.features.analytics).toBeDefined()

      expect(hr.landing.stats).toBeDefined()
      expect(hr.landing.stats.title).toBeDefined()
      expect(hr.landing.stats.subtitle).toBeDefined()
      expect(Array.isArray(hr.landing.stats.items)).toBe(true)
      expect((hr.landing.stats.items as any[]).length).toBeGreaterThanOrEqual(4)
      ;(hr.landing.stats.items as any[]).forEach((item) => {
        expect(item.value).toBeTruthy()
        expect(item.label).toBeTruthy()
      })

      expect(hr.landing.workflow).toBeDefined()
      expect(hr.landing.workflow.title).toBeDefined()
      expect(hr.landing.workflow.subtitle).toBeDefined()
      expect(Array.isArray(hr.landing.workflow.steps)).toBe(true)
      expect((hr.landing.workflow.steps as any[]).length).toBeGreaterThanOrEqual(3)
      ;(hr.landing.workflow.steps as any[]).forEach((step) => {
        expect(step.title).toBeTruthy()
        expect(step.description).toBeTruthy()
      })

      expect(hr.landing.testimonials).toBeDefined()
      expect(hr.landing.testimonials.title).toBeDefined()
      expect(hr.landing.testimonials.subtitle).toBeDefined()
      expect(Array.isArray(hr.landing.testimonials.items)).toBe(true)
      expect((hr.landing.testimonials.items as any[]).length).toBeGreaterThanOrEqual(2)
      ;(hr.landing.testimonials.items as any[]).forEach((item) => {
        expect(item.quote).toBeTruthy()
        expect(item.author).toBeTruthy()
        expect(item.role).toBeTruthy()
      })

      expect(hr.landing.integrations).toBeDefined()
      expect(hr.landing.integrations.title).toBeDefined()
      expect(hr.landing.integrations.subtitle).toBeDefined()
      expect(Array.isArray(hr.landing.integrations.items)).toBe(true)
      expect((hr.landing.integrations.items as any[]).length).toBeGreaterThanOrEqual(3)
      ;(hr.landing.integrations.items as any[]).forEach((item) => {
        expect(item).toBeTruthy()
      })

      expect(hr.landing.cta).toBeDefined()
      expect(hr.landing.cta.title).toBeDefined()
      expect(hr.landing.cta.subtitle).toBeDefined()
      expect(hr.landing.cta.button).toBeDefined()
      expect(hr.landing.cta.secondary).toBeDefined()
    })

    it('should have restaurant-themed content in Croatian', () => {
      expect(hr.landing.hero.title).toContain('restoran')
      expect(hr.landing.hero.subtitle).toContain('rezervacij')
      expect(hr.landing.features.voiceAI.description).toContain('AI')
      expect(hr.landing.features.voiceAI.description).toContain('rezervacij')
      expect((hr.landing.hero.bullets as any[])[0]).toContain('rezervacije')
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
      expect(es.landing.hero.badge).toBeDefined()
      expect(Array.isArray(es.landing.hero.bullets)).toBe(true)
      expect((es.landing.hero.bullets as any[]).length).toBeGreaterThan(0)

      expect(es.landing.features).toBeDefined()
      expect(es.landing.features.title).toBeDefined()
      expect(es.landing.features.subtitle).toBeDefined()
      expect(es.landing.features.voiceAI).toBeDefined()
      expect(es.landing.features.booking).toBeDefined()
      expect(es.landing.features.analytics).toBeDefined()

      expect(es.landing.stats).toBeDefined()
      expect(es.landing.stats.title).toBeDefined()
      expect(es.landing.stats.subtitle).toBeDefined()
      expect(Array.isArray(es.landing.stats.items)).toBe(true)
      expect((es.landing.stats.items as any[]).length).toBeGreaterThanOrEqual(4)
      ;(es.landing.stats.items as any[]).forEach((item) => {
        expect(item.value).toBeTruthy()
        expect(item.label).toBeTruthy()
      })

      expect(es.landing.workflow).toBeDefined()
      expect(es.landing.workflow.title).toBeDefined()
      expect(es.landing.workflow.subtitle).toBeDefined()
      expect(Array.isArray(es.landing.workflow.steps)).toBe(true)
      expect((es.landing.workflow.steps as any[]).length).toBeGreaterThanOrEqual(3)
      ;(es.landing.workflow.steps as any[]).forEach((step) => {
        expect(step.title).toBeTruthy()
        expect(step.description).toBeTruthy()
      })

      expect(es.landing.testimonials).toBeDefined()
      expect(es.landing.testimonials.title).toBeDefined()
      expect(es.landing.testimonials.subtitle).toBeDefined()
      expect(Array.isArray(es.landing.testimonials.items)).toBe(true)
      expect((es.landing.testimonials.items as any[]).length).toBeGreaterThanOrEqual(2)
      ;(es.landing.testimonials.items as any[]).forEach((item) => {
        expect(item.quote).toBeTruthy()
        expect(item.author).toBeTruthy()
        expect(item.role).toBeTruthy()
      })

      expect(es.landing.integrations).toBeDefined()
      expect(es.landing.integrations.title).toBeDefined()
      expect(es.landing.integrations.subtitle).toBeDefined()
      expect(Array.isArray(es.landing.integrations.items)).toBe(true)
      expect((es.landing.integrations.items as any[]).length).toBeGreaterThanOrEqual(3)
      ;(es.landing.integrations.items as any[]).forEach((item) => {
        expect(item).toBeTruthy()
      })

      expect(es.landing.cta).toBeDefined()
      expect(es.landing.cta.title).toBeDefined()
      expect(es.landing.cta.subtitle).toBeDefined()
      expect(es.landing.cta.button).toBeDefined()
      expect(es.landing.cta.secondary).toBeDefined()
    })

    it('should have restaurant-themed content in Spanish', () => {
      expect(es.landing.hero.title).toContain('restaurante')
      expect(es.landing.hero.subtitle).toContain('reservas')
      expect(es.landing.features.voiceAI.description).toContain('IA')
      expect(es.landing.features.voiceAI.description).toContain('reservas')
      expect((es.landing.hero.bullets as any[])[0]).toContain('reservas')
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
        expect(lang.landing.hero.badge).toBeDefined()
        expect(Array.isArray(lang.landing.hero.bullets)).toBe(true)
        expect((lang.landing.hero.bullets as any[]).length).toBeGreaterThan(0)
        expect(lang.landing.features).toBeDefined()
        expect(lang.landing.stats).toBeDefined()
        expect(lang.landing.cta).toBeDefined()
        expect(lang.landing.workflow).toBeDefined()
        expect(lang.landing.testimonials).toBeDefined()
        expect(lang.landing.integrations).toBeDefined()

        // Check features structure
        expect(lang.landing.features.voiceAI).toBeDefined()
        expect(lang.landing.features.booking).toBeDefined()
        expect(lang.landing.features.analytics).toBeDefined()

        // Check stats structure
        const items = lang.landing.stats.items as any[]
        expect(Array.isArray(items)).toBe(true)
        expect(items.length).toBeGreaterThanOrEqual(4)
        items.forEach((item) => {
          expect(item.value).toBeDefined()
          expect(item.label).toBeDefined()
        })

        // Workflow structure
        const steps = lang.landing.workflow.steps as any[]
        expect(Array.isArray(steps)).toBe(true)
        expect(steps.length).toBeGreaterThanOrEqual(3)
        steps.forEach((step) => {
          expect(step.title).toBeDefined()
          expect(step.description).toBeDefined()
        })

        // Testimonials structure
        const testimonialsItems = lang.landing.testimonials.items as any[]
        expect(Array.isArray(testimonialsItems)).toBe(true)
        expect(testimonialsItems.length).toBeGreaterThanOrEqual(2)
        testimonialsItems.forEach((item) => {
          expect(item.quote).toBeDefined()
          expect(item.author).toBeDefined()
          expect(item.role).toBeDefined()
        })

        // Integrations structure
        const integrationsItems = lang.landing.integrations.items as any[]
        expect(Array.isArray(integrationsItems)).toBe(true)
        expect(integrationsItems.length).toBeGreaterThanOrEqual(3)
        integrationsItems.forEach((item) => {
          expect(item).toBeDefined()
        })
      })
    })

    it('should have non-empty strings for all landing page content', () => {
      const languages = [en, ru, hr, es]

      languages.forEach((lang) => {
        expect(lang.landing.hero.title).toBeTruthy()
        expect(lang.landing.hero.subtitle).toBeTruthy()
        expect(lang.landing.hero.ctaPrimary).toBeTruthy()
        expect(lang.landing.hero.ctaSecondary).toBeTruthy()
        expect((lang.landing.hero.bullets as any[]).length).toBeGreaterThan(0)

        expect(lang.landing.features.title).toBeTruthy()
        expect(lang.landing.features.subtitle).toBeTruthy()
        expect(lang.landing.features.voiceAI.title).toBeTruthy()
        expect(lang.landing.features.voiceAI.description).toBeTruthy()
        expect(lang.landing.features.booking.title).toBeTruthy()
        expect(lang.landing.features.booking.description).toBeTruthy()
        expect(lang.landing.features.analytics.title).toBeTruthy()
        expect(lang.landing.features.analytics.description).toBeTruthy()

        expect(lang.landing.stats.title).toBeTruthy()
        expect(lang.landing.stats.subtitle).toBeTruthy()
        const items = lang.landing.stats.items as any[]
        expect(Array.isArray(items)).toBe(true)
        items.forEach((item) => {
          expect(item.value).toBeTruthy()
          expect(item.label).toBeTruthy()
        })

        const steps = lang.landing.workflow.steps as any[]
        expect(Array.isArray(steps)).toBe(true)
        steps.forEach((step) => {
          expect(step.title).toBeTruthy()
          expect(step.description).toBeTruthy()
        })

        const testimonialsItems = lang.landing.testimonials.items as any[]
        expect(Array.isArray(testimonialsItems)).toBe(true)
        testimonialsItems.forEach((item) => {
          expect(item.quote).toBeTruthy()
          expect(item.author).toBeTruthy()
          expect(item.role).toBeTruthy()
        })

        const integrationsItems = lang.landing.integrations.items as any[]
        expect(Array.isArray(integrationsItems)).toBe(true)
        integrationsItems.forEach((item) => {
          expect(item).toBeTruthy()
        })

        expect(lang.landing.cta.title).toBeTruthy()
        expect(lang.landing.cta.subtitle).toBeTruthy()
        expect(lang.landing.cta.button).toBeTruthy()
        expect(lang.landing.cta.secondary).toBeTruthy()
      })
    })
  })
})
