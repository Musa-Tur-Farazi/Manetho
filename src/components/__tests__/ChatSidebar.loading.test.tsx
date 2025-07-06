import React from 'react'
import { render } from '@/__tests__/utils/test-utils'
import ChatSidebar from '../ChatSidebar'

// Mock initial fetch calls: two endpoints but delay resolution to keep loading true momentarily
beforeEach(() => {
  global.fetch = jest.fn()
    // fetchRecentChats
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
    // fetchFollowingUsers
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
})

describe('ChatSidebar – initial loading spinner', () => {
  it('shows spinner before following users are loaded', () => {
    const { container } = render(<ChatSidebar />)

    // look for div with animate-spin class (tailwind spinner)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
}) 