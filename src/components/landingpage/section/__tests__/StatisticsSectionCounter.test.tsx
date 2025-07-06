import React from 'react'
import { render, screen, act } from '@testing-library/react'
import StatisticsSection from '../StatisticsSection'

// Mock IntersectionObserver so every card is considered visible immediately
class MockIO {
  constructor(private cb: any) {}
  observe() {
    this.cb([{ isIntersecting: true }])
  }
  disconnect() {}
}

beforeAll(() => {
  // @ts-ignore
  global.IntersectionObserver = MockIO
})

describe('StatisticsSection counters', () => {
  it('animates numbers to their final values', () => {
    jest.useFakeTimers()

    render(<StatisticsSection />)

    // advance timers to finish the 2.5 s animation
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Largest counter should show 50,000+
    expect(screen.getByText('50,000')).toBeInTheDocument()
    // Satisfaction rate
    expect(screen.getByText('98')).toBeInTheDocument()

    jest.useRealTimers()
  })
}) 