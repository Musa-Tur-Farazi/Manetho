import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import ChatSidebar from '../ChatSidebar'

// Mock fetch: recentChats(few), following(few), searchUsers (matches), then none when cleared
const mockUsers = [{ userId: 'u1', fullName: 'Bob', avatarUrl: '' }]

beforeEach(() => {
  global.fetch = jest.fn()
    // fetchRecentChats
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
    // fetchFollowingUsers
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) })
    // searchUsers for "Bob"
    .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: mockUsers }) })
})

describe('ChatSidebar – search clear branch', () => {
  it('clears search results when input cleared', async () => {
    render(<ChatSidebar />)

    const input = screen.getByPlaceholderText(/search learning partners/i)
    fireEvent.change(input, { target: { value: 'Bob' } })

    await waitFor(() => {
      expect(screen.getByText('Search Results')).toBeInTheDocument()
    })

    // clear input
    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument()
    })
  })
}) 