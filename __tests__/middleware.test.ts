import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set language cookie from query parameter', () => {
    const request = new NextRequest('http://localhost:3000/?lang=ru')
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('ru')
    expect(response.cookies.get('NEXT_LOCALE')?.value).toBe('ru')
  })

  it('should set language cookie from geo query parameter', () => {
    const request = new NextRequest('http://localhost:3000/?geo=HR')
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('hr')
    expect(response.cookies.get('NEXT_LOCALE')?.value).toBe('hr')
  })

  it('should set language cookie from geo query parameter for Spain', () => {
    const request = new NextRequest('http://localhost:3000/?geo=ES')
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('es')
    expect(response.cookies.get('NEXT_LOCALE')?.value).toBe('es')
  })

  it('should default to English for unknown geo', () => {
    const request = new NextRequest('http://localhost:3000/?geo=US')
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('en')
    expect(response.cookies.get('NEXT_LOCALE')?.value).toBe('en')
  })

  it('should detect country from Vercel geo header', () => {
    const request = new NextRequest('http://localhost:3000/', {
      headers: {
        'x-vercel-ip-country': 'HR',
      },
    })
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('hr')
  })

  it('should detect country from Cloudflare header', () => {
    const request = new NextRequest('http://localhost:3000/', {
      headers: {
        'cf-ipcountry': 'ES',
      },
    })
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('es')
  })

  it('should detect country from custom geo header', () => {
    const request = new NextRequest('http://localhost:3000/', {
      headers: {
        'x-geo-country': 'RU',
      },
    })
    const response = middleware(request)

    expect(response.cookies.get('lang')?.value).toBe('en') // RU not mapped, defaults to en
  })

  it('should rewrite locale-prefixed paths', () => {
    const request = new NextRequest('http://localhost:3000/ru/dashboard')
    const response = middleware(request)

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')
  })

  it('should rewrite locale-prefixed root path', () => {
    const request = new NextRequest('http://localhost:3000/ru/')
    const response = middleware(request)

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/')
  })

  it('should rewrite locale-prefixed nested paths', () => {
    const request = new NextRequest('http://localhost:3000/en/settings/profile')
    const response = middleware(request)

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/settings/profile')
  })

  it('should allow root path without redirection', () => {
    const request = new NextRequest('http://localhost:3000/')
    const response = middleware(request)

    expect(response.headers.get('location')).toBeNull()
    expect(response.status).toBe(200)
  })

  it('should redirect non-locale paths to locale-prefixed versions', () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
    expect(response.status).toBe(307)
  })

  it('should redirect non-locale paths with existing locale cookie', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'lang=ru; NEXT_LOCALE=ru',
      },
    })
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/ru/dashboard')
    expect(response.status).toBe(307)
  })

  it('should redirect non-locale paths with NEXT_LOCALE cookie', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'NEXT_LOCALE=hr',
      },
    })
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/hr/dashboard')
    expect(response.status).toBe(307)
  })

  it('should preserve query parameters in redirects', () => {
    const request = new NextRequest('http://localhost:3000/dashboard?tab=settings&id=123')
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard?tab=settings&id=123')
  })

  it('should preserve query parameters in rewrites', () => {
    const request = new NextRequest('http://localhost:3000/ru/dashboard?tab=settings&id=123')
    const response = middleware(request)

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard?tab=settings&id=123')
  })

  it('should handle invalid locale in cookie gracefully', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'lang=invalid; NEXT_LOCALE=invalid',
      },
    })
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
  })

  it('should handle empty locale in cookie gracefully', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'lang=; NEXT_LOCALE=',
      },
    })
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
  })

  it('should handle missing locale in cookie gracefully', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'other=value',
      },
    })
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard')
  })

  it('should handle complex paths with multiple segments', () => {
    const request = new NextRequest('http://localhost:3000/settings/profile/security')
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/settings/profile/security')
  })

  it('should handle paths with trailing slashes', () => {
    const request = new NextRequest('http://localhost:3000/dashboard/')
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard/')
  })

  it('should handle paths with multiple trailing slashes', () => {
    const request = new NextRequest('http://localhost:3000/dashboard///')
    const response = middleware(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/en/dashboard///')
  })
})
