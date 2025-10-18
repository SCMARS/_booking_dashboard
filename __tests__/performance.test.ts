import { NextRequest } from 'next/server'
import { middleware } from '../middleware'

// Mock fetch globally
global.fetch = jest.fn()

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Middleware Performance', () => {
    it('should handle middleware processing quickly', () => {
      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/ru/dashboard')
      const response = middleware(request)
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(10) // Should process in less than 10ms
      expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/dashboard')
    })

    it('should handle multiple middleware calls efficiently', () => {
      const requests = [
        new NextRequest('http://localhost:3000/en/dashboard'),
        new NextRequest('http://localhost:3000/ru/settings'),
        new NextRequest('http://localhost:3000/hr/bookings'),
        new NextRequest('http://localhost:3000/es/logs'),
        
      ]

      const startTime = performance.now()
      
      const responses = requests.map(request => middleware(request))
      
      const endTime = performance.now()
      const totalProcessingTime = endTime - startTime
      const averageProcessingTime = totalProcessingTime / requests.length
      
      expect(averageProcessingTime).toBeLessThan(5) // Average should be less than 5ms
      expect(responses).toHaveLength(4)
      
      responses.forEach(response => {
        expect(response.headers.get('x-middleware-rewrite')).toBeDefined()
      })
    })
  })

  describe('API Performance', () => {
    it('should handle webhook processing efficiently', async () => {
      const webhookEvent = {
        type: 'call-started',
        call: { id: 'call-123', status: 'in-progress' },
      }

      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
      })

      const { POST } = await import('../src/app/api/vapi/webhook/route')
      const response = await POST(request)
      const data = await response.json()
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(50) // Should process in less than 50ms
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle call creation efficiently', async () => {
      const mockCallResponse = {
        id: 'call-123',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallResponse,
      })

      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319',
        }),
      })

      const { POST } = await import('../src/app/api/vapi/call/route')
      const response = await POST(request)
      const data = await response.json()
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(100) // Should process in less than 100ms
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle assistants API efficiently', async () => {
      const mockAssistants = [
        { id: 'assistant-1', name: 'Test Assistant' },
        { id: 'assistant-2', name: 'Another Assistant' },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssistants,
      })

      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')
      const { GET } = await import('../src/app/api/vapi/assistants/route')
      const response = await GET(request)
      const data = await response.json()
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(100) // Should process in less than 100ms
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Concurrent Processing', () => {
    it('should handle concurrent webhook events efficiently', async () => {
      const webhookEvents = Array.from({ length: 10 }, (_, i) => ({
        type: 'call-started',
        call: { id: `call-${i}`, status: 'in-progress' },
      }))

      const startTime = performance.now()
      
      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      
      const webhookPromises = webhookEvents.map(event => {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(event),
        })
        return webhookPOST(request)
      })

      const responses = await Promise.all(webhookPromises)
      const responseData = await Promise.all(responses.map(r => r.json()))
      
      const endTime = performance.now()
      const totalProcessingTime = endTime - startTime
      const averageProcessingTime = totalProcessingTime / webhookEvents.length
      
      expect(averageProcessingTime).toBeLessThan(20) // Average should be less than 20ms
      expect(responses).toHaveLength(10)
      responseData.forEach(data => {
        expect(data.success).toBe(true)
      })
    })

    it('should handle concurrent call creations efficiently', async () => {
      const mockCallResponses = Array.from({ length: 5 }, (_, i) => ({
        id: `call-${i}`,
        status: 'queued',
      }))

      ;(global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockCallResponses.shift(),
        })
      )

      const startTime = performance.now()
      
      const { POST } = await import('../src/app/api/vapi/call/route')
      
      const callPromises = Array.from({ length: 5 }, (_, i) => {
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
      
      const endTime = performance.now()
      const totalProcessingTime = endTime - startTime
      const averageProcessingTime = totalProcessingTime / 5
      
      expect(averageProcessingTime).toBeLessThan(50) // Average should be less than 50ms
      expect(responses).toHaveLength(5)
      responseData.forEach(data => {
        expect(data.success).toBe(true)
      })
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory with repeated webhook processing', async () => {
      const webhookEvent = {
        type: 'call-started',
        call: { id: 'call-123', status: 'in-progress' },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      
      // Process 100 webhook events
      for (let i = 0; i < 100; i++) {
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookEvent),
        })
        
        const response = await webhookPOST(request)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      // Memory usage should be reasonable (this is a basic check)
      const memUsage = process.memoryUsage()
      expect(memUsage.heapUsed).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
    })

    it('should handle large webhook payloads efficiently', async () => {
      const largeWebhookEvent = {
        type: 'call-ended',
        call: {
          id: 'call-123',
          status: 'completed',
          transcript: 'A'.repeat(10000), // Large transcript
          metadata: {
            duration: 300,
            quality: 'high',
            features: Array.from({ length: 100 }, (_, i) => `feature-${i}`),
          },
        },
      }

      const startTime = performance.now()
      
      const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
        method: 'POST',
        body: JSON.stringify(largeWebhookEvent),
      })

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      const response = await webhookPOST(request)
      const data = await response.json()
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeLessThan(100) // Should handle large payloads efficiently
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Response Time Consistency', () => {
    it('should maintain consistent response times for webhook processing', async () => {
      const webhookEvent = {
        type: 'call-started',
        call: { id: 'call-123', status: 'in-progress' },
      }

      const { POST: webhookPOST } = await import('../src/app/api/vapi/webhook/route')
      
      const responseTimes: number[] = []
      
      // Process 20 webhook events and measure response times
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now()
        
        const request = new NextRequest('http://localhost:3000/api/vapi/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookEvent),
        })
        
        const response = await webhookPOST(request)
        const data = await response.json()
        
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        responseTimes.push(responseTime)
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      }
      
      // Calculate statistics
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)
      const variance = responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
      const standardDeviation = Math.sqrt(variance)
      
      expect(avgResponseTime).toBeLessThan(30) // Average should be less than 30ms
      expect(maxResponseTime).toBeLessThan(100) // Max should be less than 100ms
      expect(standardDeviation).toBeLessThan(20) // Low variance indicates consistent performance
    })
  })
})
