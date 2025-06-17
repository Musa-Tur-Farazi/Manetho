import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { 
  usersTable, 
  userProfilesTable
} from '@/db/schema';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    console.log('Fetching profile for user:', userId);

    const { userId: currentUserId } = await auth();
    console.log('Current user ID:', currentUserId);

    // Check if userId is a Clerk ID (starts with 'user_') or numeric ID
    const isClerkId = userId.startsWith('user_');
    console.log('Is Clerk ID:', isClerkId);

    let user;
    let userProfile;

    try {
      if (isClerkId) {
        // Query by Clerk ID using Drizzle ORM first
        console.log('Querying by Clerk ID using Drizzle...');
        user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.clerkId, userId))
          .limit(1);
          
        console.log('Drizzle query result:', user.length);
        
        // If Drizzle query fails or returns empty, try raw SQL
        if (user.length === 0) {
          console.log('Trying raw SQL query...');
          const rawResult = await db.execute(sql`
            SELECT * FROM users WHERE "clerkId" = ${userId} LIMIT 1
          `);
          console.log('Raw SQL result:', rawResult.rows?.length || 0);
          
          if (rawResult.rows && rawResult.rows.length > 0) {
            const rawUser = rawResult.rows[0];
            // Map raw SQL result to expected format
            user = [{
              id: rawUser.id,
              userId: rawUser.user_id || rawUser.userId,
              clerkId: rawUser.clerkId || userId,
              name: rawUser.name || 'User',
              firstName: rawUser.firstName,
              lastName: rawUser.lastName,
              email: rawUser.email || '',
              imageUrl: rawUser.imageUrl,
              username: rawUser.username,
              role: rawUser.role || 'student',
              age: rawUser.age,
              isActive: rawUser.isActive !== false,
              bio: rawUser.bio,
              preferences: rawUser.preferences,
              createdAt: rawUser.createdAt,
              updatedAt: rawUser.updatedAt
            }];
          }
        }
      } else {
        // Try to query by numeric ID if it's a number (this shouldn't happen with UUID primary keys)
        const numericId = parseInt(userId);
        if (!isNaN(numericId)) {
          // Skip numeric ID query since our primary key is UUID
          user = [];
        } else {
          // If not a number, try as clerkId anyway
          user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.clerkId, userId))
            .limit(1);
        }
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: dbError instanceof Error ? dbError.message : 'Database query failed' },
        { status: 500 }
      );
    }

    if (!user || user.length === 0) {
      console.error('User not found:', userId);
      
      // If it's the current user and they're not in the database, suggest syncing
      if (currentUserId === userId) {
        return NextResponse.json(
          { 
            error: 'User not found in database', 
            details: 'Please sync your account first',
            needsSync: true,
            userId: userId
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'User not found', details: `No user found with ID: ${userId}` },
        { status: 404 }
      );
    }

    const foundUser = user[0];
    console.log('Found user:', foundUser);

    // Get user profile data using the correct user ID (UUID)
    try {
      const userIdToUse = (foundUser as any).userId || (foundUser as any).user_id;
      userProfile = await db
        .select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, userIdToUse))
        .limit(1);
    } catch (profileError) {
      console.error('Profile query error:', profileError);
      userProfile = []; // Continue without profile data
    }

    const profile = {
      id: foundUser.userId,
      clerkId: foundUser.clerkId,
      name: foundUser.fullName || 'User',
      firstName: null, // No longer stored separately
      lastName: null, // No longer stored separately
      email: foundUser.email,
      imageUrl: foundUser.avatarUrl,
      username: null, // No longer stored
      role: foundUser.role,
      age: null, // No longer stored
      isActive: !foundUser.isLocked,
      bio: userProfile[0]?.bio,
      preferences: null, // No longer stored in users table
      createdAt: foundUser.joinedAt,
      updatedAt: foundUser.lastActiveAt,
      
      // Profile specific data
      profileData: userProfile.length > 0 ? {
        profileId: userProfile[0].profileId,
        grade: userProfile[0].grade,
        school: userProfile[0].school,
        dateOfBirth: userProfile[0].dateOfBirth,
        country: userProfile[0].country,
        timezone: userProfile[0].timezone,
        preferredLanguage: userProfile[0].preferredLanguage?.toUpperCase() || 'EN',
        studyGoals: userProfile[0].studyGoals,
        profileCreatedAt: userProfile[0].createdAt,
        profileUpdatedAt: userProfile[0].updatedAt
      } : null,

      // Basic stats (simplified to avoid type conflicts)
      isFollowing: false,
      stats: {
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        commentsCount: 0,
        totalStudyTime: 0,
        studySessionsCount: 0
      },

      // Empty achievements for now
      achievements: [],

      // Permissions
      canEdit: currentUserId === foundUser.clerkId
    };

    console.log('Returning profile:', profile);
    return NextResponse.json({ profile, success: true });
  } catch (error) {
    console.error('Error in GET /api/community/users/[userId]:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      },
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