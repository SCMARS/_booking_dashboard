import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock fetch globally
global.fetch = jest.fn()

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Language Support', () => {
    it('should support all required languages', () => {
      const supportedLanguages = ['en', 'ru', 'hr', 'es']
      
      supportedLanguages.forEach(lang => {
        const request = new NextRequest(`http://localhost:3000/?lang=${lang}`)
        const response = middleware(request)
        
        expect(response.cookies.get('lang')?.value).toBe(lang)
        expect(response.cookies.get('NEXT_LOCALE')?.value).toBe(lang)
      })
    })

    it('should handle language switching gracefully', () => {
      const languageSwitches = [
        { from: 'en', to: 'ru' },
        { from: 'ru', to: 'hr' },
        { from: 'hr', to: 'es' },
        { from: 'es', to: 'en' },
      ]

      languageSwitches.forEach(({ from, to }) => {
        // Start with one language
        const initialRequest = new NextRequest(`http://localhost:3000/?lang=${from}`)
        const initialResponse = middleware(initialRequest)
        expect(initialResponse.cookies.get('lang')?.value).toBe(from)

        // Switch to another language
        const switchRequest = new NextRequest(`http://localhost:3000/?lang=${to}`)
        const switchResponse = middleware(switchRequest)
        expect(switchResponse.cookies.get('lang')?.value).toBe(to)
      })
    })

    it('should maintain language preference across requests', () => {
      const request = new NextRequest('http://localhost:3000/?lang=hr')
      const response = middleware(request)
      
      expect(response.cookies.get('lang')?.value).toBe('hr')
      expect(response.cookies.get('NEXT_LOCALE')?.value).toBe('hr')
      
      // Cookie should persist for future requests
      const followUpRequest = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'lang=hr; NEXT_LOCALE=hr',
        },
      })
      const followUpResponse = middleware(followUpRequest)
      
      expect(followUpResponse.headers.get('location')).toBe('http://localhost:3000/hr/dashboard')
    })
  })

  describe('Geographic Accessibility', () => {
    it('should detect language from geographic location', () => {
      const geoLanguageMappings = [
        { country: 'HR', expectedLang: 'hr' },
        { country: 'ES', expectedLang: 'es' },
        { country: 'US', expectedLang: 'en' },
        { country: 'GB', expectedLang: 'en' },
        { country: 'CA', expectedLang: 'en' },
        { country: 'AU', expectedLang: 'en' },
        { country: 'RU', expectedLang: 'en' }, // Not mapped, defaults to en
        { country: 'FR', expectedLang: 'en' }, // Not mapped, defaults to en
      ]

      geoLanguageMappings.forEach(({ country, expectedLang }) => {
        const request = new NextRequest('http://localhost:3000/', {
          headers: {
            'x-vercel-ip-country': country,
          },
        })
        const response = middleware(request)
        
        expect(response.cookies.get('lang')?.value).toBe(expectedLang)
      })
    })

    it('should handle multiple geo headers gracefully', () => {
      const request = new NextRequest('http://localhost:3000/', {
        headers: {
          'x-vercel-ip-country': 'HR',
          'cf-ipcountry': 'ES',
          'x-geo-country': 'US',
        },
      })
      const response = middleware(request)
      
      // Should use the first valid header (x-vercel-ip-country)
      expect(response.cookies.get('lang')?.value).toBe('hr')
    })
  })

  describe('URL Accessibility', () => {
    it('should handle all supported locale prefixes', () => {
      const supportedLocales = ['en', 'ru', 'hr', 'es']
      
      supportedLocales.forEach(locale => {
        const request = new NextRequest(`http://localhost:3000/${locale}/dashboard`)
        const response = middleware(request)
        
        expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')
      })
    })

    it('should handle nested paths with locale prefixes', () => {
      const nestedPaths = [
        '/en/settings/profile',
        '/ru/dashboard/analytics',
        '/hr/bookings/calendar',
        '/es/logs/details',
      ]

      nestedPaths.forEach(path => {
        const request = new NextRequest(`http://localhost:3000${path}`)
        const response = middleware(request)
        
        const expectedRewrite = `http://localhost:3000${path.substring(3)}` // Remove locale prefix
        expect(response.headers.get('x-middleware-rewrite')).toBe(expectedRewrite)
      })
    })

    it('should handle root paths with locale prefixes', () => {
      const rootPaths = ['/en/', '/ru/', '/hr/', '/es/']
      
      rootPaths.forEach(path => {
        const request = new NextRequest(`http://localhost:3000${path}`)
        const response = middleware(request)
        
        expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/')
      })
    })
  })

  describe('Query Parameter Accessibility', () => {
    it('should preserve query parameters in redirects', () => {
      const request = new NextRequest('http://localhost:3000/dashboard?tab=settings&id=123&filter=active')
      const response = middleware(request)
      
      const redirectLocation = response.headers.get('location')
      expect(redirectLocation).toBe('http://localhost:3000/en/dashboard?tab=settings&id=123&filter=active')
    })

    it('should preserve query parameters in rewrites', () => {
      const request = new NextRequest('http://localhost:3000/ru/dashboard?tab=settings&id=123&filter=active')
      const response = middleware(request)
      
      const rewriteLocation = response.headers.get('x-middleware-rewrite')
      expect(rewriteLocation).toBe('http://localhost:3000/dashboard?tab=settings&id=123&filter=active')
    })

    it('should handle special characters in query parameters', () => {
      const request = new NextRequest('http://localhost:3000/dashboard?search=hello%20world&filter=active%2Binactive')
      const response = middleware(request)
      
      const redirectLocation = response.headers.get('location')
      expect(redirectLocation).toBe('http://localhost:3000/en/dashboard?search=hello%20world&filter=active%2Binactive')
    })
  })

  describe('Cookie Accessibility', () => {
    it('should set accessible cookie attributes', () => {
      const request = new NextRequest('http://localhost:3000/?lang=ru')
      const response = middleware(request)
      
      const langCookie = response.cookies.get('lang')
      const nextLocaleCookie = response.cookies.get('NEXT_LOCALE')
      
      expect(langCookie?.value).toBe('ru')
      expect(langCookie?.path).toBe('/')
      expect(langCookie?.sameSite).toBe('lax')
      expect(langCookie?.maxAge).toBe(60 * 60 * 24 * 365) // 1 year
      
      expect(nextLocaleCookie?.value).toBe('ru')
      expect(nextLocaleCookie?.path).toBe('/')
      expect(nextLocaleCookie?.sameSite).toBe('lax')
      expect(nextLocaleCookie?.maxAge).toBe(60 * 60 * 24 * 365) // 1 year
    })

    it('should handle cookie expiration gracefully', () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'lang=ru; NEXT_LOCALE=hr', // Mixed languages
        },
      })
      const response = middleware(request)
      
      // Should use NEXT_LOCALE if available
      expect(response.headers.get('location')).toBe('http://localhost:3000/hr/dashboard')
    })
  })

  describe('Error Handling Accessibility', () => {
    it('should handle invalid locale gracefully', () => {
      const invalidLocaleRequests = [
        new NextRequest('http://localhost:3000/?lang=invalid'),
        new NextRequest('http://localhost:3000/?lang='),
        new NextRequest('http://localhost:3000/?lang=null'),
        new NextRequest('http://localhost:3000/?lang=undefined'),
      ]

      invalidLocaleRequests.forEach(request => {
        const response = middleware(request)
        
        // Should not crash and should handle gracefully
        expect(response).toBeDefined()
        expect(response.status).toBe(200)
      })
    })

    it('should handle missing locale gracefully', () => {
      const request = new NextRequest('http://localhost:3000/dashboard')
      const response = middleware(request)
      
      // Should redirect to default locale
      expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
    })

    it('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'http://localhost:3000//dashboard', // Double slash
        'http://localhost:3000/dashboard/', // Trailing slash
        'http://localhost:3000/dashboard///', // Multiple slashes
        'http://localhost:3000/dashboard?', // Empty query
        'http://localhost:3000/dashboard?#', // Empty fragment
      ]

      malformedUrls.forEach(url => {
        const request = new NextRequest(url)
        const response = middleware(request)
        
        expect(response).toBeDefined()
        expect(response.status).toBe(200)
      })
    })
  })

  describe('API Accessibility', () => {
    it('should handle webhook events from different sources', async () => {
      const webhookEvents = [
        {
          type: 'call-started',
          call: { id: 'call-123', status: 'in-progress' },
          source: 'vapi',
        },
        {
          type: 'call-ended',
          call: { id: 'call-123', status: 'completed' },
          source: 'vapi',
        },
        {
          type: 'function-call',
          callId: 'call-123',
          functionCall: { functionName: 'bookTable', parameters: {} },
          source: 'vapi',
        },
      ]

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      for (const event of webhookEvents) {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(event),
        })

        const response = await webhookPOST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe(`Processed ${event.type} event`)
      }
    })

    it('should handle API requests with different content types', async () => {
      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      const webhookEvent = {
        type: 'call-started',
        call: { id: 'call-123', status: 'in-progress' },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await webhookPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
