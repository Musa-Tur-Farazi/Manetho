import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { customRender } from '@/__tests__/utils/test-utils'
import AiDoubtSolver from '@/components/homepage/AiDoubtSolver'

// Mock fetch
global.fetch = jest.fn()

describe('AiDoubtSolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default state', () => {
    customRender(<AiDoubtSolver />)
    
    expect(screen.getByText('AI Study Assistant')).toBeInTheDocument()
    expect(screen.getByText('Ask any study doubt...')).toBeInTheDocument()
  })

  it('should render expanded version when expanded prop is true', () => {
    customRender(<AiDoubtSolver expanded={true} />)
    
    expect(screen.getByText('AI Study Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask any question about your studies...')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        reply: 'Here is the answer to your question.'
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/doubt-solving', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining('What is calculus?')
      }))
    })
  })

  it('should handle API error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument()
    })
  })

  it('should handle empty input', () => {
    customRender(<AiDoubtSolver expanded={true} />)

    const submitButton = screen.getByRole('button', { type: 'submit' })
    fireEvent.click(submitButton)

    // Should not submit when input is empty
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle keyboard submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        reply: 'Here is the answer to your question.'
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    
    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: jest.fn().mockResolvedValue({
          reply: 'Here is the answer to your question.'
        })
      }), 100))
    )

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { type: 'submit' }).querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  it('should display response when received', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        reply: 'Calculus is a branch of mathematics that deals with continuous change.'
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Calculus is a branch of mathematics that deals with continuous change.')).toBeInTheDocument()
    })
  })

  it('should clear input after successful submission', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        reply: 'Here is the answer to your question.'
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument()
    })
  })

  it('should handle malformed API response', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        // Missing reply field
        error: 'Invalid response'
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    customRender(<AiDoubtSolver expanded={true} />)

    const input = screen.getByPlaceholderText('Ask any question about your studies...')
    const submitButton = screen.getByRole('button', { type: 'submit' })

    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I couldn't generate a response./)).toBeInTheDocument()
    })
  })
}) 