import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = request.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    const payload = await request.text();
    const body = JSON.parse(payload);

    // Get the Webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_KEY;

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_KEY is not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the webhook
    const { id } = (evt as any).data;
    const eventType = (evt as any).type;

    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);

    if (eventType === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = (evt as any).data;

      try {
        // Check if user already exists by clerkId
        const existingUserByClerkId = await db.execute(sql`
          SELECT "user_id" FROM users WHERE "clerk_id" = ${clerkId} LIMIT 1
        `);

        if (existingUserByClerkId.rows && existingUserByClerkId.rows.length > 0) {
          console.log('User already exists in database:', clerkId);
          return NextResponse.json({ message: 'User already exists' });
        }

        // Check if user exists with same email but different clerkId
        const userEmail = email_addresses[0]?.email_address;
        if (userEmail) {
          const existingUserByEmail = await db.execute(sql`
            SELECT "user_id", "clerk_id" FROM users WHERE email = ${userEmail} LIMIT 1
          `);

          if (existingUserByEmail.rows && existingUserByEmail.rows.length > 0) {
            // Update the existing user with the new clerkId
            const result = await db.execute(sql`
              UPDATE users SET 
                "clerk_id" = ${clerkId},
                "full_name" = ${`${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous'},
                "avatar_url" = ${image_url || null},
                "last_active_at" = NOW()
              WHERE email = ${userEmail}
              RETURNING "user_id", "clerk_id", "full_name", email
            `);

            const updatedUser = result.rows[0];
            console.log('User updated with new clerkId via webhook:', updatedUser);

            return NextResponse.json({
              message: 'User updated with new clerkId',
              user: updatedUser
            });
          }
        }

        // Create new user in database
        const result = await db.execute(sql`
          INSERT INTO users ("clerk_id", "full_name", email, role, "is_locked", "joined_at", "last_active_at", "avatar_url")
          VALUES (
            ${clerkId},
            ${`${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous'},
            ${userEmail || ''},
            'student',
            false,
            NOW(),
            NOW(),
            ${image_url || null}
          )
          RETURNING "user_id", "clerk_id", "full_name", email
        `);

        const newUser = result.rows[0];
        console.log('User created via webhook:', newUser);

        return NextResponse.json({
          message: 'User created successfully',
          user: newUser
        });

      } catch (error) {
        console.error('Error creating user via webhook:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    if (eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = (evt as any).data;

      try {
        // Update user in database
        await db.execute(sql`
          UPDATE users 
          SET 
            "full_name" = ${`${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous'},
            email = ${email_addresses[0]?.email_address || ''},
            "avatar_url" = ${image_url || null},
            "last_active_at" = NOW()
          WHERE "clerk_id" = ${clerkId}
        `);

        console.log('User updated via webhook:', clerkId);
        return NextResponse.json({ message: 'User updated successfully' });

      } catch (error) {
        console.error('Error updating user via webhook:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
    }

    if (eventType === 'user.deleted') {
      const { id: clerkId } = (evt as any).data;

      try {
        // Delete user from database
        await db.execute(sql`
          DELETE FROM users WHERE "clerk_id" = ${clerkId}
        `);

        console.log('User deleted via webhook:', clerkId);
        return NextResponse.json({ message: 'User deleted successfully' });

      } catch (error) {
        console.error('Error deleting user via webhook:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Webhook received' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 