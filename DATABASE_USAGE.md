# 🗄️ Database Usage Guide - Drizzle ORM

## ✅ Database Cleanup Complete

The database backend has been standardized to use **Drizzle ORM exclusively**. All raw SQL usage should be migrated to use the helper functions and Drizzle patterns.

### 🔥 What Was Cleaned Up

- ❌ **Removed** `db.sql` - Raw SQL schema file (conflicting with Drizzle)
- ❌ **Removed** `db.md` - Redundant documentation 
- ✅ **Kept** `DATABASE_SCHEMA.md` - Comprehensive schema documentation
- ✅ **Kept** `src/db/schema.ts` - Drizzle ORM schema definition
- ✅ **Added** `src/lib/database-helpers.ts` - Standardized database operations

---

## 🏗️ Current Database Architecture

### Technology Stack
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Drizzle ORM with TypeScript
- **Connection**: `@neondatabase/serverless`
- **Migrations**: Drizzle Kit

### Configuration Files
```
├── drizzle.config.ts          # Drizzle configuration
├── src/db/
│   ├── index.ts              # Database connection
│   ├── schema.ts             # Complete schema definition
│   └── seed.ts               # Database seeding
├── src/lib/
│   └── database-helpers.ts   # Standardized operations
└── drizzle/                  # Migration files
    ├── 0000_*.sql
    ├── 0001_*.sql
    └── meta/
```

---

## 🚀 How to Use the Database

### 1. Import the Helpers (Recommended)

```typescript
import { 
  findUserByClerkId, 
  getThreads, 
  createThread,
  getUserSessions 
} from '@/lib/database-helpers';

// Get user by Clerk ID
const user = await findUserByClerkId(clerkUserId);

// Get paginated threads
const threads = await getThreads({
  limit: 10,
  offset: 0,
  sortBy: 'recent',
  search: 'javascript'
});
```

### 2. Direct Drizzle Usage (Advanced)

```typescript
import { db } from '@/db';
import { usersTable, threadsTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Find user
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.clerkId, clerkId))
  .limit(1);

// Complex queries with joins
const threadsWithUsers = await db
  .select({
    threadId: threadsTable.threadId,
    title: threadsTable.title,
    creatorName: usersTable.fullName,
  })
  .from(threadsTable)
  .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.userId))
  .where(eq(threadsTable.isLocked, false))
  .orderBy(desc(threadsTable.createdAt));
```

---

## 📋 Available Helper Functions

### User Operations
- `findUserByClerkId(clerkId: string)`
- `findUserByEmail(email: string)`
- `createUser(userData: UserData)`
- `updateUser(userId: string, updates: Partial<UserData>)`

### Thread Operations
- `getThreads(options: GetThreadsOptions)`
- `getThreadCount(search?: string)`
- `getThreadById(threadId: string)`
- `createThread(threadData: ThreadData)`
- `deleteThread(threadId: string)`
- `updateThreadLikes(threadId: string, increment: boolean)`

### Comment Operations
- `getCommentsByThreadId(threadId: string)`
- `createComment(commentData: CommentData)`

### Doubt Solving Operations
- `getUserSessions(userId: string)`
- `getSessionById(sessionId: string)`
- `createDoubtSolvingSession(sessionData: SessionData)`
- `getSessionMessages(sessionId: string)`
- `createSessionMessage(messageData: MessageData)`

### Utilities
- `checkTablesExist()` - Verify database connection

---

## 🔄 Migration Guide

### ❌ OLD WAY (Raw SQL)
```typescript
// DON'T DO THIS
const result = await db.execute(sql`
  SELECT * FROM users WHERE "clerkId" = ${userId} LIMIT 1
`);
const user = result.rows[0];
```

### ✅ NEW WAY (Drizzle ORM)
```typescript
// DO THIS INSTEAD
const user = await findUserByClerkId(userId);

// OR direct Drizzle
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.clerkId, userId))
  .limit(1);
const user = users[0];
```

---

## 🛠️ Database Commands

```bash
# Generate migrations after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

---

## 🔍 Example API Route

See `src/app/api/community/threads-drizzle/route.ts` for a complete example of:
- ✅ Proper Drizzle usage
- ✅ Error handling
- ✅ TypeScript types
- ✅ Helper function usage

---

## 🚨 Files to Refactor

The following API routes still use raw SQL and need to be converted:

**High Priority:**
- `src/app/api/community/threads/route.ts`
- `src/app/api/doubt-solving/sessions/[sessionId]/messages/route.ts`
- `src/lib/user-sync.ts`
- `src/app/api/webhooks/clerk/route.ts`

**Medium Priority:**
- All files in `src/app/api/doubt-solving/`
- All files in `src/app/api/community/`

---

## 📊 Schema Overview

Your Drizzle schema includes **70+ tables** organized into:

1. **Core Tables** - Users, auth, profiles
2. **Learning Content** - Subjects, topics, flashcards, mind maps
3. **Communication** - Chats, threads, comments, messages
4. **Analytics** - Progress tracking, achievements, streaks
5. **Business** - Subscriptions, payments, reports
6. **AI Features** - Content generation, learning data
7. **Utilities** - Notifications, file uploads

All properly typed, with relationships and foreign keys defined!

---

## 🎯 Next Steps

1. **Test the helpers**: Use the new helper functions in one API route
2. **Refactor gradually**: Convert one API file at a time
3. **Remove raw SQL**: Replace all `db.execute(sql\`...\`)` calls
4. **Use TypeScript**: Leverage the full type safety of Drizzle

The database is now clean, consistent, and ready for development! 🚀 