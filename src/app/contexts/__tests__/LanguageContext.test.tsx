import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../LanguageContext'

// Mock the i18n modules
jest.mock('../../i18n/en', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Dashboard' },
    auth: { login: 'Login' },
  },
}))

jest.mock('../../i18n/ru', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Дашборд' },
    auth: { login: 'Вход' },
  },
}))

jest.mock('../../i18n/hr', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Nadzorna ploča' },
    auth: { login: 'Prijava' },
  },
}))

jest.mock('../../i18n/es', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Panel' },
    auth: { login: 'Iniciar sesión' },
  },
}))

// Test component to access context
const TestComponent = () => {
  const { language, setLanguage, t } = useLanguage()
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="translated-text">{t('nav.dashboard')}</div>
      <button onClick={() => setLanguage('ru')}>Set Russian</button>
      <button onClick={() => setLanguage('hr')}>Set Croatian</button>
      <button onClick={() => setLanguage('es')}>Set Spanish</button>
    </div>
  )
}

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage and cookies
    localStorage.clear()
    document.cookie = ''
    
    // Mock window.location
    delete (window as any).location
    window.location = { pathname: '/' } as any
  })

  it('should provide default English language', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      // Wait for async dictionary loading
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('en')
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Dashboard')
  })

  it('should change language when setLanguage is called', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Click Russian button
    act(() => {
      screen.getByText('Set Russian').click()
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('ru')
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Дашборд')
  })

  it('should change to Croatian language', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    act(() => {
      screen.getByText('Set Croatian').click()
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('hr')
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Nadzorna ploča')
  })

  it('should change to Spanish language', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    act(() => {
      screen.getByText('Set Spanish').click()
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('es')
    expect(screen.getByTestId('translated-text')).toHaveTextContent('Panel')
  })

  it('should return key when translation is missing', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    const { t } = useLanguage()
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('should detect language from URL path', async () => {
    // Mock URL with Russian locale
    window.location = { pathname: '/ru/dashboard' } as any

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('ru')
  })

  it('should detect language from localStorage', async () => {
    localStorage.setItem('lang', 'hr')

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('hr')
  })

  it('should detect language from cookies', async () => {
    document.cookie = 'lang=es; path=/'

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('es')
  })

  it('should detect language from navigator.language', async () => {
    // Mock navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'ru-RU',
      configurable: true,
    })

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('current-language')).toHaveTextContent('ru')
  })

  it('should save language to localStorage and cookies when changed', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    )

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    act(() => {
      screen.getByText('Set Russian').click()
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(localStorage.getItem('lang')).toBe('ru')
    expect(document.cookie).toContain('lang=ru')
    expect(document.cookie).toContain('NEXT_LOCALE=ru')
  })
})
