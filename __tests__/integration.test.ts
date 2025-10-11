import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock fetch globally
global.fetch = jest.fn()

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Vapi API Integration', () => {
    it('should handle complete call flow', async () => {
      // Mock successful call creation
      const mockCallResponse = {
        id: 'call-123',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

      // Test call creation
      const callRequest = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const callResponse = await POST(callRequest)
      const callData = await callResponse.json()

      expect(callData.success).toBe(true)
      expect(callData.callId).toBe('call-123')

      // Mock webhook event
      const webhookRequest = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'call-started',
          call: {
            id: 'call-123',
            status: 'in-progress',
          },
        }),
      })

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      const webhookResponse = await webhookPOST(webhookRequest)
      const webhookData = await webhookResponse.json()

      expect(webhookData.success).toBe(true)
      expect(webhookData.message).toBe('Processed call-started event')
    })

    it('should handle assistants API integration', async () => {
      const mockAssistants = [
        {
          id: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
          name: 'BMP Restaurant Assistant',
          voice: { provider: 'vapi', voiceId: 'Elliot' },
          model: { provider: 'openai', model: 'gpt-4o' },
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssistants,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')
      const { GET } = await import('../src/app/api/vapi/assistants/route')
      const response = await GET(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.assistants).toEqual(mockAssistants)
    })
  })

  describe('Language and Middleware Integration', () => {
    it('should handle language detection and routing flow', () => {
      // Test language detection from geo header
      const request = new NextRequest('http://localhost:3000/', {
        headers: {
          'x-vercel-ip-country': 'HR',
        },
      })

      const response = middleware(request)
      expect(response.cookies.get('lang')?.value).toBe('hr')

      // Test locale-prefixed path rewriting
      const localeRequest = new NextRequest('http://localhost:3000/hr/dashboard')
      const localeResponse = middleware(localeRequest)
      expect(localeResponse.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')
    })

    it('should handle complete language switching flow', () => {
      // Start with English
      const initialRequest = new NextRequest('http://localhost:3000/')
      const initialResponse = middleware(initialRequest)
      expect(initialResponse.cookies.get('lang')?.value).toBe('en')

      // Switch to Russian via query parameter
      const russianRequest = new NextRequest('http://localhost:3000/?lang=ru')
      const russianResponse = middleware(russianRequest)
      expect(russianResponse.cookies.get('lang')?.value).toBe('ru')

      // Access Russian-prefixed path
      const russianPathRequest = new NextRequest('http://localhost:3000/ru/dashboard')
      const russianPathResponse = middleware(russianPathRequest)
      expect(russianPathResponse.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle Vapi API errors gracefully', async () => {
      const mockErrorResponse = {
        error: 'Invalid assistant ID',
        code: 'INVALID_ASSISTANT',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'invalid-assistant-id',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to create call')
      expect(data.details).toEqual(mockErrorResponse)
    })

    it('should handle network errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')
      const { GET } = await import('../src/app/api/vapi/assistants/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Webhook Event Processing Integration', () => {
    it('should handle complete webhook event flow', async () => {
      const webhookEvents = [
        {
          type: 'call-started',
          call: { id: 'call-123', status: 'in-progress' },
        },
        {
          type: 'speech-update',
          callId: 'call-123',
          speechUpdate: { message: 'Hello', role: 'user' },
        },
        {
          type: 'function-call',
          callId: 'call-123',
          functionCall: { functionName: 'bookTable', parameters: {} },
        },
        {
          type: 'call-ended',
          call: { id: 'call-123', status: 'completed', transcript: 'Test conversation' },
        },
      ]

      const { POST } = await import('../src/app/api/vapi/webhook/route')

      for (const event of webhookEvents) {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(event),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe(`Processed ${event.type} event`)
      }
    })
  })

  describe('Environment Configuration Integration', () => {
    it('should handle missing environment variables', async () => {
      // Temporarily remove environment variable
      const originalKey = process.env.VAPI_PRIVATE_KEY
      delete process.env.VAPI_PRIVATE_KEY

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('VAPI_PRIVATE_KEY is not configured')

      // Restore environment variable
      process.env.VAPI_PRIVATE_KEY = originalKey
    })
  })

  describe('Landing Page Integration', () => {
    it('should handle landing page routing without redirection', () => {
      // Test root path
      const rootRequest = new NextRequest('http://localhost:3000/')
      const rootResponse = middleware(rootRequest)
      expect(rootResponse.headers.get('location')).toBeNull()

      // Test locale-prefixed root path
      const localeRootRequest = new NextRequest('http://localhost:3000/en/')
      const localeRootResponse = middleware(localeRootRequest)
      expect(localeRootResponse.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/')
    })
  })
})
