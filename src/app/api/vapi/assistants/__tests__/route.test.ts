import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock fetch
global.fetch = jest.fn()

describe('/api/vapi/assistants', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.VAPI_PRIVATE_KEY = 'test-private-key'
  })

  describe('GET', () => {
    it('should return error when VAPI_PRIVATE_KEY is not configured', async () => {
      delete process.env.VAPI_PRIVATE_KEY

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('VAPI_PRIVATE_KEY is not configured')
    })

    it('should fetch assistants successfully', async () => {
      const mockAssistants = [
        {
          id: 'assistant-1',
          name: 'Restaurant Assistant',
          voice: { provider: 'vapi', voiceId: 'Elliot' },
          model: { provider: 'openai', model: 'gpt-4o' },
        },
        {
          id: 'assistant-2',
          name: 'Customer Service Assistant',
          voice: { provider: 'vapi', voiceId: 'Sarah' },
          model: { provider: 'openai', model: 'gpt-4o' },
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAssistants,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.assistants).toEqual(mockAssistants)

      expect(global.fetch).toHaveBeenCalledWith('https://api.vapi.ai/assistant', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-private-key',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should handle Vapi API errors', async () => {
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

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Failed to fetch assistants')
      expect(data.details).toEqual(mockErrorResponse)
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST', () => {
    it('should create assistant successfully', async () => {
      const assistantData = {
        name: 'New Restaurant Assistant',
        voice: { provider: 'vapi', voiceId: 'Elliot' },
        model: { provider: 'openai', model: 'gpt-4o' },
        firstMessage: 'Hello! How can I help you today?',
      }

      const mockCreatedAssistant = {
        id: 'assistant-new',
        ...assistantData,
        createdAt: '2024-01-15T10:00:00Z',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedAssistant,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants', {
        method: 'POST',
        body: JSON.stringify(assistantData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.assistant).toEqual(mockCreatedAssistant)

      expect(global.fetch).toHaveBeenCalledWith('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-private-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assistantData),
      })
    })

    it('should handle Vapi API errors for POST', async () => {
      const assistantData = {
        name: 'Invalid Assistant',
      }

      const mockErrorResponse = {
        error: 'Invalid assistant configuration',
        code: 'INVALID_CONFIG',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants', {
        method: 'POST',
        body: JSON.stringify(assistantData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to create assistant')
      expect(data.details).toEqual(mockErrorResponse)
    })

    it('should handle malformed JSON in POST', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/assistants', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle network errors for POST', async () => {
      const assistantData = {
        name: 'Test Assistant',
      }

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/vapi/assistants', {
        method: 'POST',
        body: JSON.stringify(assistantData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })
})
