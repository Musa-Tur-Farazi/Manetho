import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function syncUserToDatabase(retries = 3): Promise<{ success: boolean; message: string; userId?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get the current user from Clerk
      const { userId } = await auth();

      if (!userId) {
        return { success: false, message: 'No user found to sync' };
      }

      // Check if user already exists in database by clerkId
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

        return {
          success: true,
          message: 'User updated successfully',
          userId: updatedUser.user_id as string
        };
      }

      // User doesn't exist, create new user with minimal required fields
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

      return {
        success: true,
        message: 'User created successfully',
        userId: newUser.user_id as string
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
    const existingUser = await db.execute(sql`
      SELECT "user_id" FROM users WHERE "clerk_id" = ${clerkId} LIMIT 1
    `);

    if (existingUser.rows && existingUser.rows.length > 0) {
      return { exists: true, userId: existingUser.rows[0].user_id as string };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return { exists: false };
  }
} 