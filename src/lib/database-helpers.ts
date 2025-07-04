import { db } from '@/db';
import {
  usersTable,
  threadsTable,
  commentsTable,
  doubtSolvingSessionsTable,
  doubtSolvingMessagesTable,
  chatsTable,
  messagesTable
} from '@/db/schema';
import { eq, desc, asc, count, and, or, ilike, sql } from 'drizzle-orm';

// User Operations
export async function findUserByClerkId(clerkId: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  return users[0] || null;
}

export async function findUserByEmail(email: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return users[0] || null;
}

export async function createUser(userData: {
  clerkId?: string;
  fullName: string;
  email: string;
  role?: 'student' | 'teacher' | 'admin';
}) {
  const newUsers = await db
    .insert(usersTable)
    .values({
      clerkId: userData.clerkId,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || 'student',
    })
    .returning();

  return newUsers[0];
}

export async function updateUser(userId: string, updates: Partial<{
  fullName: string;
  email: string;
  lastActiveAt: Date;
  avatarUrl: string;
  isLocked: boolean;
}>) {
  const updatedUsers = await db
    .update(usersTable)
    .set({
      ...updates,
      // Always update the timestamp when updating user
      lastActiveAt: new Date(),
    })
    .where(eq(usersTable.userId, userId))
    .returning();

  return updatedUsers[0] || null;
}

// Thread Operations
export async function getThreads(options: {
  limit?: number;
  offset?: number;
  sortBy?: 'recent' | 'popular' | 'mostComments';
  search?: string;
}) {
  const { limit = 10, offset = 0, sortBy = 'recent', search } = options;

  let query = db
    .select({
      threadId: threadsTable.threadId,
      title: threadsTable.title,
      body: threadsTable.body,
      createdBy: threadsTable.createdBy,
      createdAt: threadsTable.createdAt,
      updatedAt: threadsTable.updatedAt,
      likeCount: threadsTable.likeCount,
      commentCount: threadsTable.commentCount,
      viewCount: threadsTable.viewCount,
      isPinned: threadsTable.isPinned,
      isLocked: threadsTable.isLocked,
    })
    .from(threadsTable);

  // Add search filter if provided
  if (search) {
    query = query.where(
      or(
        ilike(threadsTable.title, `%${search}%`),
        ilike(threadsTable.body, `%${search}%`)
      )
    );
  }

  // Add sorting
  switch (sortBy) {
    case 'popular':
      query = query.orderBy(desc(threadsTable.likeCount));
      break;
    case 'mostComments':
      query = query.orderBy(desc(threadsTable.commentCount));
      break;
    default:
      query = query.orderBy(desc(threadsTable.createdAt));
  }

  // Add pagination
  query = query.limit(limit).offset(offset);

  return await query;
}

export async function getThreadCount(search?: string) {
  let query = db
    .select({ count: count() })
    .from(threadsTable);

  if (search) {
    query = query.where(
      or(
        ilike(threadsTable.title, `%${search}%`),
        ilike(threadsTable.body, `%${search}%`)
      )
    );
  }

  const result = await query;
  return result[0]?.count || 0;
}

export async function getThreadById(threadId: string) {
  const threads = await db
    .select()
    .from(threadsTable)
    .where(eq(threadsTable.threadId, threadId))
    .limit(1);

  return threads[0] || null;
}

export async function createThread(threadData: {
  title: string;
  body: string;
  createdBy: string;
  subjectId?: string;
  topicId?: string;
}) {
  const newThreads = await db
    .insert(threadsTable)
    .values(threadData)
    .returning();

  return newThreads[0];
}

export async function deleteThread(threadId: string) {
  await db
    .delete(threadsTable)
    .where(eq(threadsTable.threadId, threadId));
}

export async function updateThreadLikes(threadId: string, increment = true) {
  await db
    .update(threadsTable)
    .set({
      likeCount: increment
        ? sql`${threadsTable.likeCount} + 1`
        : sql`${threadsTable.likeCount} - 1`
    })
    .where(eq(threadsTable.threadId, threadId));
}

// Comment Operations
export async function getCommentsByThreadId(threadId: string) {
  return await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.threadId, threadId))
    .orderBy(asc(commentsTable.timestamp));
}

export async function createComment(commentData: {
  threadId: string;
  senderId: string;
  content: string;
  parentCommentId?: string;
}) {
  const newComments = await db
    .insert(commentsTable)
    .values(commentData)
    .returning();

  // Update comment count on thread
  await db
    .update(threadsTable)
    .set({
      commentCount: sql`${threadsTable.commentCount} + 1`
    })
    .where(eq(threadsTable.threadId, commentData.threadId));

  return newComments[0];
}

// Doubt Solving Session Operations
export async function getUserSessions(userId: string) {
  return await db
    .select()
    .from(doubtSolvingSessionsTable)
    .where(eq(doubtSolvingSessionsTable.userId, userId))
    .orderBy(desc(doubtSolvingSessionsTable.lastMessageAt));
}

export async function getSessionById(sessionId: string) {
  const sessions = await db
    .select()
    .from(doubtSolvingSessionsTable)
    .where(eq(doubtSolvingSessionsTable.sessionId, sessionId))
    .limit(1);

  return sessions[0] || null;
}

export async function createDoubtSolvingSession(sessionData: {
  userId: string;
  title: string;
  subjectId?: string;
  topicId?: string;
}) {
  const newSessions = await db
    .insert(doubtSolvingSessionsTable)
    .values(sessionData)
    .returning();

  return newSessions[0];
}

export async function getSessionMessages(sessionId: string) {
  return await db
    .select()
    .from(doubtSolvingMessagesTable)
    .where(eq(doubtSolvingMessagesTable.sessionId, sessionId))
    .orderBy(asc(doubtSolvingMessagesTable.createdAt));
}

export async function createSessionMessage(messageData: {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  tokenCount?: number;
  processingTime?: number;
  modelUsed?: string;
}) {
  const newMessages = await db
    .insert(doubtSolvingMessagesTable)
    .values(messageData)
    .returning();

  // Update session message count and last message time
  await db
    .update(doubtSolvingSessionsTable)
    .set({
      messageCount: sql`${doubtSolvingSessionsTable.messageCount} + 1`,
      lastMessageAt: new Date(),
    })
    .where(eq(doubtSolvingSessionsTable.sessionId, messageData.sessionId));

  return newMessages[0];
}

// Utility function to check if tables exist
export async function checkTablesExist() {
  try {
    const tableChecks = await Promise.all([
      db.select({ count: count() }).from(usersTable).limit(1),
      db.select({ count: count() }).from(threadsTable).limit(1),
      db.select({ count: count() }).from(doubtSolvingSessionsTable).limit(1),
    ]);

    return {
      users: true,
      threads: true,
      sessions: true,
    };
  } catch (error) {
    console.error('Table check failed:', error);
    return {
      users: false,
      threads: false,
      sessions: false,
    };
  }
} 