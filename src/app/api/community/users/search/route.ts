import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { usersTable, userProfilesTable } from '@/db/schema';
import { sql, ilike, or, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    // Search users by full name (case insensitive)
    const searchPattern = `%${query}%`;

    const users = await db
      .select({
        userId: usersTable.userId,
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl,
        lastActiveAt: usersTable.lastActiveAt,
        bio: userProfilesTable.bio,
        grade: userProfilesTable.grade,
        school: userProfilesTable.school,
        country: userProfilesTable.country,
      })
      .from(usersTable)
      .leftJoin(userProfilesTable, eq(usersTable.userId, userProfilesTable.userId))
      .where(
        or(
          ilike(usersTable.fullName, searchPattern),
          ilike(usersTable.email, searchPattern)
        )
      )
      .limit(limit);

    // Format users for display
    const formattedUsers = users.map(user => ({
      userId: user.userId,
      fullName: user.fullName || 'Anonymous User',
      avatarUrl: user.avatarUrl || 'https://i.pravatar.cc/150?img=12',
      bio: user.bio || '',
      grade: user.grade || '',
      school: user.school || '',
      country: user.country || '',
      isOnline: user.lastActiveAt ?
        (new Date().getTime() - new Date(user.lastActiveAt).getTime()) < 30 * 60 * 1000 : false,
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}

