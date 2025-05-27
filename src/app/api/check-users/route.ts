import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get current Clerk user
    const user = await currentUser();

    // Check all users in database
    const dbUsers = await db.execute(sql`
      SELECT id, "clerkId", name, email, "imageUrl"
      FROM users
      ORDER BY "createdAt"
    `);

    console.log('Database users:', dbUsers.rows);
    console.log('Current Clerk user:', user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses,
      imageUrl: user.imageUrl,
      username: user.username
    } : 'No user logged in');

    return NextResponse.json({
      success: true,
      databaseUsers: dbUsers.rows,
      currentClerkUser: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
        username: user.username
      } : null,
      userExistsInDb: user ? dbUsers.rows.some(dbUser => dbUser.clerkId === user.id) : false
    });

  } catch (error) {
    console.error('Check users error:', error);
    return NextResponse.json(
      { error: 'Failed to check users', details: error },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Get current Clerk user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
    }

    // Check if user exists in database
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${user.id} LIMIT 1
    `);

    if (existingUser.rows && existingUser.rows.length > 0) {
      return NextResponse.json({
        message: 'User already exists in database',
        userId: existingUser.rows[0].id
      });
    }

    // Create user in database
    const result = await db.execute(sql`
      INSERT INTO users ("clerkId", name, email, "firstName", "lastName", "imageUrl", username, role, "isActive", "createdAt", "updatedAt")
      VALUES (
        ${user.id},
        ${`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'},
        ${user.emailAddresses[0]?.emailAddress || ''},
        ${user.firstName || ''},
        ${user.lastName || ''},
        ${user.imageUrl || ''},
        ${user.username || ''},
        'user',
        true,
        NOW(),
        NOW()
      )
      RETURNING id, "clerkId", name, email
    `);

    const newUser = result.rows[0];
    console.log('User created manually:', newUser);

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error creating user manually:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 