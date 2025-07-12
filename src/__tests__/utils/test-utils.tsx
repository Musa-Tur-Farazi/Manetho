import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock data factories
export const createMockUser = (overrides?: Partial<any>) => ({
  id: 'test-user-id',
  clerk_id: 'clerk_test_123',
  full_name: 'Test User',
  email: 'test@example.com',
  role: 'student',
  avatar_url: 'https://example.com/avatar.jpg',
  joined_at: new Date().toISOString(),
  is_locked: false,
  last_active_at: new Date().toISOString(),
  ...overrides,
})

export const createMockThread = (overrides?: Partial<any>) => ({
  thread_id: 'test-thread-id',
  title: 'Test Thread',
  body: 'This is a test thread body',
  created_by: 'test-user-id',
  subject_id: 'test-subject-id',
  is_pinned: false,
  is_locked: false,
  view_count: 0,
  like_count: 0,
  comment_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockMessage = (overrides?: Partial<any>) => ({
  message_id: 'test-message-id',
  session_id: 'test-session-id',
  role: 'user',
  content: 'Test message content',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockSession = (overrides?: Partial<any>) => ({
  session_id: 'test-session-id',
  user_id: 'test-user-id',
  title: 'Test Session',
  subject_id: null,
  topic_id: null,
  message_count: 0,
  last_message_at: new Date().toISOString(),
  is_archived: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockDirectMessage = (overrides?: Partial<any>) => ({
  messageId: 'test-dm-id',
  senderId: 'test-sender-id',
  recipientId: 'test-recipient-id',
  content: 'Test direct message',
  timestamp: new Date().toISOString(),
  isRead: false,
  senderName: 'Test Sender',
  senderAvatar: 'https://example.com/avatar.jpg',
  ...overrides,
})

// Test wrapper component - simplified without external providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

// Custom render function
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Test utilities for async operations
export const waitForAsyncOperations = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const waitForDebounce = (delay = 300) => 
  new Promise(resolve => setTimeout(resolve, delay))

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message }),
  text: () => Promise.resolve(JSON.stringify({ error: message })),
})

// Database test utilities
export const createTestDatabase = async () => {
  // Mock database setup for testing
  return {
    users: new Map(),
    threads: new Map(),
    messages: new Map(),
    sessions: new Map(),
    directMessages: new Map(),
  }
}

export const cleanupTestDatabase = async (db: any) => {
  if (db) {
    db.users.clear()
    db.threads.clear()
    db.messages.clear()
    db.sessions.clear()
    db.directMessages.clear()
  }
}

// File upload test utilities
export const createMockFile = (
  name = 'test.txt',
  content = 'test content',
  type = 'text/plain'
) => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

export const createMockImage = (
  name = 'test.jpg',
  width = 100,
  height = 100
) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.toBlob = jest.fn((callback) => {
    callback(new Blob(['fake-image-data'], { type: 'image/jpeg' }))
  })
  
  return new File([new Blob(['fake-image-data'], { type: 'image/jpeg' })], name, {
    type: 'image/jpeg'
  })
}

// Component testing utilities
export const getButtonByText = (container: HTMLElement, text: string) => 
  container.querySelector(`button:contains(${text})`) as HTMLButtonElement

export const getInputByLabel = (container: HTMLElement, label: string) => 
  container.querySelector(`input[aria-label="${label}"], input[placeholder="${label}"]`) as HTMLInputElement

export const getTextareaByLabel = (container: HTMLElement, label: string) => 
  container.querySelector(`textarea[aria-label="${label}"], textarea[placeholder="${label}"]`) as HTMLTextAreaElement

// User interaction helpers
export const simulateTyping = async (element: HTMLElement, text: string, delay = 10) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup({ delay })
  await user.clear(element)
  await user.type(element, text)
}

export const simulateFileUpload = async (input: HTMLInputElement, file: File) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  await user.upload(input, file)
}

// Network request mocking
export const mockFetch = (responses: Array<{ url: string; response: any; status?: number }>) => {
  global.fetch = jest.fn((url: string) => {
    const mockResponse = responses.find(r => url.includes(r.url))
    if (mockResponse) {
      return Promise.resolve(mockApiResponse(mockResponse.response, mockResponse.status))
    }
    return Promise.reject(new Error(`No mock response for ${url}`))
  }) as jest.Mock
}

export const resetFetchMocks = () => {
  if (jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear()
  }
}

// Time testing utilities
export const mockDateNow = (timestamp: number) => {
  const spy = jest.spyOn(Date, 'now')
  spy.mockReturnValue(timestamp)
  return spy
}

export const restoreDateNow = (spy: jest.SpyInstance) => {
  spy.mockRestore()
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render } 