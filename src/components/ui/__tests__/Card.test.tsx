import React from 'react'
import { render, screen } from '@/__tests__/utils/test-utils'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from '../card'

describe('Card Component', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card>Card Content</Card>)
      const card = screen.getByText('Card Content')
      expect(card).toBeInTheDocument()
      expect(card.closest('div')).toHaveClass('rounded-lg', 'border', 'bg-card')
    })

    it('renders with custom className', () => {
      render(<Card className="custom-class">Custom Card</Card>)
      const card = screen.getByText('Custom Card').closest('div')
      expect(card).toHaveClass('custom-class')
    })

    it('renders with children', () => {
      render(
        <Card>
          <div>Header</div>
          <div>Content</div>
          <div>Footer</div>
        </Card>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('renders with default props', () => {
      render(<CardHeader>Header Content</CardHeader>)
      const header = screen.getByText('Header Content')
      expect(header).toBeInTheDocument()
      expect(header.closest('div')).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('renders with custom className', () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>)
      const header = screen.getByText('Custom Header').closest('div')
      expect(header).toHaveClass('custom-header')
    })

    it('renders with CardTitle and CardDescription', () => {
      render(
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
    })
  })

  describe('CardContent', () => {
    it('renders with default props', () => {
      render(<CardContent>Content</CardContent>)
      const content = screen.getByText('Content')
      expect(content).toBeInTheDocument()
      expect(content.closest('div')).toHaveClass('p-6', 'pt-0')
    })

    it('renders with custom className', () => {
      render(<CardContent className="custom-content">Custom Content</CardContent>)
      const content = screen.getByText('Custom Content').closest('div')
      expect(content).toHaveClass('custom-content')
    })

    it('renders with complex content', () => {
      render(
        <CardContent>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <button>Button</button>
        </CardContent>
      )
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders with default props', () => {
      render(<CardFooter>Footer</CardFooter>)
      const footer = screen.getByText('Footer')
      expect(footer).toBeInTheDocument()
      expect(footer.closest('div')).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('renders with custom className', () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>)
      const footer = screen.getByText('Custom Footer').closest('div')
      expect(footer).toHaveClass('custom-footer')
    })

    it('renders with buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      )
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('renders with default props', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('renders with custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>)
      const title = screen.getByText('Custom Title')
      expect(title).toHaveClass('custom-title')
    })

    it('renders as h3 by default', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
    })
  })

  describe('CardDescription', () => {
    it('renders with default props', () => {
      render(<CardDescription>Description</CardDescription>)
      const description = screen.getByText('Description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('renders with custom className', () => {
      render(<CardDescription className="custom-desc">Custom Description</CardDescription>)
      const description = screen.getByText('Custom Description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action 1</button>
            <button>Action 2</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument()
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument()
      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })

    it('renders card with only header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Simple content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Simple Card')).toBeInTheDocument()
      expect(screen.getByText('Simple content')).toBeInTheDocument()
    })

    it('renders card with only content', () => {
      render(
        <Card>
          <CardContent>
            <p>Content only</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Content only')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveTextContent('Accessible Card')
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Card aria-label="Card container">
          <CardHeader>
            <CardTitle aria-describedby="card-desc">Title</CardTitle>
            <CardDescription id="card-desc">Description</CardDescription>
          </CardHeader>
        </Card>
      )

      const card = screen.getByLabelText('Card container')
      const title = screen.getByText('Title')
      expect(card).toBeInTheDocument()
      expect(title).toHaveAttribute('aria-describedby', 'card-desc')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(<Card></Card>)
      const cards = screen.getAllByText('')
      const card = cards.find(el => el.closest('div')?.classList.contains('rounded-lg'))
      expect(card).toBeInTheDocument()
    })

    it('handles undefined children gracefully', () => {
      render(<Card>{undefined}</Card>)
      const cards = screen.getAllByText('')
      const card = cards.find(el => el.closest('div')?.classList.contains('rounded-lg'))
      expect(card).toBeInTheDocument()
    })

    it('combines multiple className props correctly', () => {
      render(
        <Card className="border-red-500">
          <CardHeader className="bg-blue-100">
            <CardTitle className="text-red-600">Styled Card</CardTitle>
          </CardHeader>
        </Card>
      )

      const card = screen.getByText('Styled Card').closest('.border-red-500')
      const header = screen.getByText('Styled Card').closest('.bg-blue-100')
      const title = screen.getByText('Styled Card')

      expect(card).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(title).toHaveClass('text-red-600')
    })
  })
}) 