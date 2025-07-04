import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FAQ from '../FAQ'

describe('FAQ component', () => {
  it('renders heading and first question open by default', () => {
    render(<FAQ />)
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument()

    // first question answer visible
    const firstAnswer = screen.getByText(/Manetho uses advanced AI/i)
    expect(firstAnswer).toBeVisible()
  })

  it('toggles answer visibility when question clicked', () => {
    render(<FAQ />)
    const secondQuestion = screen.getByText(/Can I use Manetho on different devices/i)
    fireEvent.click(secondQuestion)

    const secondAnswer = screen.getByText(/Yes! Manetho is fully responsive/i)
    expect(secondAnswer).toBeVisible()
  })
}) 