import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/community/threads-drizzle/route';

jest.mock('next/server', () => ({
  NextRequest: jest.fn((input, init) => ({
    json: () => Promise.resolve(init?.body ? JSON.parse(init.body) : {}),
    headers: new Headers(init?.headers),
    url: input,
    method: init?.method,
    body: init?.body,
    nextUrl: new URL(input),
  })),
  NextResponse: {
    json: jest.fn((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body,
        headers: new Headers(),
      };
    }),
  },
}));

// Mock Clerk
// jest.mock('@clerk/nextjs/server', () => ({
//   auth: jest.fn(() => Promise.resolve({
//     userId: 'clerk_user_123',
//     user: {
//       id: 'clerk_user_123',
//       fullName: 'John Doe',
//       emailAddresses: [{ emailAddress: 'john@example.com' }]
//     }
//   }))
// }));

// Mock database helpers
jest.mock('@/lib/database-helpers', () => ({
  getThreads: jest.fn(),
  getThreadCount: jest.fn(),
  createThread: jest.fn(),
  findUserByClerkId: jest.fn()
}))

describe('/api/community/threads-drizzle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return threads with pagination', async () => {
      const { getThreads, getThreadCount } = require('@/lib/database-helpers')
      getThreads.mockResolvedValue([
        { threadId: '1', title: 'Thread 1', body: 'Content 1' },
        { threadId: '2', title: 'Thread 2', body: 'Content 2' }
      ])
      getThreadCount.mockResolvedValue(10)

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle?page=1&limit=5')
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.threads).toHaveLength(2);
      expect(data.data.pagination.total).toBe(10);
      expect(getThreads).toHaveBeenCalledWith({
        limit: 5,
        offset: 0,
        sortBy: 'recent',
        search: undefined
      });
    });

    it('should handle search parameter', async () => {
      const { getThreads, getThreadCount } = require('@/lib/database-helpers')
      getThreads.mockResolvedValue([
        { threadId: '1', title: 'Search Result', body: 'Content' }
      ])
      getThreadCount.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle?search=test')
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.threads).toHaveLength(1);
      expect(getThreads).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        sortBy: 'recent',
        search: 'test'
      });
    });

    it('should handle database errors', async () => {
      const { getThreads } = require('@/lib/database-helpers')
      getThreads.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it('should handle invalid pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle?page=invalid&limit=invalid');
      const response = await GET(request);
      expect(response.status).toBe(400);
    });
  })

  describe('POST', () => {
    it('should create new thread successfully', async () => {
      const { createThread, findUserByClerkId } = require('@/lib/database-helpers')
      findUserByClerkId.mockResolvedValue({
        userId: 'db_user_123',
        clerkId: 'clerk_user_123'
      })
      createThread.mockResolvedValue({
        threadId: 'new_thread_123',
        title: 'New Thread',
        body: 'Content',
        createdBy: 'db_user_123'
      })

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Thread',
          body: 'Content'
        })
      })

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual({
        threadId: 'new_thread_123',
        title: 'New Thread',
        body: 'Content',
        createdBy: 'db_user_123',
        subjectId: undefined,
        topicId: undefined
      });
      expect(createThread).toHaveBeenCalledWith({
        title: 'New Thread',
        body: 'Content',
        createdBy: 'db_user_123'
      })
    })

    it('should handle missing user', async () => {
      const { findUserByClerkId } = require('@/lib/database-helpers')
      findUserByClerkId.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Thread',
          body: 'Content'
        })
      })

      const response = await POST(request);

      expect(response.status).toBe(404);
    });

    it('should handle missing required fields', async () => {
      const { findUserByClerkId } = require('@/lib/database-helpers');
      findUserByClerkId.mockResolvedValue({
        userId: 'db_user_123',
        clerkId: 'clerk_user_123'
      });
      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Thread'
          // missing body
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle database errors', async () => {
      const { findUserByClerkId, createThread } = require('@/lib/database-helpers')
      findUserByClerkId.mockResolvedValue({
        userId: 'db_user_123',
        clerkId: 'clerk_user_123'
      })
      createThread.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Thread',
          body: 'Content'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/community/threads-drizzle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request);

      expect(response.status).toBe(500);
    })
  })
}) 