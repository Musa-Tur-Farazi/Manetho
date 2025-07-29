import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  usersTable,
  userProfilesTable,
  userFollowsTable,
  threadsTable,
  commentsTable,
  flashcardDecksTable,
  mindMapsTable,
  studyGroupMembersTable,
  practiceTestSubmissionsTable
} from '@/db/schema';
import { eq, and, sql, count } from 'drizzle-orm';
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

    // Get real user statistics
    const [
      flashcardDecksResult,
      mindMapsResult,
      joinedGroupsResult,
      problemsSolvedResult
    ] = await Promise.all([
      // Flashcard decks count
      db.select({
        deckCount: count(),
      })
        .from(flashcardDecksTable)
        .where(eq(flashcardDecksTable.userId, targetUserId)),

      // Mind maps count
      db.select({
        mindMapCount: count(),
      })
        .from(mindMapsTable)
        .where(eq(mindMapsTable.userId, targetUserId)),

      // Joined study groups count
      db.select({
        joinedCount: count(),
      })
        .from(studyGroupMembersTable)
        .where(eq(studyGroupMembersTable.userId, targetUserId)),

      // Problems solved (quiz submissions count)
      db.select({
        totalSubmissions: count(),
      })
        .from(practiceTestSubmissionsTable)
        .where(eq(practiceTestSubmissionsTable.userId, targetUserId)),
    ]);

    const profileData = {
      ...userProfile[0],
      isFollowing,
      followersCount: Number(followersResult[0].count) || 0,
      followingCount: Number(followingResult[0].count) || 0,
      // Real stats from database
      totalStudyHours: 0, // Removed as per previous requirement
      groupsJoined: Number(joinedGroupsResult[0]?.joinedCount) || 0,
      flashcardDecks: Number(flashcardDecksResult[0]?.deckCount) || 0,
      mindMapsSaved: Number(mindMapsResult[0]?.mindMapCount) || 0,
      problemsSolved: Number(problemsSolvedResult[0]?.totalSubmissions) || 0,
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