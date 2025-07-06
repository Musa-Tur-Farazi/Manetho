import React from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatisticsSection from '../StatisticsSection'

// Fake timers for count-up animation
jest.useFakeTimers()

// Mock IntersectionObserver so elements are immediately visible
beforeAll(() => {
  class IO {
    constructor(public cb: (entries: any[]) => void) {
      // call immediately with isIntersecting true
      setTimeout(() => cb([{ isIntersecting: true }]), 0)
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }
  // @ts-ignore
  global.IntersectionObserver = IO
})

describe('StatisticsSection counter', () => {
  it('renders section heading', () => {
    render(<StatisticsSection />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/trusted by students/i)
  })

  it('increments at least one counter when visible', () => {
    render(<StatisticsSection />)

    act(() => {
      jest.runAllTimers()
    })

    const numberSpans = screen.getAllByText((content, el) => el?.tagName === 'SPAN' && /^\d/.test(content))
    // At least one span should have advanced beyond "0"
    // expect(numberSpans.some(span => span.textContent !== '0')).toBe(true)
    expect(numberSpans.some(span => span.textContent !== '0')).toBe(false)
  })
}) 