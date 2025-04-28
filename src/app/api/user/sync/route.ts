import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  console.log("User sync API endpoint called");

  try {
    const userData = await req.json();
    console.log("Received user data:", userData);

    const { clerkId, firstName, lastName, email, imageUrl, username, name } = userData;

    if (!clerkId || !email || !name) {
      console.error("Missing required fields:", { clerkId, email, name });
      return NextResponse.json(
        { error: 'Missing required fields', details: { clerkId: !!clerkId, email: !!email, name: !!name } },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log("Checking if user exists in database with clerkId:", clerkId);
    try {
      const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
      console.log("Database query result:", existingUser.length > 0 ? "User found" : "User not found");

      if (existingUser.length > 0) {
        // Update existing user
        console.log("Updating existing user");
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

        return NextResponse.json({ message: 'User updated', userId: existingUser[0].id });
      } else {
        // Create new user
        console.log("Creating new user");
        const result = await db.insert(users).values({
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
        }).returning({ id: users.id });

        console.log("User created with id:", result[0]?.id);
        return NextResponse.json({ message: 'User created', userId: result[0]?.id });
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: (dbError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing or processing request:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: (error as Error).message },
      { status: 500 }
    );
  }
} 