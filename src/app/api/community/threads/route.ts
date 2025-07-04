import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
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

    // Get current user ID for vote status
    let currentUserId = null;
    try {
      const authResult = await auth();
      if (authResult.userId) {
        const userResult = await db.execute(sql`
          SELECT user_id FROM users WHERE clerk_id = ${authResult.userId} LIMIT 1
        `);
        if (userResult.rows.length > 0) {
          currentUserId = userResult.rows[0].user_id;
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    }

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
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
              FROM threads 
              WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
              ORDER BY like_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else if (sortBy === 'mostComments') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
              FROM threads 
              WHERE (title ILIKE ${searchPattern} OR body ILIKE ${searchPattern})
              ORDER BY comment_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
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
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
              FROM threads 
              ORDER BY like_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else if (sortBy === 'mostComments') {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
              FROM threads 
              ORDER BY comment_count DESC
              LIMIT ${limit} OFFSET ${offset}
            `);
            threads = result.rows;
          } else {
            const result = await db.execute(sql`
              SELECT thread_id, title, body, created_at, updated_at, like_count, comment_count, view_count, is_pinned, is_locked, created_by, post_type, images, poll_options, poll_votes
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
              sql`SELECT "user_id", "full_name", "avatar_url" FROM users WHERE "user_id" = ${userId} LIMIT 1`
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
        const authorName = user ? (user.full_name || 'Anonymous') : 'Anonymous';
        const authorImage = user?.avatar_url || 'https://i.pravatar.cc/150?img=12';

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
              u.full_name,
              u.avatar_url
            FROM comments c
            LEFT JOIN users u ON c.sender_id = u."user_id"
            WHERE c.thread_id = ${thread.thread_id}
            ORDER BY c.timestamp ASC
            LIMIT 10
          `);

          if (commentsResult.rows) {
            commentsList = commentsResult.rows.map((comment: any) => {
              const commentAuthorName = comment.full_name || 'Anonymous';
              return {
                id: comment.comment_id,
                author: commentAuthorName,
                authorId: comment.sender_id,
                authorImage: comment.avatar_url || 'https://i.pravatar.cc/150?img=12',
                content: comment.content,
                timeAgo: getTimeAgo(comment.timestamp),
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
          author: authorName,
          authorId: thread.created_by,
          authorImage: authorImage,
          date: new Date(thread.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          timeAgo: getTimeAgo(thread.created_at),
          stars: thread.like_count || 0,
          comments: thread.comment_count || 0,
          userStarred: false, // We'll need to implement user likes tracking
          commentsList: commentsList,
          isPinned: thread.is_pinned,
          isLocked: thread.is_locked,
          viewCount: thread.view_count,
          // New fields for media and polls
          postType: thread.post_type || 'post',
          images: thread.images ? (typeof thread.images === 'string' ? JSON.parse(thread.images) : thread.images) : [],
          pollOptions: thread.poll_options ? (typeof thread.poll_options === 'string' ? JSON.parse(thread.poll_options) : thread.poll_options) : null,
          pollVotes: (() => {
            if (!thread.poll_votes || thread.post_type !== 'poll') return null;

            const votes = typeof thread.poll_votes === 'string' ? JSON.parse(thread.poll_votes) : thread.poll_votes;

            // If user is logged in, check their vote status
            if (currentUserId && votes.userVotes && votes.userVotes[currentUserId] !== undefined) {
              return {
                ...votes,
                userVote: votes.userVotes[currentUserId]
              };
            }

            return votes;
          })(),
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
    const { content, images, postType, pollOptions } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Auto-generate a concise title from the first 100 characters of content (for DB/storage only)
    const generatedTitle = content.slice(0, 100) + (content.length > 100 ? '…' : '');

    // Validate images array
    const validImages = Array.isArray(images) ? images.slice(0, 4) : []; // Max 4 images

    // Validate poll data
    const validPostType = postType === 'poll' ? 'poll' : 'post';
    const validPollOptions = validPostType === 'poll' && Array.isArray(pollOptions) ? pollOptions : null;
    const initialPollVotes = validPostType === 'poll' && validPollOptions ?
      {
        userVotes: {}, // Track which users voted for which option
        ...validPollOptions.reduce((acc: any, option: string, index: number) => {
          acc[index] = 0; // Initialize vote count for each option
          return acc;
        }, {})
      } : null;

    // Properly stringify JSON values for JSONB columns
    const imagesJson = validImages.length > 0 ? JSON.stringify(validImages) : null;
    const pollOptionsJson = validPollOptions ? JSON.stringify(validPollOptions) : null;
    const pollVotesJson = initialPollVotes ? JSON.stringify(initialPollVotes) : null;

    // Debug: Check all users to understand the data structure
    const allUsers: any = await db.execute(sql`SELECT "user_id", "clerk_id", "full_name", email FROM users LIMIT 5`);
    console.log('All users sample:', allUsers.rows);

    // Get the user from the database - use the correct column name
    let userResult: any = await db.execute(
      sql`SELECT * FROM users WHERE "clerk_id" = ${userId} LIMIT 1`
    );

    console.log('User query result:', userResult); // Debug log
    console.log('User ID from auth:', userId); // Debug log

    if (!userResult || !userResult.rows || userResult.rows.length === 0) {
      console.log('No user found with clerk_id:', userId);

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
        sql`SELECT * FROM users WHERE "clerk_id" = ${userId} LIMIT 1`
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
    const userIdField = user.user_id; // The existing database uses 'user_id' as integer
    if (!userIdField) {
      console.error('No user ID field found:', Object.keys(user));
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const newThreadResult = await db.execute(
      sql`
        INSERT INTO threads (title, body, created_by, post_type, images, poll_options, poll_votes)
        VALUES (${generatedTitle}, ${content}, ${userIdField}, ${validPostType}, ${imagesJson}, ${pollOptionsJson}, ${pollVotesJson})
        RETURNING *
      `
    );

    const newThread = newThreadResult.rows[0];

    // Format the response
    const formattedThread = {
      id: newThread.thread_id,
      title: newThread.title,
      content: newThread.body,
      author: user.full_name || 'Anonymous',
      authorId: newThread.created_by,
      authorImage: user.avatar_url || 'https://i.pravatar.cc/150?img=12',
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
      // New fields for media and polls
      postType: newThread.post_type || 'post',
      images: newThread.images ? (typeof newThread.images === 'string' ? JSON.parse(newThread.images) : newThread.images) : [],
      pollOptions: newThread.poll_options ? (typeof newThread.poll_options === 'string' ? JSON.parse(newThread.poll_options) : newThread.poll_options) : null,
      pollVotes: (() => {
        if (!newThread.poll_votes || newThread.post_type !== 'poll') return null;

        const votes = typeof newThread.poll_votes === 'string' ? JSON.parse(newThread.poll_votes) : newThread.poll_votes;

        // If user is logged in, check their vote status
        if (userIdField && votes.userVotes && votes.userVotes[userIdField] !== undefined) {
          return {
            ...votes,
            userVote: votes.userVotes[userIdField]
          };
        }

        return votes;
      })(),
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
function getTimeAgo(date: Date | string): string {
  const now = new Date();

  // Handle string input from database
  let targetDate: Date;
  if (typeof date === 'string') {
    // If the date string doesn't end with 'Z', treat it as local time
    if (!date.endsWith('Z') && !date.includes('+')) {
      targetDate = new Date(date + 'Z'); // Treat as UTC
    } else {
      targetDate = new Date(date);
    }
  } else {
    targetDate = date;
  }

  // Ensure we have valid dates
  if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
    return 'Just now';
  }

  // Simple direct comparison without timezone conversion
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

  // Handle future dates (in case of timezone issues)
  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) { // 7 days
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 2592000) { // 30 days
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  } else if (diffInSeconds < 31536000) { // 365 days
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
} 