import React from 'react'
import { render, waitFor, screen } from '@/__tests__/utils/test-utils'
import ChatSidebar from '../ChatSidebar'

beforeEach(() => {
  // First call fetchRecentChats ok empty, second fetchFollowingUsers rejects
  global.fetch = jest.fn()
    // fetchRecentChats
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
    // fetchFollowingUsers rejects -> triggers catch
    .mockRejectedValueOnce(new Error('Network'))
})

describe('ChatSidebar – fetch error branch', () => {
  it('shows empty state after following-users fetch fails', async () => {
    render(<ChatSidebar />)

    await waitFor(() => {
      // spinner removed and empty state rendered
      expect(screen.getByText('No learning partners yet')).toBeInTheDocument()
    })
  })
}) 