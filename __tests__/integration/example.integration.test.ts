import { describe, it, expect } from '@jest/globals';

describe('Example Integration Test', () => {
  it('should integrate two modules', () => {
    // Example: pretend to call two modules
    const result = [1, 2].map(x => x * 2).reduce((a, b) => a + b, 0);
    expect(result).toBe(6);
  });
}); 