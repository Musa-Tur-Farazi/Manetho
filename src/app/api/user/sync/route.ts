import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const userData = await req.json();
    const { clerkId, firstName, lastName, email, imageUrl, username, name } = userData;

    if (!clerkId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      await db.update(users)
        .set({
          firstName,
          lastName,
          email,
          imageUrl,
          username,
          name,
          updatedAt: new Date()
        })
        .where(eq(users.clerkId, clerkId));

      return NextResponse.json({ message: 'User updated' });
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId,
        firstName,
        lastName,
        email,
        imageUrl,
        username,
        name,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return NextResponse.json({ message: 'User created' });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
} 