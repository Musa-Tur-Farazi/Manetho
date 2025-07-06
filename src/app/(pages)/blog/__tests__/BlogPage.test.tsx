import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { customRender } from '../../../../__tests__/utils/test-utils'
import BlogPage from '../page'

/**
 * NOTE: This test suite focuses on the client-side behaviour of the BlogPage.
 * We verify that:
 * 1. The header renders correctly.
 * 2. Category buttons filter the visible posts.
 * 3. The search input further filters posts based on the query.
 */

describe('BlogPage', () => {
  beforeEach(() => {
    // Render a fresh instance before each test
    customRender(<BlogPage />)
    // Ensure Navigator.clipboard stub exists only once
  })

  it('renders the page header', () => {
    expect(screen.getByRole('heading', { name: /manetho blog/i })).toBeInTheDocument()
  })

  it('shows all posts by default', () => {
    // There are 6 hard-coded posts in the component
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(6)
  })

  it('filters posts by selected category', async () => {

    // Click on the "Study Tips" category button
    fireEvent.click(screen.getByRole('button', { name: 'Study Tips' }))

    // Only the study tips post should be visible
    const visibleArticles = screen.getAllByRole('article')
    expect(visibleArticles).toHaveLength(1)
    expect(screen.getByText(/10 effective study techniques/i)).toBeInTheDocument()

    // A post from another category should NOT be in the document
    expect(screen.queryByText(/how ai is transforming education/i)).not.toBeInTheDocument()
  })

  it('filters posts using the search input', () => {
    const searchInput = screen.getByPlaceholderText(/search articles/i) as HTMLInputElement

    // Type a search query that should match a single post
    fireEvent.change(searchInput, { target: { value: 'Physics' } })

    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(1)
    expect(screen.getByText(/understanding complex physics concepts/i)).toBeInTheDocument()
  })

  it('shows the empty state when no posts match the filters', () => {
    const searchInput = screen.getByPlaceholderText(/search articles/i) as HTMLInputElement

    // Enter a query that does not match any post
    fireEvent.change(searchInput, { target: { value: 'Non-existent Post' } })

    // The empty state heading should appear
    expect(screen.getByRole('heading', { name: /no articles found/i })).toBeInTheDocument()
  })
}) 