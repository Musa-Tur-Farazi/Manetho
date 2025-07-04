import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  usersTable,
  userProfilesTable,
  userFollowsTable,
  threadsTable,
  commentsTable
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Check if userId is in UUID format or Clerk ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(userId);

    let targetUserId = userId;

    // If not a UUID, assume it's a Clerk ID and convert to internal user ID
    if (!isUUID) {
      const userByClerkId = await db
        .select({ userId: usersTable.userId })
        .from(usersTable)
        .where(eq(usersTable.clerkId, userId))
        .limit(1);

      if (!userByClerkId.length) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      targetUserId = userByClerkId[0].userId;
    }

    // Get user profile data
    const userProfile = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
        lastActiveAt: usersTable.lastActiveAt,
        bio: userProfilesTable.bio,
        grade: userProfilesTable.grade,
        school: userProfilesTable.school,
        country: userProfilesTable.country,
      })
      .from(usersTable)
      .leftJoin(userProfilesTable, eq(usersTable.userId, userProfilesTable.userId))
      .where(eq(usersTable.userId, targetUserId))
      .limit(1);

    if (!userProfile.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current user's ID for follow status
    const currentDbUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, currentUserId))
      .limit(1);

    let isFollowing = false;
    if (currentDbUser.length > 0) {
      const followStatus = await db
        .select()
        .from(userFollowsTable)
        .where(
          and(
            eq(userFollowsTable.followerId, currentDbUser[0].userId),
            eq(userFollowsTable.followingId, targetUserId)
          )
        )
        .limit(1);

      isFollowing = followStatus.length > 0;
    }

    // Get follower/following counts
    const [followersResult, followingResult] = await Promise.all([
      db
        .select({ count: sql`count(*)` })
        .from(userFollowsTable)
        .where(eq(userFollowsTable.followingId, targetUserId)),
      db
        .select({ count: sql`count(*)` })
        .from(userFollowsTable)
        .where(eq(userFollowsTable.followerId, targetUserId)),
    ]);

    const profileData = {
      ...userProfile[0],
      isFollowing,
      followersCount: parseInt(followersResult[0].count as string) || 0,
      followingCount: parseInt(followingResult[0].count as string) || 0,
      // Mock stats for now - replace with real data later
      totalStudyHours: Math.floor(Math.random() * 200) + 50,
      groupsJoined: Math.floor(Math.random() * 15) + 1,
      flashcardDecks: Math.floor(Math.random() * 25) + 5,
      mindMapsSaved: Math.floor(Math.random() * 20) + 3,
      problemsSolved: Math.floor(Math.random() * 150) + 25,
    };

    return NextResponse.json({ profile: profileData });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 