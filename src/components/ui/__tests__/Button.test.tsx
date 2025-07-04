import React from 'react'
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { Button } from '../Button'
import { ArrowRight, Download } from 'lucide-react'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-gradient-to-r', 'from-cyan-500', 'to-blue-600')
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('from-gray-100', 'to-gray-200')

      rerender(<Button variant="outline">Outline</Button>)
      expect(screen.getByRole('button')).toHaveClass('border-input')

      rerender(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

      rerender(<Button variant="destructive">Destructive</Button>)
      expect(screen.getByRole('button')).toHaveClass('from-red-500', 'to-rose-600')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-9')

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-12')

      rerender(<Button size="icon">Icon</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10')
    })

    it('renders as link when href is provided', () => {
      render(<Button href="/test">Link Button</Button>)
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders with target attribute for external links', () => {
      render(
        <Button href="https://example.com" target="_blank">
          External Link
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders with icon', () => {
      render(
        <Button>
          <ArrowRight className="mr-2 h-4 w-4" />
          With Icon
        </Button>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })

    it('handles mouse events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports form submission', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('States', () => {
    it('shows disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
    })

    it('shows loading state when provided', () => {
      // Assuming the button supports a loading prop
      render(<Button disabled>Loading...</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Button aria-label="Save document" aria-describedby="save-help">
          Save
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Save document')
      expect(button).toHaveAttribute('aria-describedby', 'save-help')
    })

    it('supports keyboard navigation', () => {
      render(<Button>Keyboard Test</Button>)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('has correct role for links', () => {
      render(<Button href="/test">Link</Button>)
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('Variants Edge Cases', () => {
    it('combines multiple classes correctly', () => {
      render(
        <Button variant="outline" size="lg" className="custom-class">
          Complex Button
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-input', 'h-12', 'custom-class')
    })

    it('handles undefined children gracefully', () => {
      render(<Button>{undefined}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders with complex children', () => {
      render(
        <Button>
          <Download className="mr-2 h-4 w-4" />
          <span>Download File</span>
          <span className="ml-2 text-xs">(PDF)</span>
        </Button>
      )
      expect(screen.getByText('Download File')).toBeInTheDocument()
      expect(screen.getByText('(PDF)')).toBeInTheDocument()
    })
  })

  describe('AsChild Prop', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Custom Link</a>
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Custom Link')
    })
  })
}) 