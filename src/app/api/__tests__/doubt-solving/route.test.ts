import { POST } from '@/app/api/doubt-solving/route';
import { NextRequest } from 'next/server';

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

// Mock database helpers
jest.mock('@/lib/database-helpers');

// Mock user-sync
jest.mock('@/lib/user-sync', () => ({
  syncUserToDatabase: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock db
jest.mock('@/db', () => ({
  db: {
    execute: jest.fn().mockResolvedValue({ rows: [] }),
  },
}));


// Mock fetch for AI API
global.fetch = jest.fn()

describe('/api/doubt-solving', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers();
    process.env.OPENROUTER_API_KEY = 'test-key';
  })

  it('should process doubt solving request successfully', async () => {
    const { findUserByClerkId, createDoubtSolvingSession, createSessionMessage } = require('@/lib/database-helpers')
    findUserByClerkId.mockResolvedValue({
      userId: 'db_user_123',
      clerkId: 'clerk_user_123'
    })
    createDoubtSolvingSession.mockResolvedValue({
      sessionId: 'session_123',
      title: 'Math Problem Help'
    })
    createSessionMessage.mockResolvedValue({
      messageId: 'msg_123',
      content: 'I can help you with this math problem...'
    })

    // Mock AI API response
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'I can help you with this math problem...'
          }
        }]
      })
    })

    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with calculus' }],
        sessionId: 'session_123'
      })
    })

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reply).toContain('I can help you with this math problem');
    expect(createSessionMessage).toHaveBeenCalledTimes(2); // User message + AI response
  })

  it('should handle missing user', async () => {
    const { findUserByClerkId } = require('@/lib/database-helpers');
    findUserByClerkId.mockResolvedValue(null);
    const { db } = require('@/db');
    db.execute.mockResolvedValue({ rows: [] });


    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with calculus' }],
        sessionId: 'session_123'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('should handle missing message and return 400', async () => {
    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'session_123' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should handle AI API errors and return 503', async () => {
    const { findUserByClerkId, createSessionMessage } = require('@/lib/database-helpers')
    findUserByClerkId.mockResolvedValue({
      userId: 'db_user_123',
      clerkId: 'clerk_user_123'
    })

    // Mock AI API error
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with calculus' }],
        sessionId: 'session_123'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(503)
  })

  it('should handle file uploads', async () => {
    const { findUserByClerkId, createSessionMessage } = require('@/lib/database-helpers')
    findUserByClerkId.mockResolvedValue({
      userId: 'db_user_123',
      clerkId: 'clerk_user_123'
    })
    createSessionMessage.mockResolvedValue({
      messageId: 'msg_123',
      content: 'I can help you with this problem...'
    })

    // Mock AI API response
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'I can help you with this problem...'
          }
        }]
      })
    })

    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with this problem' }],
        sessionId: 'session_123',
        file: {
            name: 'problem.jpg',
            type: 'image/jpeg',
            data: 'base64_encoded_image_data'
          }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return 500 for invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });

  it('should still succeed even if database write fails', async () => {
    const { createSessionMessage } = require('@/lib/database-helpers');
    createSessionMessage.mockRejectedValue(new Error('DB error'));

    const { findUserByClerkId, createDoubtSolvingSession } = require('@/lib/database-helpers')
    findUserByClerkId.mockResolvedValue({
      userId: 'db_user_123',
      clerkId: 'clerk_user_123'
    })
    createDoubtSolvingSession.mockResolvedValue({
      sessionId: 'session_123',
      title: 'Math Problem Help'
    })

    // Mock AI API response
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'I can help you with this problem...'
          }
        }]
      })
    })

    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with calculus' }],
        sessionId: 'session_123'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(200);
  });

  it('should handle AI API rate limiting and return 429', async () => {
    const { findUserByClerkId, createSessionMessage } = require('@/lib/database-helpers')
    findUserByClerkId.mockResolvedValue({
      userId: 'db_user_123',
      clerkId: 'clerk_user_123'
    })

    // Mock AI API error
    const mockFetch = global.fetch as jest.Mock
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });

    const request = new NextRequest('http://localhost:3000/api/doubt-solving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'I need help with calculus' }],
        sessionId: 'session_123'
      })
    })

    const response = await POST(request)

    expect(response.status).toBe(429)
  })
}) 