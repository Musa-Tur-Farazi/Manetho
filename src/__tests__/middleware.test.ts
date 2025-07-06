import { describe, it, expect, jest } from '@jest/globals'

// Mock Clerk middleware so the handler function is returned directly
jest.mock('@clerk/nextjs/server', () => ({
  __esModule: true,
  clerkMiddleware: (fn: any) => fn,
}))

// Mock Next.js server helpers

jest.mock('next/server', () => {
  const mockRedirect = jest.fn((url: URL) => ({ type: 'redirect', url }))
  const mockNext = jest.fn(() => ({ type: 'next' }))
  return {
    __esModule: true,
    NextResponse: {
      redirect: mockRedirect,
      next: mockNext,
    },
    NextRequest: class {},
  }
})

// Import will be done inside isolateModules after mocks are set up
let middleware: any

const buildReq = (path: string) => ({
  nextUrl: new URL(`http://localhost${path}`),
  url: `http://localhost${path}`,
} as any)

// Dynamically import the middleware with mocks in place
beforeAll(() => {
  jest.isolateModules(() => {
    middleware = require('../middleware').default
  })
})

describe('middleware routing', () => {
  it('redirects legacy /ai-solver path', () => {
    const res = middleware(null as any, buildReq('/ai-solver')) as any
    expect(res.type).toBe('redirect')
    expect(res.url.pathname).toBe('/tools/doubt-solving')
  })

  it('falls through to NextResponse.next for other routes', () => {
    const res = middleware(null as any, buildReq('/random')) as any
    expect(res.type).toBe('next')
  })
}) 