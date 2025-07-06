import { NextRequest } from 'next/server'

// --------------------
// Mocks
// --------------------

// Mock next/server helpers similar to other API tests
jest.mock('next/server', () => ({
  NextRequest: jest.fn((input: string, init?: RequestInit & { body?: string }) => ({
    json: () => Promise.resolve(init?.body ? JSON.parse(init.body as string) : {}),
    headers: new Headers(init?.headers),
    url: input,
    method: init?.method,
    body: init?.body,
    nextUrl: new URL(input),
  })),
  NextResponse: {
    json: jest.fn((body: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
      headers: new Headers(),
    })),
  },
}))

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'clerk_user_123' })),
}))

// Create a simple chainable builder for Drizzle queries
const createChainable = (rows: any[]) => {
  const chainable: any = {
    from: jest.fn(() => chainable),
    where: jest.fn(() => chainable),
    limit: jest.fn(() => Promise.resolve(rows)),
  }
  return chainable
}

// We need to capture what rows the test wants; we’ll override select per test
const mockSelect = jest.fn()

jest.mock('@/db', () => ({
  db: {
    select: (...args: any[]) => mockSelect(...args),
  },
}))

// Mock users table shape
jest.mock('@/db/schema', () => ({
  usersTable: {
    userId: 'userId',
    clerkId: 'clerkId',
    fullName: 'fullName',
    avatarUrl: 'avatarUrl',
  },
}))

// Mock drizzle-orm helpers used
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(() => true),
}))

// --------------------
// Import route handlers AFTER mocks
// --------------------
import { POST, GET } from '@/app/api/call-signal/route'

// Helper to build NextRequest easily
const buildRequest = (url: string, method: string, body?: any) =>
  new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  } as any)

// --------------------
// Tests
// --------------------

describe('/api/call-signal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('POST initiate stores signal and GET retrieves it', async () => {
    // db.select should return caller row for auth user and recipient row for GET
    mockSelect
      // First select in POST (caller info)
      .mockReturnValueOnce(createChainable([{ userId: 'db_user_caller', fullName: 'Caller', avatarUrl: '' }]))
      // First select in GET (current user internal id)
      .mockReturnValueOnce(createChainable([{ userId: 'db_user_recipient' }]))

    const recipientId = 'db_user_recipient'
    // Initiate call
    const postReq = buildRequest('http://localhost/api/call-signal', 'POST', {
      recipientId,
      channelName: 'testChannel',
      isVideoCall: true,
      action: 'initiate',
    })

    const postRes: any = await POST(postReq as any)
    expect(postRes.status).toBe(200)
    const postJson = await postRes.json()
    expect(postJson.success).toBe(true)
    expect(postJson.message).toBe('Call signal sent')

    // GET as recipient to fetch signal
    const getReq = buildRequest('http://localhost/api/call-signal', 'GET')
    const getRes: any = await GET(getReq as any)
    expect(getRes.status).toBe(200)
    const getJson = await getRes.json()
    expect(getJson.hasCall).toBe(true)
    expect(getJson.callSignal.channelName).toBe('testChannel')
  })

  it('POST cancel removes signal', async () => {
    // Set up db responses: caller info, recipient row same
    mockSelect
      .mockReturnValueOnce(createChainable([{ userId: 'caller', fullName: 'Caller', avatarUrl: '' }]))
      .mockReturnValueOnce(createChainable([{ userId: 'recipient' }]))
      // For GET after cancel
      .mockReturnValueOnce(createChainable([{ userId: 'recipient' }]))

    const recipientId = 'recipient'

    // Initiate first to store signal
    await POST(buildRequest('http://localhost/api/call-signal', 'POST', {
      recipientId,
      channelName: 'chan',
      isVideoCall: false,
      action: 'initiate',
    }) as any)

    // Cancel signal
    const cancelRes: any = await POST(buildRequest('http://localhost/api/call-signal', 'POST', {
      recipientId,
      channelName: 'chan',
      isVideoCall: false,
      action: 'cancel',
    }) as any)
    expect(cancelRes.status).toBe(200)
    const cancelJson = await cancelRes.json()
    expect(cancelJson.success).toBe(true)

    // GET after cancel should return hasCall false
    const getRes: any = await GET(buildRequest('http://localhost/api/call-signal', 'GET') as any)
    const getJson = await getRes.json()
    expect(getJson.hasCall).toBe(false)
  })

  it('POST with missing fields returns 400', async () => {
    mockSelect.mockReturnValue(createChainable([{ userId: 'caller', fullName: 'Caller', avatarUrl: '' }]))
    const badReq = buildRequest('http://localhost/api/call-signal', 'POST', {
      recipientId: 'user', // channelName missing
      isVideoCall: true,
      action: 'initiate',
    })

    const res: any = await POST(badReq as any)
    expect(res.status).toBe(400)
  })

  it('POST with invalid action returns 400', async () => {
    mockSelect.mockReturnValue(createChainable([{ userId: 'caller', fullName: 'Caller', avatarUrl: '' }]))
    const req = buildRequest('http://localhost/api/call-signal', 'POST', {
      recipientId: 'user',
      channelName: 'chan',
      isVideoCall: true,
      action: 'unknown',
    })
    const res: any = await POST(req as any)
    expect(res.status).toBe(400)
  })
}) 