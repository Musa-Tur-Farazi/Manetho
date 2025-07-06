import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeatureDetails from '../FeatureDetails'
import { jest } from '@jest/globals'

// Mock framer-motion to avoid animation overhead in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    __esModule: true,
    ...actual,
    motion: {
      // Provide a simple passthrough component for all motion elements used
      div: (props: any) => <div {...props} />,
    },
  }
})

// Mock AuthProtectedLink to render a simple anchor so we can test click behaviour
jest.mock('@/components/landingpage/AuthProtectedLink', () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: any) => (
      <a href={href} {...rest} data-testid="auth-protected-link">
        {children}
      </a>
    ),
  }
})

describe('FeatureDetails', () => {
  it('renders heading and four feature cards', () => {
    render(<FeatureDetails />)

    // Heading
    expect(screen.getByRole('heading', {
      name: /Features Designed for Learning Success/i,
    })).toBeInTheDocument()

    // There should be four feature titles present
    const titles = [
      /AI Doubt Solving/i,
      /Personalized Learning Path/i,
      /Community Learning/i,
      /Progress Tracking/i,
    ]

    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('each feature card contains an Explore Now link that is clickable', () => {
    render(<FeatureDetails />)

    const links = screen.getAllByRole('link', { name: /Explore Now/i })
    expect(links).toHaveLength(4)

    // Simulate clicking the first link and ensure it can be clicked without errors
    fireEvent.click(links[0])
  })
}) 