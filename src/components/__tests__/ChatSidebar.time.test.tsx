import React from 'react'
import { render, screen } from '@/__tests__/utils/test-utils'
import ChatSidebar from '../ChatSidebar'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock Clerk user hook
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'test-user' } }),
}))

// Helper to build a mock fetch response
const jsonResponse = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) })

beforeEach(() => {
  jest.clearAllMocks()

  // Fresh timestamp so formatTime returns "now"
  const nowIso = new Date().toISOString()

  global.fetch = jest.fn((url: RequestInfo | URL) => {
    const urlStr = url.toString()

    if (urlStr.includes('recent-chats')) {
      return jsonResponse({
        users: [
          {
            userId: 'u2',
            fullName: 'Bob Builder',
            avatarUrl: '',
            lastMessageTime: nowIso,
            lastMessage: 'Hi',
            isRead: true,
          },
        ],
      }) as unknown as Promise<Response>
    }

    if (urlStr.includes('following')) {
      return jsonResponse({ users: [] }) as unknown as Promise<Response>
    }

    return jsonResponse({}) as unknown as Promise<Response>
  }) as jest.Mock
})

describe('ChatSidebar – formatTime helper', () => {
  it('renders "now" for messages from the last minute', async () => {
    render(<ChatSidebar />)

    // Wait until the "now" label appears (formatTime branch for <1 minute)
    const time = await screen.findByText('now', {}, { timeout: 2000 })
    expect(time).toBeInTheDocument()
  })
}) 