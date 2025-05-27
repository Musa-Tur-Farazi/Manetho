import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth, currentUser } from '@clerk/nextjs/server';
import { syncUserToDatabase } from '@/lib/user-sync';

// GET - Fetch threads with search and filtering
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching threads...');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'All';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query threads with search and sorting
    let threads: any[] = [];
    let totalCount = 0;

    try {
      if (search && search.trim()) {
        // Query with search
        const searchPattern = `%${search}%`;

        const countResult = await db.execute(sql`
          SELECT COUNT(*) as count FROM threads 
          WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
        `);
        totalCount = parseInt(countResult.rows[0].count);

        if (totalCount > 0) {
          if (sortBy === 'popular') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
              ORDER BY like_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else if (sortBy === 'mostComments') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
              ORDER BY comment_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
              ORDER BY created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          }
        }
      } else {
        // Query without search
        const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM threads`);
        totalCount = parseInt(countResult.rows[0].count);

        if (totalCount > 0) {
          if (sortBy === 'popular') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              ORDER BY like_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else if (sortBy === 'mostComments') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              ORDER BY comment_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by
              FROM threads 
              ORDER BY created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          }
        }
      }

      console.log('Fetched threads:', threads.length, 'Total:', totalCount);
    } catch (error) {
      console.error('Database query error:', error);
      // Continue with empty results if query fails
    }

    // Get user data for each thread (if any threads exist)
    const users: any = {};

    if (threads.length > 0) {
      const userIds = [...new Set(threads.map((t: any) => t.created_by).filter(Boolean))];

      if (userIds.length > 0) {
        // Fetch users one by one to avoid complex query issues
        for (const userId of userIds) {
          try {
            const userResult: any = await db.execute(
              sql`SELECT id, name, "firstName", "lastName", "imageUrl" FROM users WHERE id = ${userId} LIMIT 1`
            );
            if (userResult.rows && userResult.rows.length > 0) {
              users[userId] = userResult.rows[0];
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }
      }
    }

    // Fetch comments for each thread
    const threadsWithComments = await Promise.all(
      threads.map(async (thread: any) => {
        const user = users[thread.created_by];
        const authorName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous') : 'Anonymous';
        const authorImage = user?.imageUrl || 'https://i.pravatar.cc/150?img=12';

        // Fetch comments for this thread
        let commentsList: any[] = [];
        try {
          const commentsResult = await db.execute(sql`
            SELECT 
              c.comment_id,
              c.content,
              c.timestamp,
              c.like_count,
              c.parent_comment_id,
              c.sender_id,
              u.name,
              u."firstName",
              u."lastName", 
              u."imageUrl"
            FROM comments c
            LEFT JOIN users u ON c.sender_id = u.id
            WHERE c.thread_id = ${thread.thread_id}
            ORDER BY c.timestamp ASC
            LIMIT 10
          `);

          if (commentsResult.rows) {
            commentsList = commentsResult.rows.map((comment: any) => {
              const commentAuthorName = comment.name || `${comment.firstName || ''} ${comment.lastName || ''}`.trim() || 'Anonymous';
              return {
                id: comment.comment_id,
                author: commentAuthorName,
                authorImage: comment.imageUrl || 'https://i.pravatar.cc/150?img=12',
                content: comment.content,
                timeAgo: getTimeAgo(new Date(comment.timestamp)),
                likes: comment.like_count || 0,
                parentCommentId: comment.parent_comment_id,
              };
            });
          }
        } catch (error) {
          console.error(`Error fetching comments for thread ${thread.thread_id}:`, error);
        }

        return {
          id: thread.thread_id,
          title: thread.title,
          content: thread.body,
          category: 'General', // You can map this based on subject/topic
          author: authorName,
          authorImage: authorImage,
          date: new Date(thread.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          timeAgo: getTimeAgo(new Date(thread.created_at)),
          stars: thread.like_count || 0,
          comments: thread.comment_count || 0,
          userStarred: false, // We'll need to implement user likes tracking
          commentsList: commentsList,
          isPinned: thread.is_pinned,
          isLocked: thread.is_locked,
          viewCount: thread.view_count,
        };
      })
    );

    return NextResponse.json({
      threads: threadsWithComments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads', details: error },
      { status: 500 }
    );
  }
}

// POST - Create a new thread
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log('Auth result - userId:', userId); // Debug log

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a post' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Debug: Check all users to understand the data structure
    const allUsers: any = await db.execute(sql`SELECT id, "clerkId", name, email FROM users LIMIT 5`);
    console.log('All users sample:', allUsers.rows);

    // Get the user from the database - use the correct column name
    let userResult: any = await db.execute(
      sql`SELECT * FROM users WHERE "clerkId" = ${userId} LIMIT 1`
    );

    console.log('User query result:', userResult); // Debug log
    console.log('User ID from auth:', userId); // Debug log

    if (!userResult || !userResult.rows || userResult.rows.length === 0) {
      console.log('No user found with clerkId:', userId);

      // Try to sync the user using our utility function
      const syncResult = await syncUserToDatabase();

      if (!syncResult.success) {
        return NextResponse.json(
          { error: `Failed to sync user: ${syncResult.message}` },
          { status: 500 }
        );
      }

      // Re-fetch the user after sync
      userResult = await db.execute(
        sql`SELECT * FROM users WHERE "clerkId" = ${userId} LIMIT 1`
      );

      if (!userResult || !userResult.rows || userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'User sync failed - user not found after creation' },
          { status: 500 }
        );
      }

      console.log('User synced successfully:', userResult.rows[0]);
    }

    const user = userResult.rows[0];
    console.log('User object:', user); // Debug log

    // Create the thread - use the existing database structure
    const userIdField = user.id; // The existing database uses 'id' as integer
    if (!userIdField) {
      console.error('No user ID field found:', Object.keys(user));
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const newThreadResult = await db.execute(
      sql`
        INSERT INTO threads (title, body, created_by)
        VALUES (${title}, ${content}, ${userIdField})
        RETURNING *
      `
    );

    const newThread = newThreadResult.rows[0];

    // Format the response
    const formattedThread = {
      id: newThread.thread_id,
      title: newThread.title,
      content: newThread.body,
      category: category || 'General',
      author: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      authorImage: user.imageUrl || 'https://i.pravatar.cc/150?img=12',
      date: new Date(newThread.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      timeAgo: 'Just now',
      stars: 0,
      comments: 0,
      userStarred: false,
      commentsList: [],
      isPinned: false,
      isLocked: false,
      viewCount: 0,
    };

    return NextResponse.json(formattedThread, { status: 201 });

  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 