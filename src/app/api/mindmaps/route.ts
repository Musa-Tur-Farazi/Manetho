import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { mindMapsTable, mindMapNodesTable, mindMapConnectionsTable, usersTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET - List user's mind maps
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get user's mind maps
    const mindMaps = await db
      .select({
        mindmapId: mindMapsTable.mindmapId,
        title: mindMapsTable.title,
        description: mindMapsTable.description,
        layout: mindMapsTable.layout,
        theme: mindMapsTable.theme,
        contentSource: mindMapsTable.contentSource,
        nodeCount: mindMapsTable.nodeCount,
        connectionCount: mindMapsTable.connectionCount,
        lastEditedAt: mindMapsTable.lastEditedAt,
        createdAt: mindMapsTable.createdAt,
        updatedAt: mindMapsTable.updatedAt,
      })
      .from(mindMapsTable)
      .where(eq(mindMapsTable.userId, user.userId))
      .orderBy(desc(mindMapsTable.lastEditedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      mindMaps,
      pagination: {
        page,
        limit,
        total: mindMaps.length,
        hasMore: mindMaps.length === limit
      }
    });

  } catch (error) {
    console.error("Error fetching mind maps:", error);
    return NextResponse.json(
      { error: "Failed to fetch mind maps" },
      { status: 500 }
    );
  }
}

// POST - Create a new mind map
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description = "",
      layout = "tree",
      theme = "default",
      backgroundColor = "#ffffff",
      nodes = [],
      connections = []
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create mind map
    const [savedMindMap] = await db
      .insert(mindMapsTable)
      .values({
        userId: user.userId,
        title: title.trim(),
        description: description.trim(),
        layout,
        theme,
        backgroundColor,
        contentSource: 'user_created',
        nodeCount: nodes.length,
        connectionCount: connections.length,
      })
      .returning();

    // Save nodes if provided
    let savedNodes = [];
    if (nodes.length > 0) {
      savedNodes = await db
        .insert(mindMapNodesTable)
        .values(
          nodes.map((node: any, index: number) => ({
            mindmapId: savedMindMap.mindmapId,
            nodeId: node.id || `node_${index}`,
            parentNodeId: node.parentId || null,
            text: node.text.trim(),
            level: node.level || 0,
            positionX: node.positionX || '0',
            positionY: node.positionY || '0',
            color: node.color || '#3b82f6',
            backgroundColor: node.backgroundColor || '#ffffff',
            icon: node.icon || null,
            notes: node.notes || null,
            isRoot: node.level === 0,
            orderIndex: index,
          }))
        )
        .returning();
    }

    // Save connections if provided
    if (connections.length > 0) {
      await db
        .insert(mindMapConnectionsTable)
        .values(
          connections.map((conn: any) => ({
            mindmapId: savedMindMap.mindmapId,
            fromNodeId: conn.from,
            toNodeId: conn.to,
            label: conn.label || null,
          }))
        );
    }

    return NextResponse.json({
      success: true,
      mindMap: {
        ...savedMindMap,
        nodes: savedNodes,
        connections
      }
    });

  } catch (error) {
    console.error("Error creating mind map:", error);
    return NextResponse.json(
      { error: "Failed to create mind map" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing mind map
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      mindmapId,
      title,
      description,
      layout,
      theme,
      backgroundColor,
      nodes = [],
      connections = []
    } = body;

    if (!mindmapId) {
      return NextResponse.json(
        { error: "Mind map ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const [existingMindMap] = await db
      .select({ mindmapId: mindMapsTable.mindmapId })
      .from(mindMapsTable)
      .where(
        and(
          eq(mindMapsTable.mindmapId, mindmapId),
          eq(mindMapsTable.userId, user.userId)
        )
      )
      .limit(1);

    if (!existingMindMap) {
      return NextResponse.json(
        { error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Update mind map
    const [updatedMindMap] = await db
      .update(mindMapsTable)
      .set({
        title: title?.trim(),
        description: description?.trim(),
        layout,
        theme,
        backgroundColor,
        nodeCount: nodes.length,
        connectionCount: connections.length,
        lastEditedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mindMapsTable.mindmapId, mindmapId))
      .returning();

    // Update nodes - delete existing and insert new ones
    await db
      .delete(mindMapNodesTable)
      .where(eq(mindMapNodesTable.mindmapId, mindmapId));

    let savedNodes = [];
    if (nodes.length > 0) {
      savedNodes = await db
        .insert(mindMapNodesTable)
        .values(
          nodes.map((node: any, index: number) => ({
            mindmapId: mindmapId,
            nodeId: node.id || `node_${index}`,
            parentNodeId: node.parentId || null,
            text: node.text.trim(),
            level: node.level || 0,
            positionX: node.positionX || '0',
            positionY: node.positionY || '0',
            color: node.color || '#3b82f6',
            backgroundColor: node.backgroundColor || '#ffffff',
            icon: node.icon || null,
            notes: node.notes || null,
            isRoot: node.level === 0,
            orderIndex: index,
          }))
        )
        .returning();
    }

    // Update connections - delete existing and insert new ones
    await db
      .delete(mindMapConnectionsTable)
      .where(eq(mindMapConnectionsTable.mindmapId, mindmapId));

    if (connections.length > 0) {
      await db
        .insert(mindMapConnectionsTable)
        .values(
          connections.map((conn: any) => ({
            mindmapId: mindmapId,
            fromNodeId: conn.from,
            toNodeId: conn.to,
            label: conn.label || null,
          }))
        );
    }

    return NextResponse.json({
      success: true,
      mindMap: {
        ...updatedMindMap,
        nodes: savedNodes,
        connections
      }
    });

  } catch (error) {
    console.error("Error updating mind map:", error);
    return NextResponse.json(
      { error: "Failed to update mind map" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a mind map
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const mindmapId = searchParams.get('id');

    if (!mindmapId) {
      return NextResponse.json(
        { error: "Mind map ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership and delete
    const deletedMindMap = await db
      .delete(mindMapsTable)
      .where(
        and(
          eq(mindMapsTable.mindmapId, mindmapId),
          eq(mindMapsTable.userId, user.userId)
        )
      )
      .returning({ mindmapId: mindMapsTable.mindmapId });

    if (deletedMindMap.length === 0) {
      return NextResponse.json(
        { error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mind map deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting mind map:", error);
    return NextResponse.json(
      { error: "Failed to delete mind map" },
      { status: 500 }
    );
  }
} 