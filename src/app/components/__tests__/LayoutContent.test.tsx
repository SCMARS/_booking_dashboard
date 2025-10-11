import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import LayoutContent from '../LayoutContent'
import { AuthProvider } from '../../contexts/AuthContext'
import { LanguageProvider } from '../../contexts/LanguageContext'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Firebase app
jest.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

// Mock the i18n modules
jest.mock('../../i18n/en', () => ({
  default: {
    app: { title: 'AI Bot Admin' },
  },
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <AuthProvider>
        {component}
      </AuthProvider>
    </LanguageProvider>
  )
}

describe('LayoutContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
    ;(usePathname as jest.Mock).mockReturnValue('/')
  })

  it('should render children for landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
  })

  it('should render children for public routes without extra styling', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/login')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="login-content">Login Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('login-content')).toBeInTheDocument()
  })

  it('should render children for register route', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/register')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="register-content">Register Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('register-content')).toBeInTheDocument()
  })

  it('should render children for locale-prefixed public routes', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/login')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="login-content">Login Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('login-content')).toBeInTheDocument()
  })

  it('should render children for locale-prefixed register routes', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/ru/register')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="register-content">Register Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('register-content')).toBeInTheDocument()
  })

  it('should render children for locale-prefixed landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
  })

  it('should not redirect from landing page when user is not authenticated', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should not redirect from locale-prefixed landing page when user is not authenticated', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should not show loading screen on landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
    expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument()
  })

  it('should not show loading screen on locale-prefixed landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByTestId('landing-content')).toBeInTheDocument()
    expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument()
  })

  it('should render children without extra padding for landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const content = screen.getByTestId('landing-content')
    expect(content).toBeInTheDocument()
    
    // Should not have extra padding/background styling
    const parent = content.parentElement
    expect(parent).not.toHaveClass('min-h-screen', 'bg-lightGray', 'p-4', 'md:p-6')
  })

  it('should render children without extra padding for locale-prefixed landing page', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/')
    
    renderWithProviders(
      <LayoutContent>
        <div data-testid="landing-content">Landing Page Content</div>
      </LayoutContent>
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const content = screen.getByTestId('landing-content')
    expect(content).toBeInTheDocument()
    
    // Should not have extra padding/background styling
    const parent = content.parentElement
    expect(parent).not.toHaveClass('min-h-screen', 'bg-lightGray', 'p-4', 'md:p-6')
  })
})
