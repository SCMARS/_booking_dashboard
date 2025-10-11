import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CallButton from '../CallButton'
import { LanguageProvider } from '../../contexts/LanguageContext'

// Mock fetch
global.fetch = jest.fn()

// Mock the i18n modules
jest.mock('../../i18n/en', () => ({
  default: {
    landing: {
      cta: {
        callAI: 'Call AI Assistant',
      },
    },
  },
}))

jest.mock('../../i18n/ru', () => ({
  default: {
    landing: {
      cta: {
        callAI: 'Позвонить AI-ассистенту',
      },
    },
  },
}))

jest.mock('../../i18n/hr', () => ({
  default: {
    landing: {
      cta: {
        callAI: 'Pozovi AI asistenta',
      },
    },
  },
}))

jest.mock('../../i18n/es', () => ({
  default: {
    landing: {
      cta: {
        callAI: 'Llamar al asistente de IA',
      },
    },
  },
}))

const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  )
}

describe('CallButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render with correct props', async () => {
    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByText('Call AI Assistant')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should initiate call when button is clicked', async () => {
    const mockResponse = {
      success: true,
      callId: 'call-123',
      status: 'queued',
      message: 'Call initiated successfully'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Call initiated successfully!')).toBeInTheDocument()
    })
  })

  it('should show loading state while calling', async () => {
    // Mock a delayed response
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, callId: 'call-123' }),
        }), 100)
      )
    )

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Should show loading state
    expect(screen.getByText('Calling...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('should handle API errors', async () => {
    const mockErrorResponse = {
      error: 'Failed to create call',
      details: { message: 'Invalid assistant ID' }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    })

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="invalid-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to initiate call: Failed to create call')).toBeInTheDocument()
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })
  })

  it('should use default assistant ID when not provided', async () => {
    const mockResponse = {
      success: true,
      callId: 'call-123',
      status: 'queued',
      message: 'Call initiated successfully'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vapi/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        }),
      })
    })
  })

  it('should reset button state after successful call', async () => {
    const mockResponse = {
      success: true,
      callId: 'call-123',
      status: 'queued',
      message: 'Call initiated successfully'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Call initiated successfully!')).toBeInTheDocument()
    })

    // Button should be enabled again
    expect(button).not.toBeDisabled()
    expect(screen.getByText('Call AI Assistant')).toBeInTheDocument()
  })

  it('should reset button state after error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument()
    })

    // Button should be enabled again
    expect(button).not.toBeDisabled()
    expect(screen.getByText('Call AI Assistant')).toBeInTheDocument()
  })

  it('should display translated text based on language', async () => {
    // Set language to Russian
    localStorage.setItem('lang', 'ru')
    
    renderWithLanguageProvider(
      <CallButton 
        phoneNumber="+1234567890" 
        assistantId="test-assistant-id" 
      />
    )
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(screen.getByText('Позвонить AI-ассистенту')).toBeInTheDocument()
  })
})
