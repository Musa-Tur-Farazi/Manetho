import { Webhook } from 'svix';
import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  console.log("Webhook request received");

  // Get the headers
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.log("Error: Missing svix headers");
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body and create webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.log("Error: Missing webhook secret");
    return NextResponse.json(
      { error: 'Missing webhook secret' },
      { status: 500 }
    );
  }

  // Get the body
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Error parsing JSON body:", err);
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const body = JSON.stringify(payload);
  console.log("Webhook payload received:", payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verification successful");
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Processing webhook event type: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, email_addresses, image_url, username } = evt.data;
    console.log(`User data: ${id}, ${first_name}, ${last_name}, ${email_addresses?.[0]?.email_address}`);

    try {
      // Check if user exists
      const existingUsers = await db.select().from(users).where(eq(users.clerkId, id as string)).limit(1);

      if (existingUsers.length > 0) {
        console.log(`Updating existing user with clerk ID: ${id}`);
        // Update existing user
        await db.update(users)
          .set({
            firstName: first_name as string,
            lastName: last_name as string,
            email: email_addresses[0]?.email_address as string,
            imageUrl: image_url as string,
            username: username as string,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            updatedAt: new Date()
          })
          .where(eq(users.clerkId, id as string));

        console.log("User updated successfully");
      } else {
        console.log(`Creating new user with clerk ID: ${id}`);
        // Create new user
        await db.insert(users).values({
          clerkId: id as string,
          firstName: first_name as string,
          lastName: last_name as string,
          email: email_addresses[0]?.email_address as string,
          imageUrl: image_url as string,
          username: username as string,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log("User created successfully");
      }

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Error syncing user with database:", err);
      return NextResponse.json(
        { error: 'Error syncing user with database' },
        { status: 500 }
      );
    }
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log(`Processing user deletion for clerk ID: ${id}`);

    if (!id) {
      console.error("Missing clerk ID for user deletion");
      return NextResponse.json(
        { error: 'Missing clerk ID for user deletion' },
        { status: 400 }
      );
    }

    try {
      await db.delete(users).where(eq(users.clerkId, id as string));
      console.log("User deleted successfully");
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Error deleting user from database:", err);
      return NextResponse.json(
        { error: 'Error deleting user from database' },
        { status: 500 }
      );
    }
  }

  console.log("Webhook processed successfully");
  return NextResponse.json({ success: true });
} 