import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { onAuthStateChanged, signOut } from 'firebase/auth'

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

// Test component to access context
const TestComponent = () => {
  const { user, loading, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide loading state initially', () => {
    const mockUnsubscribe = jest.fn()
    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Don't call callback immediately to test loading state
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should update user state when auth state changes', async () => {
    const mockUnsubscribe = jest.fn()
    let authCallback: (user: any) => void

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate user login
    const mockUser = { email: 'test@example.com', uid: '123' }
    act(() => {
      authCallback(mockUser)
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should handle user logout', async () => {
    const mockUnsubscribe = jest.fn()
    let authCallback: (user: any) => void

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate user login first
    const mockUser = { email: 'test@example.com', uid: '123' }
    act(() => {
      authCallback(mockUser)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Click logout button
    act(() => {
      screen.getByText('Logout').click()
    })

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
  })

  it('should handle logout error', async () => {
    const mockUnsubscribe = jest.fn()
    let authCallback: (user: any) => void

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    ;(signOut as jest.Mock).mockRejectedValue(new Error('Logout failed'))

    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate user login first
    const mockUser = { email: 'test@example.com', uid: '123' }
    act(() => {
      authCallback(mockUser)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Click logout button
    act(() => {
      screen.getByText('Logout').click()
    })

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Ошибка при выходе:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should handle null user (logout)', async () => {
    const mockUnsubscribe = jest.fn()
    let authCallback: (user: any) => void

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate user logout (null user)
    act(() => {
      authCallback(null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn()
    ;(onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe)

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
