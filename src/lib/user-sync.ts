import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function syncUserToDatabase(retries = 3): Promise<{ success: boolean; message: string; userId?: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get the current user from Clerk
      const user = await currentUser();

      if (!user) {
        return { success: false, message: 'No user found to sync' };
      }

      // Check if user already exists in database by clerkId
      const existingUserByClerkId = await db.execute(sql`
        SELECT id FROM users WHERE "clerkId" = ${user.id} LIMIT 1
      `);

      if (existingUserByClerkId.rows && existingUserByClerkId.rows.length > 0) {
        // User exists with this clerkId, update their info
        const result = await db.execute(sql`
          UPDATE users SET 
            name = ${user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'},
            email = ${user.emailAddresses[0]?.emailAddress || ''},
            "firstName" = ${user.firstName || ''},
            "lastName" = ${user.lastName || ''},
            "imageUrl" = ${user.imageUrl || ''},
            "updatedAt" = NOW()
          WHERE "clerkId" = ${user.id}
          RETURNING id, "clerkId", name, email
        `);

        return {
          success: true,
          message: 'User updated in database',
          userId: existingUserByClerkId.rows[0].id as number
        };
      }

      // Check if user exists with same email but different clerkId
      const userEmail = user.emailAddresses[0]?.emailAddress;
      if (userEmail) {
        const existingUserByEmail = await db.execute(sql`
          SELECT id, "clerkId" FROM users WHERE email = ${userEmail} LIMIT 1
        `);

        if (existingUserByEmail.rows && existingUserByEmail.rows.length > 0) {
          // Update the existing user with the new clerkId
          const result = await db.execute(sql`
            UPDATE users SET 
              "clerkId" = ${user.id},
              name = ${user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'},
              "firstName" = ${user.firstName || ''},
              "lastName" = ${user.lastName || ''},
              "imageUrl" = ${user.imageUrl || ''},
              "updatedAt" = NOW()
            WHERE email = ${userEmail}
            RETURNING id, "clerkId", name, email
          `);

          return {
            success: true,
            message: 'User updated with new clerkId',
            userId: existingUserByEmail.rows[0].id as number
          };
        }
      }

      // Create new user in database
      const result = await db.execute(sql`
        INSERT INTO users ("clerkId", name, email, "firstName", "lastName", "imageUrl", username, role, "isActive", "createdAt", "updatedAt")
        VALUES (
          ${user.id},
          ${user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous'},
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
      console.log('User synced to database:', newUser);

      return {
        success: true,
        message: 'User created successfully',
        userId: newUser.id as number
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

export async function ensureUserExists(clerkId: string): Promise<{ exists: boolean; userId?: number }> {
  try {
    const existingUser = await db.execute(sql`
      SELECT id FROM users WHERE "clerkId" = ${clerkId} LIMIT 1
    `);

    if (existingUser.rows && existingUser.rows.length > 0) {
      return { exists: true, userId: existingUser.rows[0].id as number };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return { exists: false };
  }
} 