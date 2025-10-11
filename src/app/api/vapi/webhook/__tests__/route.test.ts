import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

describe('/api/vapi/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should handle call-started event', async () => {
      const webhookData = {
        type: 'call-started',
        call: {
          id: 'call-123',
          phoneNumber: '+1234567890',
          assistantId: 'assistant-456',
          status: 'in-progress',
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed call-started event')
      expect(data.timestamp).toBeDefined()
    })

    it('should handle call-ended event', async () => {
      const webhookData = {
        type: 'call-ended',
        call: {
          id: 'call-123',
          endedReason: 'completed',
          status: 'completed',
          transcript: 'Test conversation transcript',
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed call-ended event')
    })

    it('should handle function-call event', async () => {
      const webhookData = {
        type: 'function-call',
        callId: 'call-123',
        functionCall: {
          functionName: 'bookTable',
          parameters: {
            date: '2024-01-15',
            time: '19:00',
            partySize: 4,
          },
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed function-call event')
    })

    it('should handle speech-update event', async () => {
      const webhookData = {
        type: 'speech-update',
        callId: 'call-123',
        speechUpdate: {
          message: 'Hello, I would like to make a reservation',
          role: 'user',
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed speech-update event')
    })

    it('should handle transcript event', async () => {
      const webhookData = {
        type: 'transcript',
        callId: 'call-123',
        transcript: {
          message: 'Thank you for calling BMP Restaurant',
          role: 'assistant',
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed transcript event')
    })

    it('should handle message event', async () => {
      const webhookData = {
        type: 'message',
        callId: 'call-123',
        message: {
          message: 'What time would you like to make a reservation?',
          role: 'assistant',
        },
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed message event')
    })

    it('should handle unknown event types', async () => {
      const webhookData = {
        type: 'unknown-event',
        data: 'some data',
      }

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed unknown-event event')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(data.message).toBeDefined()
    })

    it('should handle empty body', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET', () => {
    it('should return webhook status', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/webhook')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('Webhook endpoint is active')
      expect(data.timestamp).toBeDefined()
    })
  })
})
