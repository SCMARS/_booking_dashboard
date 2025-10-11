import React from 'react'
import { render, screen } from '@testing-library/react'
import SimpleVapiWidget from '../SimpleVapiWidget'

// Mock useEffect to test script loading
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}))

describe('SimpleVapiWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock document methods
    const mockScript = {
      src: '',
      async: false,
      type: '',
    }
    
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockContains = jest.fn().mockReturnValue(true)
    
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
        contains: mockContains,
      },
      writable: true,
    })
    
    Object.defineProperty(document, 'createElement', {
      value: jest.fn().mockReturnValue(mockScript),
      writable: true,
    })
  })

  it('should render vapi-widget with correct attributes', () => {
    render(<SimpleVapiWidget />)
    
    const widget = screen.getByRole('generic') // vapi-widget is a custom element
    expect(widget).toBeInTheDocument()
    expect(widget).toHaveAttribute('public-key', 'ea7c4170-a2cd-4b71-a37c-bf829fc2d0e6')
    expect(widget).toHaveAttribute('assistant-id', 'c459fd1f-dcc7-4716-8dc8-e8c79ce5e319')
    expect(widget).toHaveAttribute('mode', 'voice')
    expect(widget).toHaveAttribute('theme', 'dark')
    expect(widget).toHaveAttribute('base-bg-color', '#000000')
    expect(widget).toHaveAttribute('accent-color', '#14B8A6')
    expect(widget).toHaveAttribute('cta-button-color', '#000000')
    expect(widget).toHaveAttribute('cta-button-text-color', '#ffffff')
    expect(widget).toHaveAttribute('border-radius', 'large')
    expect(widget).toHaveAttribute('size', 'full')
    expect(widget).toHaveAttribute('position', 'bottom-right')
    expect(widget).toHaveAttribute('title', 'CALL WITH AI')
    expect(widget).toHaveAttribute('start-button-text', 'Start Call')
    expect(widget).toHaveAttribute('end-button-text', 'End Call')
    expect(widget).toHaveAttribute('voice-show-transcript', 'true')
    expect(widget).toHaveAttribute('consent-required', 'true')
    expect(widget).toHaveAttribute('consent-title', 'Terms and conditions')
    expect(widget).toHaveAttribute('consent-content', 'By clicking Agree, and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.')
    expect(widget).toHaveAttribute('consent-storage-key', 'vapi_widget_consent')
  })

  it('should load Vapi script on mount', () => {
    const mockUseEffect = React.useEffect as jest.Mock
    const mockScript = {
      src: '',
      async: false,
      type: '',
    }
    
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockContains = jest.fn().mockReturnValue(true)
    
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
        contains: mockContains,
      },
      writable: true,
    })
    
    Object.defineProperty(document, 'createElement', {
      value: jest.fn().mockReturnValue(mockScript),
      writable: true,
    })

    render(<SimpleVapiWidget />)

    // Verify useEffect was called
    expect(mockUseEffect).toHaveBeenCalled()
    
    // Get the effect function
    const effectFunction = mockUseEffect.mock.calls[0][0]
    
    // Call the effect function
    effectFunction()
    
    // Verify script was created and appended
    expect(document.createElement).toHaveBeenCalledWith('script')
    expect(mockScript.src).toBe('https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js')
    expect(mockScript.async).toBe(true)
    expect(mockScript.type).toBe('text/javascript')
    expect(mockAppendChild).toHaveBeenCalledWith(mockScript)
  })

  it('should cleanup script on unmount', () => {
    const mockUseEffect = React.useEffect as jest.Mock
    const mockScript = {
      src: '',
      async: false,
      type: '',
    }
    
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockContains = jest.fn().mockReturnValue(true)
    
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
        contains: mockContains,
      },
      writable: true,
    })
    
    Object.defineProperty(document, 'createElement', {
      value: jest.fn().mockReturnValue(mockScript),
      writable: true,
    })

    render(<SimpleVapiWidget />)

    // Get the effect function
    const effectFunction = mockUseEffect.mock.calls[0][0]
    
    // Call the effect function to get cleanup function
    const cleanupFunction = effectFunction()
    
    // Call cleanup function
    cleanupFunction()
    
    // Verify script was removed
    expect(mockContains).toHaveBeenCalledWith(mockScript)
    expect(mockRemoveChild).toHaveBeenCalledWith(mockScript)
  })

  it('should not remove script if not in document head', () => {
    const mockUseEffect = React.useEffect as jest.Mock
    const mockScript = {
      src: '',
      async: false,
      type: '',
    }
    
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockContains = jest.fn().mockReturnValue(false) // Script not in head
    
    Object.defineProperty(document, 'head', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
        contains: mockContains,
      },
      writable: true,
    })
    
    Object.defineProperty(document, 'createElement', {
      value: jest.fn().mockReturnValue(mockScript),
      writable: true,
    })

    render(<SimpleVapiWidget />)

    // Get the effect function
    const effectFunction = mockUseEffect.mock.calls[0][0]
    
    // Call the effect function to get cleanup function
    const cleanupFunction = effectFunction()
    
    // Call cleanup function
    cleanupFunction()
    
    // Verify script was not removed
    expect(mockContains).toHaveBeenCalledWith(mockScript)
    expect(mockRemoveChild).not.toHaveBeenCalled()
  })
})
