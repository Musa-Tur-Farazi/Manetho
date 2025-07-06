import { syncUserToDatabase, ensureUserExists } from '@/lib/user-sync'

const { db: mockDb } = require('@/db');

jest.mock('@/db', () => {
  return {
    db: {
      execute: jest.fn(),
    },
  };
});

// Mock Clerk
// jest.mock('@clerk/nextjs/server', () => ({
//   auth: jest.fn(() => Promise.resolve({
//     userId: 'clerk_user_123',
//     user: {
//       id: 'clerk_user_123',
//       fullName: 'John Doe',
//       emailAddresses: [{ emailAddress: 'john@example.com' }],
//       imageUrl: 'https://example.com/avatar.jpg'
//     }
//   }))
// }))

// Mock database helpers
jest.mock('@/lib/database-helpers', () => ({
  findUserByClerkId: jest.fn(),
  createUser: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

describe('user-sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('syncUserToDatabase', () => {
    it('should sync existing user successfully', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [{ user_id: 'db_user_123' }] }) // check if user exists
        .mockResolvedValueOnce({ rows: [{ user_id: 'db_user_123', clerk_id: 'clerk_user_123', full_name: 'John Doe', email: 'john@example.com' }] }); // update user

      const result = await syncUserToDatabase();

      expect(result).toEqual({
        success: true,
        message: 'User updated successfully',
        userId: 'db_user_123',
      });
    });

    it('should create new user when not found', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] }) // check if user exists
        .mockResolvedValueOnce({ rows: [{ user_id: 'new_user_123', clerk_id: 'clerk_user_123', full_name: 'User', email: '' }] }); // create user

      const result = await syncUserToDatabase();

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(result.userId).toBe('new_user_123');
    });

    it('should handle database errors', async () => {
      jest.useFakeTimers();
      mockDb.execute.mockRejectedValue(new Error('Database error'));

      const promise = syncUserToDatabase();
      await jest.advanceTimersByTimeAsync(8000); // Wait for all retries
      const result = await promise;


      expect(result).toEqual({
        success: false,
        message: 'Failed to sync user after 3 attempts: Error: Database error',
      });
    });

    it('should retry on failure', async () => {
      jest.useFakeTimers();
      mockDb.execute
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ rows: [{ user_id: 'db_user_123' }] })
        .mockResolvedValueOnce({ rows: [{ user_id: 'db_user_123', clerk_id: 'clerk_user_123', full_name: 'John Doe', email: 'john@example.com' }] });

      const promise = syncUserToDatabase(2);
      await jest.advanceTimersByTimeAsync(4000);
      const result = await promise;

      expect(result.success).toBe(true);
      expect(mockDb.execute).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      jest.useFakeTimers();
      mockDb.execute.mockRejectedValue(new Error('Persistent error'));

      const promise = syncUserToDatabase(1);
      await jest.advanceTimersByTimeAsync(2000);
      const result = await promise;


      expect(result.success).toBe(false);
      expect(result.message).toContain('Persistent error');
    });

    it('should handle missing user data', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({
        userId: null,
      });

      const result = await syncUserToDatabase();

      expect(result.success).toBe(false);
      expect(result.message).toContain('No user found to sync');
    });
  })

  describe('ensureUserExists', () => {
    it('should return true when user exists', async () => {
      mockDb.execute.mockResolvedValue({ rows: [{ user_id: 'db_user_123' }] });

      const result = await ensureUserExists('clerk_user_123');

      expect(result).toEqual({
        exists: true,
        userId: 'db_user_123',
      });
    });

    it('should return false when user does not exist', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      const result = await ensureUserExists('clerk_user_123');

      expect(result).toEqual({
        exists: false,
      });
    });

    it('should handle database errors', async () => {
      mockDb.execute.mockRejectedValue(new Error('Database error'));
      const result = await ensureUserExists('clerk_user_123');
      expect(result.exists).toBe(false);
    });
  });
}); 