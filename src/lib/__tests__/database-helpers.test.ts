// Mock Drizzle Kit and schema
jest.mock('drizzle-orm/sql', () => ({
  sql: jest.fn((strings, ...values) => ({
    strings,
    values,
    toSQL: () => strings.join('?'),
  })),
  eq: jest.fn(),
  asc: jest.fn(),
  desc: jest.fn(),
  count: jest.fn(() => 'COUNT(*)'),
  ilike: jest.fn(),
  or: jest.fn(),
}));

jest.mock('@/db/schema', () => ({
  usersTable: 'users',
  threadsTable: 'threads',
  commentsTable: 'comments',
  doubtSolvingSessionsTable: 'doubt_solving_sessions',
  doubtSolvingMessagesTable: 'doubt_solving_messages',
}));

jest.mock('@/db', () => {
  const chainable = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    then: jest.fn(resolve => resolve([])),
  };

  const mockDb = {
    select: jest.fn(() => chainable),
    insert: jest.fn(() => chainable),
    update: jest.fn(() => chainable),
    delete: jest.fn(() => chainable),
    execute: jest.fn().mockResolvedValue({ rows: [] }),
    __chainable: chainable, // Expose for test configuration
  };
  return { db: mockDb };
});


// Import the modules after mocking
import {
  findUserByClerkId,
  findUserByEmail,
  createUser,
  updateUser,
  getThreads,
  getThreadCount,
  getThreadById,
  createThread,
  deleteThread,
  updateThreadLikes,
  getCommentsByThreadId,
  createComment,
  getUserSessions,
  getSessionById,
  createDoubtSolvingSession,
  getSessionMessages,
  createSessionMessage,
  checkTablesExist,
} from '@/lib/database-helpers';
import { sql } from 'drizzle-orm';

const { db: mockDb } = require('@/db');
const chainable = mockDb.__chainable;

describe('database-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the 'then' mock before each test
    chainable.then = jest.fn(resolve => resolve([]));
  });

  describe('findUserByClerkId', () => {
    it('should find user by clerk ID', async () => {
      const mockUser = { userId: '123', clerkId: 'clerk_123', fullName: 'John Doe' };
      chainable.then.mockImplementationOnce(resolve => resolve([mockUser]));

      const result = await findUserByClerkId('clerk_123');

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(chainable.from).toHaveBeenCalledWith('users');
      expect(chainable.where).toHaveBeenCalled();
      expect(chainable.limit).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      chainable.then.mockImplementationOnce(resolve => resolve([]));
      const result = await findUserByClerkId('clerk_123');
      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { userId: '123', email: 'john@example.com', fullName: 'John Doe' };
      chainable.then.mockImplementationOnce(resolve => resolve([mockUser]));
      const result = await findUserByEmail('john@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = { userId: '123', clerkId: 'clerk_123', fullName: 'John Doe', email: 'john@example.com' };
      chainable.returning.mockResolvedValueOnce([mockUser]);

      const result = await createUser({
        clerkId: 'clerk_123',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'student',
      });
      
      expect(mockDb.insert).toHaveBeenCalledWith('users');
      expect(chainable.values).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = { userId: '123', fullName: 'John Updated', email: 'john@example.com' };
      chainable.returning.mockResolvedValueOnce([mockUser]);
      const result = await updateUser('123', { fullName: 'John Updated' });
      expect(mockDb.update).toHaveBeenCalledWith('users');
      expect(chainable.set).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('getThreads', () => {
    it('should get threads with default options', async () => {
      const mockThreads = [{ threadId: '1' }, { threadId: '2' }];
      chainable.then.mockImplementationOnce(resolve => resolve(mockThreads));
      const result = await getThreads({});
      expect(result).toEqual(mockThreads);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should get threads with search and sorting', async () => {
      const mockThreads = [{ threadId: '1', title: 'Search Result' }];
      chainable.then.mockImplementationOnce(resolve => resolve(mockThreads));

      const result = await getThreads({
        limit: 10,
        offset: 0,
        sortBy: 'recent',
        search: 'search term',
      });
      expect(result).toEqual(mockThreads);
      expect(chainable.where).toHaveBeenCalled();
      expect(chainable.orderBy).toHaveBeenCalled();
    });
  });

  describe('getThreadCount', () => {
    it('should get thread count', async () => {
      chainable.then.mockImplementationOnce(resolve => resolve([{ count: 5 }]));
      const result = await getThreadCount();
      expect(result).toBe(5);
    });

    it('should get thread count with search', async () => {
      chainable.then.mockImplementationOnce(resolve => resolve([{ count: 2 }]));
      const result = await getThreadCount('search term');
      expect(result).toBe(2);
      expect(chainable.where).toHaveBeenCalled();
    });
  });

  describe('getThreadById', () => {
    it('should get thread by ID', async () => {
      const mockThread = { threadId: '1', title: 'Thread 1' };
      chainable.then.mockImplementationOnce(resolve => resolve([mockThread]));
      const result = await getThreadById('1');
      expect(result).toEqual(mockThread);
    });
  });

  describe('createThread', () => {
    it('should create thread successfully', async () => {
      const mockThread = { threadId: '1', title: 'New Thread' };
      chainable.returning.mockResolvedValueOnce([mockThread]);
      const result = await createThread({
        title: 'New Thread',
        body: 'Content',
        createdBy: 'user123',
      });
      expect(result).toEqual(mockThread);
    });
  });

  describe('deleteThread', () => {
    it('should delete thread successfully', async () => {
      await deleteThread('1');
      expect(mockDb.delete).toHaveBeenCalledWith('threads');
      expect(chainable.where).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateThreadLikes', () => {
    it('should increment thread likes', async () => {
      chainable.then.mockImplementationOnce(resolve => resolve([{ likeCount: 6 }]));
      const result = await updateThreadLikes('1', true);
      expect(result).toBe(6);
      expect(chainable.set).toHaveBeenCalledWith({ likeCount: expect.any(Object) });
    });

    it('should decrement thread likes', async () => {
      chainable.then.mockImplementationOnce(resolve => resolve([{ likeCount: 4 }]));
      const result = await updateThreadLikes('1', false);
      expect(result).toBe(4);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should get comments for thread', async () => {
      const mockComments = [{ commentId: '1' }, { commentId: '2' }];
      chainable.then.mockImplementationOnce(resolve => resolve(mockComments));
      const result = await getCommentsByThreadId('1');
      expect(result).toEqual(mockComments);
    });
  });

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      const mockComment = { commentId: '1', content: 'New Comment' };
      // Mock for insert returning the new comment
      chainable.then.mockImplementationOnce(resolve => resolve([mockComment]));
      // Mock for the update call
      chainable.then.mockImplementationOnce(resolve => resolve([]));

      const result = await createComment({
        threadId: '1',
        senderId: 'user123',
        content: 'New Comment',
      });

      expect(result).toEqual(mockComment);
      expect(mockDb.insert).toHaveBeenCalledWith('comments');
      expect(mockDb.update).toHaveBeenCalledWith('threads');
    });
  });

  describe('getUserSessions', () => {
    it('should get user sessions', async () => {
      const mockSessions = [{ sessionId: '1' }, { sessionId: '2' }];
      chainable.then.mockImplementationOnce(resolve => resolve(mockSessions));
      const result = await getUserSessions('user123');
      expect(result).toEqual(mockSessions);
    });
  });

  describe('getSessionById', () => {
    it('should get session by ID', async () => {
      const mockSession = { sessionId: '1', title: 'Session 1' };
      chainable.then.mockImplementationOnce(resolve => resolve([mockSession]));
      const result = await getSessionById('1');
      expect(result).toEqual(mockSession);
    });
  });

  describe('createDoubtSolvingSession', () => {
    it('should create doubt solving session', async () => {
      const mockSession = { sessionId: '1', title: 'New Session' };
      chainable.then.mockImplementationOnce(resolve => resolve([mockSession]));
      const result = await createDoubtSolvingSession({
        userId: 'user123',
        title: 'New Session',
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('getSessionMessages', () => {
    it('should get session messages', async () => {
      const mockMessages = [{ messageId: '1' }, { messageId: '2' }];
      chainable.then.mockImplementationOnce(resolve => resolve(mockMessages));
      const result = await getSessionMessages('1');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('createSessionMessage', () => {
    it('should create session message', async () => {
      const mockMessage = { messageId: '1', content: 'New Message' };
      // Mock for insert returning the new message
      chainable.then.mockImplementationOnce(resolve => resolve([mockMessage]));
      // Mock for the update call
      chainable.then.mockImplementationOnce(resolve => resolve([]));

      const result = await createSessionMessage({
        sessionId: '1',
        role: 'user',
        content: 'New Message',
      });

      expect(result).toEqual(mockMessage);
      expect(mockDb.insert).toHaveBeenCalledWith('doubt_solving_messages');
      expect(mockDb.update).toHaveBeenCalledWith('doubt_solving_sessions');
    });
  });

  describe('checkTablesExist', () => {
    it('should check if tables exist', async () => {
      mockDb.execute.mockResolvedValue({
        rows: [{ table_name: 'users' }, { table_name: 'threads' }, { table_name: 'doubt_solving_sessions' }],
      });

      const result = await checkTablesExist();

      expect(result).toEqual({
        users: true,
        threads: true,
        sessions: true,
      });
    });

    it('should return false when tables do not exist', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      const result = await checkTablesExist();

      expect(result).toEqual({
        users: false,
        threads: false,
        sessions: false,
      });
    });
  });
}); 