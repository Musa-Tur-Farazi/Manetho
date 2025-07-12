import { GET, POST } from '@/app/api/check-users/route'
import { NextRequest } from 'next/server'

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn((url: string, init?: any) => ({ url, ...init })),
  NextResponse: {
    json: jest.fn((body, init) => ({ status: init?.status ?? 200, json: async () => body })),
  },
}))

// Mock db (must avoid TDZ)
jest.mock('@/db', () => {
  const execute = jest.fn()
  return { db: { execute }, __executeMock: execute }
})

// Mock clerk auth
jest.mock('@clerk/nextjs/server', () => {
  const auth = jest.fn()
  return { auth, __authMock: auth }
})

// Mock user-sync util
jest.mock('@/lib/user-sync', () => ({ syncUserToDatabase: jest.fn() }))

import { NextResponse } from 'next/server'
// Access mocks now that modules loaded
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __executeMock: mockExecute } = require('@/db')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { __authMock: mockAuth } = require('@clerk/nextjs/server')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { syncUserToDatabase } = require('@/lib/user-sync')

describe('/api/check-users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null })
      const res = await GET()
      expect(res.status).toBe(401)
    })

    it('returns users with total count', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk123' })
      mockExecute
        .mockResolvedValueOnce({ rows: [{ user_id: '1' }] }) // users list
        .mockResolvedValueOnce({ rows: [{ total: 1 }] })      // count

      const res: any = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.totalUsers).toBe(1)
      expect(body.users).toHaveLength(1)
    })
  })

  describe('POST', () => {
    it('returns 401 when no user logged in', async () => {
      mockAuth.mockResolvedValue({ userId: null })
      const res: any = await POST()
      expect(res.status).toBe(401)
    })

    it('returns early when user exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk123' })
      mockExecute.mockResolvedValueOnce({ rows: [{ user_id: 'db1' }] })

      const res: any = await POST()
      const body = await res.json()
      expect(body.message).toMatch(/already exists/i)
      expect(res.status).toBe(200)
    })

    it('creates user when not exists', async () => {
      mockAuth.mockResolvedValue({ userId: 'clerk123' })
      mockExecute.mockResolvedValueOnce({ rows: [] }) // existing user check
      syncUserToDatabase.mockResolvedValue({ success: true, userId: 'db2' })

      const res: any = await POST()
      const body = await res.json()
      expect(body.userId).toBe('db2')
      expect(res.status).toBe(200)
    })
  })
}) 