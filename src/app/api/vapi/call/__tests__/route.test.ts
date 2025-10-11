import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

// Mock fetch
global.fetch = jest.fn()

describe('/api/vapi/call', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.VAPI_PRIVATE_KEY = 'test-private-key'
  })

  describe('POST', () => {
    it('should return error when VAPI_PRIVATE_KEY is not configured', async () => {
      delete process.env.VAPI_PRIVATE_KEY

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('VAPI_PRIVATE_KEY is not configured')
    })

    it('should return error when assistantId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Assistant ID is required')
    })

    it('should create inbound call successfully', async () => {
      const mockVapiResponse = {
        id: 'call-123',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVapiResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.callId).toBe('call-123')
      expect(data.status).toBe('queued')
      expect(data.message).toBe('Call initiated successfully')

      expect(global.fetch).toHaveBeenCalledWith('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-private-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
          type: 'inboundPhoneCall',
        }),
      })
    })

    it('should create outbound call when phoneNumberId is provided', async () => {
      const mockVapiResponse = {
        id: 'call-456',
        status: 'queued',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVapiResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
          phoneNumberId: 'phone-123',
          phoneNumber: '+1234567890',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      expect(global.fetch).toHaveBeenCalledWith('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-private-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
          type: 'outboundPhoneCall',
          phoneNumberId: 'phone-123',
          customer: {
            number: '+1234567890',
          },
        }),
      })
    })

    it('should handle Vapi API errors', async () => {
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

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to create call')
      expect(data.details).toEqual(mockErrorResponse)
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/vapi/call', {
        method: 'POST',
        body: JSON.stringify({
          assistantId: 'test-assistant-id',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET', () => {
    it('should return error when callId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/call')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Call ID is required')
    })

    it('should get call info successfully', async () => {
      const mockCallData = {
        id: 'call-123',
        status: 'completed',
        duration: 120,
        transcript: 'Test conversation',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCallData,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/call?callId=call-123')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.call).toEqual(mockCallData)

      expect(global.fetch).toHaveBeenCalledWith('https://api.vapi.ai/call/call-123', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-private-key',
          'Content-Type': 'application/json',
        },
      })
    })

    it('should handle Vapi API errors for GET', async () => {
      const mockErrorResponse = {
        error: 'Call not found',
        code: 'CALL_NOT_FOUND',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/vapi/call?callId=invalid-call-id')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Failed to get call info')
      expect(data.details).toEqual(mockErrorResponse)
    })
  })
})
