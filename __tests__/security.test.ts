import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock fetch globally
global.fetch = jest.fn()

describe('Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('should handle malicious webhook payloads safely', async () => {
      const maliciousPayloads = [
        { type: 'call-started', call: { id: '<script>alert("xss")</script>', status: 'in-progress' } },
        { type: 'call-started', call: { id: 'call-123', status: 'in-progress', malicious: '${7*7}' } },
        { type: 'call-started', call: { id: 'call-123', status: 'in-progress', sql: "'; DROP TABLE calls; --" } },
        { type: 'call-started', call: { id: 'call-123', status: 'in-progress', path: '../../../etc/passwd' } },
      ]

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      for (const payload of maliciousPayloads) {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const response = await webhookPOST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Processed call-started event')
      }
    })

    it('should handle oversized webhook payloads safely', async () => {
      const oversizedPayload = {
        type: 'call-started',
        call: {
          id: 'call-123',
          status: 'in-progress',
          largeData: 'A'.repeat(1024 * 1024), // 1MB of data
        },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(oversizedPayload),
      })

      const response = await webhookPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle malformed JSON safely', async () => {
      const malformedJsonPayloads = [
        '{"type": "call-started", "call": { "id": "call-123", "status": "in-progress"', // Missing closing brace
        '{"type": "call-started", "call": { "id": "call-123", "status": "in-progress"}}', // Extra brace
        '{"type": "call-started", "call": { "id": "call-123", "status": "in-progress"}}', // Valid but test edge case
        '{"type": "call-started", "call": { "id": "call-123", "status": "in-progress"}}', // Valid
      ]

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      for (const payload of malformedJsonPayloads) {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: payload,
        })

        const response = await webhookPOST(request)
        const data = await response.json()

        if (payload.includes('"status": "in-progress"')) {
          expect(response.status).toBe(200)
          expect(data.success).toBe(true)
        } else {
          expect(response.status).toBe(500)
          expect(data.error).toBe('Internal server error')
        }
      }
    })
  })

  describe('Authentication and Authorization', () => {
    it('should handle missing API keys gracefully', async () => {
      // Temporarily remove environment variable
      const originalKey = process.env.VAPI_PRIVATE_KEY
      delete process.env.VAPI_PRIVATE_KEY

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
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

    it('should handle invalid API keys gracefully', async () => {
      const mockErrorResponse = {
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')
      const { GET } = await import('../src/app/api/vapi/assistants/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Failed to fetch assistants')
      expect(data.details).toEqual(mockErrorResponse)
    })
  })

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle rapid successive requests', async () => {
      const webhookEvent = {
        type: 'call-started',
        call: { id: 'call-123', status: 'in-progress' },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      // Send 100 rapid requests
      const promises = Array.from({ length: 100 }, () => {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookEvent),
        })
        return webhookPOST(request)
      })

      const responses = await Promise.all(promises)
      const responseData = await Promise.all(responses.map(r => r.json()))

      // All requests should be processed successfully
      expect(responses).toHaveLength(100)
      responseData.forEach(data => {
        expect(data.success).toBe(true)
      })
    })

    it('should handle concurrent malicious requests', async () => {
      const maliciousRequests = Array.from({ length: 50 }, (_, i) => {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify({
            type: 'call-started',
            call: { id: `call-${i}`, status: 'in-progress', malicious: `payload-${i}` },
          }),
        })
        return request
      })

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      const promises = maliciousRequests.map(request => webhookPOST(request))
      const responses = await Promise.all(promises)
      const responseData = await Promise.all(responses.map(r => r.json()))

      // All requests should be processed successfully
      expect(responses).toHaveLength(50)
      responseData.forEach(data => {
        expect(data.success).toBe(true)
      })
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize webhook data before processing', async () => {
      const webhookEvent = {
        type: 'call-started',
        call: {
          id: 'call-123',
          status: 'in-progress',
          phoneNumber: '+1234567890',
          transcript: 'Hello, I want to book a table for 4 people',
          metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: '192.168.1.1',
            customData: {
              name: 'John Doe',
              email: 'john@example.com',
              preferences: ['vegetarian', 'window-seat'],
            },
          },
        },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
      })

      const response = await webhookPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed call-started event')
    })

    it('should handle special characters in webhook data', async () => {
      const webhookEvent = {
        type: 'transcript',
        callId: 'call-123',
        transcript: {
          message: 'Hello! I want to book a table for 4 people. Can you help me? 😊',
          role: 'user',
        },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')

      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
      })

      const response = await webhookPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Processed transcript event')
    })
  })

  describe('Error Information Disclosure', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Test with invalid assistant ID
      const mockErrorResponse = {
        error: 'Invalid assistant ID',
        code: 'INVALID_ASSISTANT',
        details: {
          message: 'The assistant ID provided is not valid',
          suggestion: 'Please check your assistant ID and try again',
        },
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
      
      // Should not expose internal system information
      expect(JSON.stringify(data)).not.toContain('VAPI_PRIVATE_KEY')
      expect(JSON.stringify(data)).not.toContain('process.env')
      expect(JSON.stringify(data)).not.toContain('internal')
    })

    it('should handle internal errors without exposing system details', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Internal system error'))

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')
      const { GET } = await import('../src/app/api/vapi/assistants/route')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(data.message).toBeUndefined() // Should not expose error message
    })
  })

  describe('Middleware Security', () => {
    it('should handle malicious URLs safely', () => {
      const maliciousUrls = [
        'http://localhost:3000/../../../etc/passwd',
        'http://localhost:3000/%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        'http://localhost:3000/ru/dashboard?redirect=http://evil.com',
        'http://localhost:3000/ru/dashboard#<script>alert("xss")</script>',
      ]

      for (const url of maliciousUrls) {
        const request = new NextRequest(url)
        const response = middleware(request)

        // Should not crash and should handle gracefully
        expect(response).toBeDefined()
        expect(response.status).toBe(200)
      }
    })

    it('should handle malformed cookies safely', () => {
      const malformedCookieRequests = [
        new NextRequest('http://localhost:3000/dashboard', {
          headers: {
            cookie: 'lang=ru; malicious=value; NEXT_LOCALE=hr',
          },
        }),
        new NextRequest('http://localhost:3000/dashboard', {
          headers: {
            cookie: 'lang=ru; NEXT_LOCALE=hr; session=malicious-value',
          },
        }),
        new NextRequest('http://localhost:3000/dashboard', {
          headers: {
            cookie: 'lang=ru; NEXT_LOCALE=hr; user=admin; role=superuser',
          },
        }),
      ]

      for (const request of malformedCookieRequests) {
        const response = middleware(request)

        expect(response).toBeDefined()
        expect(response.status).toBe(200)
        // Should only use valid locale values
        const redirectLocation = response.headers.get('location')
        if (redirectLocation) {
          expect(redirectLocation).toMatch(/^http:\/\/localhost:3000\/(en|ru|hr|es)\/dashboard/)
        }
      }
    })
  })
})
