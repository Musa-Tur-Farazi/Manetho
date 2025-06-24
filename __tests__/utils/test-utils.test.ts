import { formatCurrency, isValidEmail, generateId } from '@/lib/test-utils';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});

describe('isValidEmail', () => {
  it('validates email addresses correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@example')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
  });
});

describe('generateId', () => {
  it('generates random IDs of the specified length', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toHaveLength(8); // Default length
    expect(id2).toHaveLength(8);
    expect(id1).not.toEqual(id2); // Should be random
    
    const customLengthId = generateId(12);
    expect(customLengthId).toHaveLength(12);
  });
});
