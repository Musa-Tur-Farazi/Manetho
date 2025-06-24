import { db } from '@/db';
<<<<<<< HEAD
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

=======
import { usersTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function syncUser(clerkUser: any) {
  try {
    console.log('Syncing user:', clerkUser);
    
    // Check if user exists using correct column name
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('User already exists, updating...');
      // Update existing user with correct column names
      const updatedUser = await db
        .update(usersTable)
        .set({
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          avatarUrl: clerkUser.imageUrl,
          lastActiveAt: new Date(),
        })
        .where(eq(usersTable.clerkId, clerkUser.id))
        .returning({
          userId: usersTable.userId,
          clerkId: usersTable.clerkId,
          fullName: usersTable.fullName,
          email: usersTable.email,
        });

      return updatedUser[0];
    } else {
      console.log('Creating new user...');
      // Create new user with correct column names
      const newUser = await db
        .insert(usersTable)
        .values({
          clerkId: clerkUser.id,
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          avatarUrl: clerkUser.imageUrl,
          role: 'student',
          joinedAt: new Date(),
          isLocked: false,
          lastActiveAt: new Date(),
        })
        .returning({
          userId: usersTable.userId,
          clerkId: usersTable.clerkId,
          fullName: usersTable.fullName,
          email: usersTable.email,
        });

      return newUser[0];
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}

>>>>>>> bb7e448 (Initial commit with CI/CD setup)
export async function syncUserToDatabase(retries = 3): Promise<{ success: boolean; message: string; userId?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get the current user from Clerk
      const { userId } = await auth();

      if (!userId) {
        return { success: false, message: 'No user found to sync' };
      }

      // Check if user already exists in database by clerkId
<<<<<<< HEAD
      const existingUserByClerkId = await db.execute(sql`
        SELECT "user_id" FROM users WHERE "clerk_id" = ${userId} LIMIT 1
      `);

      if (existingUserByClerkId.rows && existingUserByClerkId.rows.length > 0) {
        // User exists with this clerkId, update their info
        const result = await db.execute(sql`
          UPDATE users SET 
            "last_active_at" = NOW()
          WHERE "clerk_id" = ${userId}
          RETURNING "user_id", "clerk_id", "full_name", email
        `);

        const updatedUser = result.rows[0];
        console.log('User updated in database:', updatedUser);
=======
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerkId, userId))
        .limit(1);

      if (existingUser.length > 0) {
        // User exists with this clerkId, update their info
        const updatedUser = await db
          .update(usersTable)
          .set({
            lastActiveAt: new Date(),
          })
          .where(eq(usersTable.clerkId, userId))
          .returning({
            userId: usersTable.userId,
            clerkId: usersTable.clerkId,
            fullName: usersTable.fullName,
            email: usersTable.email,
          });

        console.log('User updated in database:', updatedUser[0]);
>>>>>>> bb7e448 (Initial commit with CI/CD setup)

        return {
          success: true,
          message: 'User updated successfully',
<<<<<<< HEAD
          userId: updatedUser.user_id as string
=======
          userId: updatedUser[0].userId
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
        };
      }

      // User doesn't exist, create new user with minimal required fields
<<<<<<< HEAD
      const result = await db.execute(sql`
        INSERT INTO users ("clerk_id", "full_name", email, role, "is_locked", "joined_at", "last_active_at")
        VALUES (
          ${userId},
          'User',
          '',
          'student',
          false,
          NOW(),
          NOW()
        )
        RETURNING "user_id", "clerk_id", "full_name", email
      `);

      const newUser = result.rows[0];
      console.log('User synced to database:', newUser);
=======
      const newUser = await db
        .insert(usersTable)
        .values({
          clerkId: userId,
          fullName: 'User', // Default name, should be updated by Clerk sync
          email: '',
          role: 'student',
          joinedAt: new Date(),
          isLocked: false,
          lastActiveAt: new Date(),
        })
        .returning({
          userId: usersTable.userId,
          clerkId: usersTable.clerkId,
          fullName: usersTable.fullName,
          email: usersTable.email,
        });

      console.log('User synced to database:', newUser[0]);
>>>>>>> bb7e448 (Initial commit with CI/CD setup)

      return {
        success: true,
        message: 'User created successfully',
<<<<<<< HEAD
        userId: newUser.user_id as string
=======
        userId: newUser[0].userId
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
      };

    } catch (error) {
      console.error(`User sync attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        return {
          success: false,
          message: `Failed to sync user after ${retries} attempts: ${error}`
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return { success: false, message: 'Unexpected error during user sync' };
}

export async function ensureUserExists(clerkId: string): Promise<{ exists: boolean; userId?: string }> {
  try {
<<<<<<< HEAD
    const existingUser = await db.execute(sql`
      SELECT "user_id" FROM users WHERE "clerk_id" = ${clerkId} LIMIT 1
    `);

    if (existingUser.rows && existingUser.rows.length > 0) {
      return { exists: true, userId: existingUser.rows[0].user_id as string };
=======
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      return { exists: true, userId: existingUser[0].userId };
>>>>>>> bb7e448 (Initial commit with CI/CD setup)
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return { exists: false };
  }
} 