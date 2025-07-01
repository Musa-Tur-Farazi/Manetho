/**
*@jest-environment node
*/

import { GET } from '@/app/api/health/route';

// Polyfill the full fetch API for Next.js route handler tests
import { fetch, Headers, Request, Response } from '@whatwg-node/fetch';

if (!globalThis.fetch) {
  // Polyfill fetch and related APIs for the test environment
  globalThis.fetch = fetch as typeof globalThis.fetch;
  globalThis.Headers = Headers as typeof globalThis.Headers;
  globalThis.Request = Request as typeof globalThis.Request;
  globalThis.Response = Response as typeof globalThis.Response;
}

// Mock the database
jest.mock('@/db', () => ({
  db: {
    execute: jest.fn().mockResolvedValue([{ health_check: 1 }])
  }
}));

describe('Health API', () => {
  it('returns a 200 status and the correct data', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('database', 'connected');
  });
});
