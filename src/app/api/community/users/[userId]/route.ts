import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, sql } from 'drizzle-orm';
import {
  usersTable,
  userProfilesTable,
  userFollowsTable,
  threadsTable,
  commentsTable
} from '@/db/schema';

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

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Always query by clerkId since our database uses user_id (UUID) as primary key
    let user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const foundUser = user[0];
    
    // Check if current user can edit this profile
    if (currentUserId !== foundUser.clerkId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'You can only edit your own profile' },
        { status: 403 }
      );
    }

    // Update user table
    const userUpdateData: any = {};
    if (body.name) userUpdateData.fullName = body.name;
    if (body.email) userUpdateData.email = body.email;
    if (body.imageUrl) userUpdateData.avatarUrl = body.imageUrl;
    
    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.lastActiveAt = new Date();
      await db
        .update(usersTable)
        .set(userUpdateData)
        .where(eq(usersTable.userId, foundUser.userId));
    }

    // Update or create profile data
    const profileUpdateData: any = {};
    if (body.bio !== undefined) profileUpdateData.bio = body.bio;
    if (body.grade) profileUpdateData.grade = body.grade;
    if (body.school) profileUpdateData.school = body.school;
    if (body.dateOfBirth) profileUpdateData.dateOfBirth = body.dateOfBirth;
    if (body.country) profileUpdateData.country = body.country;
    if (body.timezone) profileUpdateData.timezone = body.timezone;
    if (body.preferredLanguage) profileUpdateData.preferredLanguage = body.preferredLanguage;
    if (body.studyGoals !== undefined) profileUpdateData.studyGoals = body.studyGoals;

    if (Object.keys(profileUpdateData).length > 0) {
      profileUpdateData.updatedAt = new Date();
      
      // Check if user already has a profile
      const existingProfile = await db
        .select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, foundUser.userId))
        .limit(1);

      if (existingProfile.length > 0) {
        // Update existing profile
        await db
          .update(userProfilesTable)
          .set(profileUpdateData)
          .where(eq(userProfilesTable.userId, foundUser.userId));
      } else {
        // Create new profile
        await db
          .insert(userProfilesTable)
          .values({
            userId: foundUser.userId,
            ...profileUpdateData,
            createdAt: new Date()
          });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Failed to update profile',
        success: false
      },
      { status: 500 }
    );
  }
}