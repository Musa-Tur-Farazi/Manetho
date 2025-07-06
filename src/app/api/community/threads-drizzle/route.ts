import { NextRequest, NextResponse } from 'next/server';
import {
  getThreads,
  getThreadCount,
  createThread,
  findUserByClerkId
} from '@/lib/database-helpers';
import { auth } from '@clerk/nextjs/server';

// GET /api/community/threads-drizzle - Fetch threads using Drizzle ORM
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') || 'recent') as 'recent' | 'popular' | 'mostComments';
    const search = searchParams.get('search') || undefined;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Fetch threads using Drizzle helper
    const [threads, totalCount] = await Promise.all([
      getThreads({ limit, offset, sortBy, search }),
      getThreadCount(search)
    ]);

    console.log(`✅ Fetched ${threads.length} threads using Drizzle ORM`);

    return NextResponse.json({
      success: true,
      data: {
        threads,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });

  } catch (error) {
    console.error('❌ Drizzle API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch threads',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/community/threads-drizzle - Create new thread using Drizzle ORM
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user using Drizzle helper
    const user = await findUserByClerkId(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { title, body, subjectId, topicId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { success: false, error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Create thread using Drizzle helper
    const newThread = await createThread({
      title,
      body,
      createdBy: user.userId,
      subjectId,
      topicId,
    });

    console.log(`✅ Created new thread using Drizzle ORM: ${newThread.threadId}`);

    return NextResponse.json({
      success: true,
      data: newThread,
    });

  } catch (error) {
    console.error('❌ Drizzle Create Thread Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create thread',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 