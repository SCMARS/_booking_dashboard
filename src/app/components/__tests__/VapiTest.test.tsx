import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VapiTest from '../VapiTest'

// Mock fetch
global.fetch = jest.fn()

describe('VapiTest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render test buttons', () => {
    render(<VapiTest />)
    
    expect(screen.getByText('Vapi API Test Suite')).toBeInTheDocument()
    expect(screen.getByText('Test Webhook')).toBeInTheDocument()
    expect(screen.getByText('Test Assistants API')).toBeInTheDocument()
    expect(screen.getByText('Test Call API')).toBeInTheDocument()
  })

  it('should show initial status for all tests', () => {
    render(<VapiTest />)
    
    expect(screen.getByText('Not tested')).toBeInTheDocument()
    expect(screen.getAllByText('Not tested')).toHaveLength(3)
  })

  it('should test webhook endpoint successfully', async () => {
    const mockResponse = {
      status: 'Webhook endpoint is active',
      timestamp: '2024-01-15T10:00:00Z'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<VapiTest />)
    
    const webhookButton = screen.getByText('Test Webhook')
    fireEvent.click(webhookButton)

    await waitFor(() => {
      expect(screen.getByText(/✅ Webhook test:/)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/vapi/webhook')
  })

  it('should test webhook endpoint with error', async () => {
    const mockErrorResponse = {
      error: 'Webhook not found'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    })

    render(<VapiTest />)
    
    const webhookButton = screen.getByText('Test Webhook')
    fireEvent.click(webhookButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Webhook test:/)).toBeInTheDocument()
    })
  })

  it('should test webhook endpoint with network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<VapiTest />)
    
    const webhookButton = screen.getByText('Test Webhook')
    fireEvent.click(webhookButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Webhook test: Network error/)).toBeInTheDocument()
    })
  })

  it('should test assistants API successfully', async () => {
    const mockResponse = {
      success: true,
      assistants: [
        { id: 'assistant-1', name: 'Test Assistant' }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<VapiTest />)
    
    const assistantsButton = screen.getByText('Test Assistants API')
    fireEvent.click(assistantsButton)

    await waitFor(() => {
      expect(screen.getByText(/✅ Assistants test:/)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/vapi/assistants')
  })

  it('should test assistants API with error', async () => {
    const mockErrorResponse = {
      error: 'Unauthorized'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    })

    render(<VapiTest />)
    
    const assistantsButton = screen.getByText('Test Assistants API')
    fireEvent.click(assistantsButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Assistants test:/)).toBeInTheDocument()
    })
  })

  it('should test assistants API with network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<VapiTest />)
    
    const assistantsButton = screen.getByText('Test Assistants API')
    fireEvent.click(assistantsButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Assistants test: Network error/)).toBeInTheDocument()
    })
  })

  it('should test call API successfully', async () => {
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

    render(<VapiTest />)
    
    const callButton = screen.getByText('Test Call API')
    fireEvent.click(callButton)

    await waitFor(() => {
      expect(screen.getByText(/✅ Call test:/)).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/vapi/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        phoneNumber: '+1234567890',
      }),
    })
  })

  it('should test call API with error', async () => {
    const mockErrorResponse = {
      error: 'Invalid assistant ID'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse,
    })

    render(<VapiTest />)
    
    const callButton = screen.getByText('Test Call API')
    fireEvent.click(callButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Call test:/)).toBeInTheDocument()
    })
  })

  it('should test call API with network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<VapiTest />)
    
    const callButton = screen.getByText('Test Call API')
    fireEvent.click(callButton)

    await waitFor(() => {
      expect(screen.getByText(/❌ Call test: Network error/)).toBeInTheDocument()
    })
  })

  it('should show loading state while testing', async () => {
    // Mock a delayed response
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100)
      )
    )

    render(<VapiTest />)
    
    const webhookButton = screen.getByText('Test Webhook')
    fireEvent.click(webhookButton)

    // Should show loading state
    expect(screen.getByText('Testing...')).toBeInTheDocument()
  })

  it('should handle multiple test clicks independently', async () => {
    const mockWebhookResponse = { status: 'active' }
    const mockAssistantsResponse = { success: true, assistants: [] }
    const mockCallResponse = { success: true, callId: 'call-123' }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWebhookResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssistantsResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

    render(<VapiTest />)
    
    // Click all buttons
    fireEvent.click(screen.getByText('Test Webhook'))
    fireEvent.click(screen.getByText('Test Assistants API'))
    fireEvent.click(screen.getByText('Test Call API'))

    await waitFor(() => {
      expect(screen.getByText(/✅ Webhook test:/)).toBeInTheDocument()
      expect(screen.getByText(/✅ Assistants test:/)).toBeInTheDocument()
      expect(screen.getByText(/✅ Call test:/)).toBeInTheDocument()
    })
  })

  it('should maintain separate status for each test', async () => {
    const mockWebhookResponse = { status: 'active' }
    const mockAssistantsError = { error: 'Unauthorized' }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockWebhookResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => mockAssistantsError,
      })

    render(<VapiTest />)
    
    // Click webhook button (success)
    fireEvent.click(screen.getByText('Test Webhook'))
    
    // Click assistants button (error)
    fireEvent.click(screen.getByText('Test Assistants API'))

    await waitFor(() => {
      expect(screen.getByText(/✅ Webhook test:/)).toBeInTheDocument()
      expect(screen.getByText(/❌ Assistants test:/)).toBeInTheDocument()
    })
  })
})
