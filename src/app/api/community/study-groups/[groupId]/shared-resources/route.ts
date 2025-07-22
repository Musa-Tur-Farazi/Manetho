import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sharedResourcesTable, studyGroupsTable, studyGroupMembersTable, usersTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

// GET: Fetch all shared resources for a group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    // Verify user is a member of the group
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .innerJoin(usersTable, eq(usersTable.clerkId, user.id))
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, usersTable.userId),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch shared resources
    const sharedResources = await db
      .select({
        resourceId: sharedResourcesTable.resourceId,
        fileName: sharedResourcesTable.fileName,
        fileUrl: sharedResourcesTable.fileUrl,
        fileType: sharedResourcesTable.fileType,
        fileSize: sharedResourcesTable.fileSize,
        description: sharedResourcesTable.description,
        uploadedAt: sharedResourcesTable.uploadedAt,
        uploaderName: usersTable.fullName,
        uploaderAvatar: usersTable.avatarUrl,
      })
      .from(sharedResourcesTable)
      .innerJoin(usersTable, eq(usersTable.userId, sharedResourcesTable.uploadedBy))
      .where(
        and(
          eq(sharedResourcesTable.groupId, groupId),
          eq(sharedResourcesTable.isActive, true)
        )
      )
      .orderBy(desc(sharedResourcesTable.uploadedAt));

    return NextResponse.json({ sharedResources });
  } catch (error) {
    console.error('Error fetching shared resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Upload a new shared resource
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { fileName, fileUrl, fileType, fileSize, description } = await request.json();

    if (!fileName || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing required file information' }, { status: 400 });
    }

    // Get user's internal ID
    const userRecord = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].userId;

    // Verify user is a member of the group
    const membership = await db
      .select()
      .from(studyGroupMembersTable)
      .where(
        and(
          eq(studyGroupMembersTable.groupId, groupId),
          eq(studyGroupMembersTable.userId, userId),
          eq(studyGroupMembersTable.isActive, true)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create shared resource
    const [newResource] = await db
      .insert(sharedResourcesTable)
      .values({
        groupId,
        uploadedBy: userId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        description: description || null,
      })
      .returning();

    return NextResponse.json({ sharedResource: newResource });
  } catch (error) {
    console.error('Error uploading shared resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a shared resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;
    const { resourceId } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Get user's internal ID
    const userRecord = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, user.id))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].userId;

    // Verify user is an organizer or the uploader of the resource
    const [resourceInfo] = await db
      .select({
        uploadedBy: sharedResourcesTable.uploadedBy,
        userRole: studyGroupMembersTable.role,
      })
      .from(sharedResourcesTable)
      .innerJoin(studyGroupMembersTable,
        and(
          eq(studyGroupMembersTable.groupId, sharedResourcesTable.groupId),
          eq(studyGroupMembersTable.userId, userId)
        )
      )
      .where(
        and(
          eq(sharedResourcesTable.resourceId, resourceId),
          eq(sharedResourcesTable.groupId, groupId),
          eq(sharedResourcesTable.isActive, true)
        )
      )
      .limit(1);

    if (!resourceInfo) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if user can delete (organizer or uploader)
    if (resourceInfo.userRole !== 'organizer' && resourceInfo.uploadedBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete shared resource (soft delete)
    await db
      .update(sharedResourcesTable)
      .set({ isActive: false })
      .where(eq(sharedResourcesTable.resourceId, resourceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shared resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 