import React from 'react'
import { render, screen } from '@/__tests__/utils/test-utils'
import { Badge } from '../badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>)
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full')
    })

    it('renders with custom className', () => {
      render(<Badge className="custom-class">Custom Badge</Badge>)
      const badge = screen.getByText('Custom Badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('renders with different variants', () => {
      const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

      rerender(<Badge variant="destructive">Destructive</Badge>)
      expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

      rerender(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toHaveClass('text-foreground')
    })
  })

  describe('Content', () => {
    it('renders text content', () => {
      render(<Badge>Simple Text</Badge>)
      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders with numbers', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with complex content', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('handles empty content gracefully', () => {
      render(<Badge></Badge>)
      const badges = screen.getAllByRole('generic')
      const badge = badges.find(el => el.classList.contains('inline-flex'))
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Badge aria-label="Status badge" aria-describedby="status-desc">
          Active
        </Badge>
      )
      const badge = screen.getByText('Active')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
      expect(badge).toHaveAttribute('aria-describedby', 'status-desc')
    })

    it('supports custom role', () => {
      render(<Badge role="status">Status</Badge>)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Variants Edge Cases', () => {
    it('combines multiple classes correctly', () => {
      render(
        <Badge variant="outline" className="custom-class">
          Complex Badge
        </Badge>
      )
      const badge = screen.getByText('Complex Badge')
      expect(badge).toHaveClass('text-foreground', 'custom-class')
    })

    it('handles undefined children gracefully', () => {
      render(<Badge>{undefined}</Badge>)
      const badges = screen.getAllByRole('generic')
      const badge = badges.find(el => el.classList.contains('inline-flex'))
      expect(badge).toBeInTheDocument()
    })

    it('handles null children gracefully', () => {
      render(<Badge>{null}</Badge>)
      const badges = screen.getAllByRole('generic')
      const badge = badges.find(el => el.classList.contains('inline-flex'))
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Interactive Elements', () => {
    it('renders as clickable element', () => {
      const handleClick = jest.fn()
      render(
        <Badge onClick={handleClick} role="button">
          Clickable Badge
        </Badge>
      )
      const badge = screen.getByRole('button')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Clickable Badge')
    })

    it('supports keyboard interaction', () => {
      render(
        <Badge tabIndex={0} role="button">
          Keyboard Badge
        </Badge>
      )
      const badge = screen.getByRole('button')
      badge.focus()
      expect(badge).toHaveFocus()
    })
  })

  describe('Styling', () => {
    it('applies default styling', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full')
    })

    it('applies variant-specific styling', () => {
      const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary', 'text-secondary-foreground')

      rerender(<Badge variant="destructive">Destructive</Badge>)
      expect(screen.getByText('Destructive')).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('applies focus styles', () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>)
      const badge = screen.getByText('Focusable Badge')
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring')
    })
  })
}) 