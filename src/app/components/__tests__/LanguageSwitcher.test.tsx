import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../LanguageSwitcher'
import { LanguageProvider } from '../../contexts/LanguageContext'

// Mock the i18n modules
jest.mock('../../i18n/en', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Dashboard' },
  },
}))

jest.mock('../../i18n/ru', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Дашборд' },
  },
}))

jest.mock('../../i18n/hr', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Nadzorna ploča' },
  },
}))

jest.mock('../../i18n/es', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
    nav: { dashboard: 'Panel' },
  },
}))

const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Clear localStorage and cookies
    localStorage.clear()
    document.cookie = ''
    
    // Mock window.location
    delete (window as any).location
    window.location = { pathname: '/' } as any
  })

  it('should render with default English language', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    // Wait for async dictionary loading
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('should open dropdown when clicked', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('🇷🇺')).toBeInTheDocument()
    expect(screen.getByText('Русский')).toBeInTheDocument()
    expect(screen.getByText('🇭🇷')).toBeInTheDocument()
    expect(screen.getByText('Hrvatski')).toBeInTheDocument()
    expect(screen.getByText('🇪🇸')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('should close dropdown when clicking outside', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Verify dropdown is open
    expect(screen.getByText('Русский')).toBeInTheDocument()
    
    // Click outside (on document body)
    fireEvent.click(document.body)
    
    // Dropdown should be closed (Russian text should not be visible)
    expect(screen.queryByText('Русский')).not.toBeInTheDocument()
  })

  it('should change language when option is clicked', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click on Russian option
    const russianOption = screen.getByText('Русский')
    fireEvent.click(russianOption)
    
    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify language changed
    expect(screen.getByText('🇷🇺')).toBeInTheDocument()
    expect(screen.getByText('Русский')).toBeInTheDocument()
    
    // Verify dropdown is closed
    expect(screen.queryByText('Hrvatski')).not.toBeInTheDocument()
  })

  it('should change to Croatian language', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click on Croatian option
    const croatianOption = screen.getByText('Hrvatski')
    fireEvent.click(croatianOption)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify language changed
    expect(screen.getByText('🇭🇷')).toBeInTheDocument()
    expect(screen.getByText('Hrvatski')).toBeInTheDocument()
  })

  it('should change to Spanish language', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click on Spanish option
    const spanishOption = screen.getByText('Español')
    fireEvent.click(spanishOption)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify language changed
    expect(screen.getByText('🇪🇸')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('should save language to localStorage when changed', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click on Russian option
    const russianOption = screen.getByText('Русский')
    fireEvent.click(russianOption)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify language was saved to localStorage
    expect(localStorage.getItem('lang')).toBe('ru')
  })

  it('should save language to cookies when changed', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Click on Russian option
    const russianOption = screen.getByText('Русский')
    fireEvent.click(russianOption)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Verify language was saved to cookies
    expect(document.cookie).toContain('lang=ru')
    expect(document.cookie).toContain('NEXT_LOCALE=ru')
  })

  it('should toggle dropdown when button is clicked multiple times', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    
    // First click - open dropdown
    fireEvent.click(button)
    expect(screen.getByText('Русский')).toBeInTheDocument()
    
    // Second click - close dropdown
    fireEvent.click(button)
    expect(screen.queryByText('Русский')).not.toBeInTheDocument()
    
    // Third click - open dropdown again
    fireEvent.click(button)
    expect(screen.getByText('Русский')).toBeInTheDocument()
  })

  it('should show correct flag and name for each language', async () => {
    renderWithLanguageProvider(<LanguageSwitcher />)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Verify all language options are present with correct flags and names
    expect(screen.getByText('🇺🇸')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    
    expect(screen.getByText('🇷🇺')).toBeInTheDocument()
    expect(screen.getByText('Русский')).toBeInTheDocument()
    
    expect(screen.getByText('🇭🇷')).toBeInTheDocument()
    expect(screen.getByText('Hrvatski')).toBeInTheDocument()
    
    expect(screen.getByText('🇪🇸')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })
})
