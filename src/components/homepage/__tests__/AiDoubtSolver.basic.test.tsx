import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import AiDoubtSolver from '../AiDoubtSolver'

// Mock fetch used inside handleSubmit
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ reply: 'Test answer' }) })
  ) as jest.Mock
})

describe('AiDoubtSolver basic interactions', () => {
  it('clears input when XCircle clicked', () => {
    render(<AiDoubtSolver expanded />)

    const input = screen.getByPlaceholderText(/ask any question/i)
    fireEvent.change(input, { target: { value: 'What is calculus?' } })
    expect((input as HTMLInputElement).value).toBe('What is calculus?')

    const clearBtn = screen.getAllByRole('button')[0]
    fireEvent.click(clearBtn)
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('appends assistant reply after submit', async () => {
    render(<AiDoubtSolver expanded />)

    const input = screen.getByPlaceholderText(/ask any question/i)
    fireEvent.change(input, { target: { value: 'Define osmosis.' } })

    const sendBtn = screen.getAllByRole('button').pop()!
    fireEvent.click(sendBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      expect(screen.getByText('Test answer')).toBeInTheDocument()
    })
  })
}) 