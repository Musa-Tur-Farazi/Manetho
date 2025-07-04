import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import GetStartedButton from '../GetStartedButton'
import { customRender } from '../../../__tests__/utils/test-utils'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('GetStartedButton', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders with dashboard text when signed in', () => {
    customRender(<GetStartedButton />)
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    customRender(<GetStartedButton className="custom-button" />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toHaveClass('custom-button')
  })

  it('navigates to /home when clicked', () => {
    customRender(<GetStartedButton />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    fireEvent.click(link)
    expect(mockPush).not.toHaveBeenCalled() // href navigation, not push
  })

  it('handles multiple clicks', () => {
    customRender(<GetStartedButton />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    fireEvent.click(link)
    fireEvent.click(link)
    fireEvent.click(link)
    expect(mockPush).not.toHaveBeenCalled() // href navigation, not push
  })

  it('renders with custom className and navigates correctly', () => {
    customRender(<GetStartedButton className="test-class" />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toHaveClass('test-class')
    fireEvent.click(link)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles empty className', () => {
    customRender(<GetStartedButton className="" />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toBeInTheDocument()
    fireEvent.click(link)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles very long className', () => {
    const longClassName = 'a'.repeat(100)
    customRender(<GetStartedButton className={longClassName} />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toHaveClass(longClassName)
  })

  it('maintains link accessibility', () => {
    customRender(<GetStartedButton />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toHaveAttribute('href', '/home')
    expect(link).toBeVisible()
  })

  it('works with keyboard navigation', () => {
    customRender(<GetStartedButton />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    link.focus()
    expect(link).toHaveFocus()
    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(link, { key: ' ', code: 'Space' })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles special characters in className', () => {
    const specialClassName = 'button-with-🚀-emoji & <script>alert("xss")</script>'
    customRender(<GetStartedButton className={specialClassName} />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toHaveClass(specialClassName)
  })
}) 