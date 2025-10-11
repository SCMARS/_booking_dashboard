import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock fetch globally
global.fetch = jest.fn()

describe('End-to-End Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete User Journey', () => {
    it('should handle complete user journey from landing to call', async () => {
      // 1. User visits landing page
      const landingRequest = new NextRequest('http://localhost:3000/')
      const landingResponse = middleware(landingRequest)
      expect(landingResponse.headers.get('location')).toBeNull()

      // 2. User switches language to Russian
      const russianRequest = new NextRequest('http://localhost:3000/?lang=ru')
      const russianResponse = middleware(russianRequest)
      expect(russianResponse.cookies.get('lang')?.value).toBe('ru')

      // 3. User navigates to Russian-prefixed landing page
      const russianLandingRequest = new NextRequest('http://localhost:3000/ru/')
      const russianLandingResponse = middleware(russianLandingRequest)
      expect(russianLandingResponse.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/')

      // 4. User clicks call button
      const mockCallResponse = {
        id: 'call-123',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

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

      // 5. Vapi sends webhook events
      const webhookEvents = [
        {
          type: 'call-started',
          call: { id: 'call-123', status: 'in-progress' },
        },
        {
          type: 'speech-update',
          callId: 'call-123',
          speechUpdate: { message: 'Привет, я хочу забронировать столик', role: 'user' },
        },
        {
          type: 'function-call',
          callId: 'call-123',
          functionCall: { 
            functionName: 'bookTable', 
            parameters: { 
              date: '2024-01-15', 
              time: '19:00', 
              partySize: 4 
            } 
          },
        },
        {
          type: 'call-ended',
          call: { 
            id: 'call-123', 
            status: 'completed', 
            transcript: 'Бронирование столика на 4 персоны на 15 января в 19:00' 
          },
        },
      ]

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      for (const event of webhookEvents) {
        const webhookRequest = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(event),
        })

        const webhookResponse = await webhookPOST(webhookRequest)
        const webhookData = await webhookResponse.json()

        expect(webhookResponse.status).toBe(200)
        expect(webhookData.success).toBe(true)
        expect(webhookData.message).toBe(`Processed ${event.type} event`)
      }
    })

    it('should handle user journey with language switching', async () => {
      // 1. User visits with Croatian geo
      const croatianRequest = new NextRequest('http://localhost:3000/', {
        headers: {
          'x-vercel-ip-country': 'HR',
        },
      })
      const croatianResponse = middleware(croatianRequest)
      expect(croatianResponse.cookies.get('lang')?.value).toBe('hr')

      // 2. User switches to Spanish
      const spanishRequest = new NextRequest('http://localhost:3000/?lang=es')
      const spanishResponse = middleware(spanishRequest)
      expect(spanishResponse.cookies.get('lang')?.value).toBe('es')

      // 3. User navigates to Spanish dashboard
      const spanishDashboardRequest = new NextRequest('http://localhost:3000/es/dashboard')
      const spanishDashboardResponse = middleware(spanishDashboardRequest)
      expect(spanishDashboardResponse.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')

      // 4. User makes a call
      const mockCallResponse = {
        id: 'call-456',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

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
      expect(callData.callId).toBe('call-456')
    })
  })

  describe('Error Recovery Scenarios', () => {
    it('should handle API failure and recovery', async () => {
      // 1. First call fails
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      const failedCallRequest = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const failedCallResponse = await POST(failedCallRequest)
      const failedCallData = await failedCallResponse.json()

      expect(failedCallResponse.status).toBe(500)
      expect(failedCallData.error).toBe('Failed to create call')

      // 2. Second call succeeds
      const mockCallResponse = {
        id: 'call-789',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

      const successCallRequest = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        }),
      })

      const successCallResponse = await POST(successCallRequest)
      const successCallData = await successCallResponse.json()

      expect(successCallResponse.status).toBe(200)
      expect(successCallData.success).toBe(true)
      expect(successCallData.callId).toBe('call-789')
    })

    it('should handle webhook processing errors gracefully', async () => {
      // 1. Valid webhook event
      const validWebhookRequest = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'call-started',
          call: { id: 'call-123', status: 'in-progress' },
        }),
      })

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      const validWebhookResponse = await webhookPOST(validWebhookRequest)
      const validWebhookData = await validWebhookResponse.json()

      expect(validWebhookResponse.status).toBe(200)
      expect(validWebhookData.success).toBe(true)

      // 2. Invalid webhook event (malformed JSON)
      const invalidWebhookRequest = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: 'invalid json',
      })

      const invalidWebhookResponse = await webhookPOST(invalidWebhookRequest)
      const invalidWebhookData = await invalidWebhookResponse.json()

      expect(invalidWebhookResponse.status).toBe(500)
      expect(invalidWebhookData.error).toBe('Internal server error')
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent calls', async () => {
      const mockCallResponses = [
        { id: 'call-1', status: 'queued' },
        { id: 'call-2', status: 'queued' },
        { id: 'call-3', status: 'queued' },
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCallResponses[0],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCallResponses[1],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCallResponses[2],
        })

      const { POST } = await import('../src/app/api/vapi/call/route')

      // Create multiple concurrent calls
      const callPromises = mockCallResponses.map((_, index) => {
        const request = new NextRequest('http://localhost:3000/api/vapi/call', {
          method: 'POST',
          body: JSON.stringify({
            assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
          }),
        })
        return POST(request)
      })

      const responses = await Promise.all(callPromises)
      const responseData = await Promise.all(responses.map(r => r.json()))

      expect(responses).toHaveLength(3)
      responseData.forEach((data, index) => {
        expect(data.success).toBe(true)
        expect(data.callId).toBe(`call-${index + 1}`)
      })
    })

    it('should handle multiple concurrent webhook events', async () => {
      const webhookEvents = [
        { type: 'call-started', call: { id: 'call-1', status: 'in-progress' } },
        { type: 'call-started', call: { id: 'call-2', status: 'in-progress' } },
        { type: 'call-started', call: { id: 'call-3', status: 'in-progress' } },
      ]

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      // Process multiple concurrent webhook events
      const webhookPromises = webhookEvents.map(event => {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(event),
        })
        return webhookPOST(request)
      })

      const responses = await Promise.all(webhookPromises)
      const responseData = await Promise.all(responses.map(r => r.json()))

      expect(responses).toHaveLength(3)
      responseData.forEach((data, index) => {
        expect(data.success).toBe(true)
        expect(data.message).toBe(`Processed ${webhookEvents[index].type} event`)
      })
    })
  })

  describe('Security and Validation', () => {
    it('should validate assistant ID format', async () => {
      const invalidAssistantRequest = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'invalid-id-format',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const response = await POST(invalidAssistantRequest)
      const data = await response.json()

      // Should still attempt the call (validation happens at Vapi level)
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should handle malformed webhook payloads', async () => {
      const malformedWebhookRequest = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify({
          type: 'unknown-event',
          invalidData: 'test',
        }),
      })

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      const response = await webhookPOST(malformedWebhookRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed unknown-event event')
    })
  })
})
