import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: { emailAddress: string }[];
  imageUrl?: string | null;
}

export async function syncUser(clerkUser: ClerkUser) {
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
          avatarUrl: clerkUser.imageUrl || undefined,
          lastActiveAt: new Date(),
        })
        .where(eq(usersTable.clerkId, clerkUser.id))
        .returning({
          userId: usersTable.userId,
          clerkId: usersTable.clerkId,
          fullName: usersTable.fullName,
          email: usersTable.email,
        });

      return {
        success: true,
        message: 'User updated successfully',
        userId: updatedUser[0].userId,
        fullName: updatedUser[0].fullName,
        email: updatedUser[0].email
      };
    } else {
      console.log('Creating new user...');
      // Create new user with correct column names
      const newUser = await db
        .insert(usersTable)
        .values({
          clerkId: clerkUser.id,
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          avatarUrl: clerkUser.imageUrl || undefined,
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

      return {
        success: true,
        message: 'User created successfully',
        userId: newUser[0].userId,
        fullName: newUser[0].fullName,
        email: newUser[0].email
      };
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return { success: false, message: 'Failed to sync user' };
  }
}

export async function syncUserToDatabase(retries = 3): Promise<{ success: boolean; message: string; userId?: string; fullName?: string; email?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get the current user from Clerk
      const { userId } = await auth();

      if (!userId) {
        return { success: false, message: 'No user found to sync' };
      }

      // Check if user already exists in database by clerkId
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

        return {
          success: true,
          message: 'User updated successfully',
          userId: updatedUser[0].userId,
          fullName: updatedUser[0].fullName,
          email: updatedUser[0].email
        };
      }

      // User doesn't exist, create new user with minimal required fields
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

      return {
        success: true,
        message: 'User created successfully',
        userId: newUser[0].userId,
        fullName: newUser[0].fullName,
        email: newUser[0].email
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
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      return { exists: true, userId: existingUser[0].userId };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return { exists: false };
  }
}