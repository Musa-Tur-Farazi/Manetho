import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { mindMapsTable, mindMapNodesTable, mindMapConnectionsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get a specific mind map with its nodes and connections
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: mindmapId } = await params;

    // Get mind map details
    const [mindMap] = await db
      .select()
      .from(mindMapsTable)
      .where(
        and(
          eq(mindMapsTable.mindmapId, mindmapId),
          eq(mindMapsTable.userId, user.userId)
        )
      )
      .limit(1);

    if (!mindMap) {
      return NextResponse.json(
        { error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Get nodes
    const nodes = await db
      .select()
      .from(mindMapNodesTable)
      .where(eq(mindMapNodesTable.mindmapId, mindmapId))
      .orderBy(mindMapNodesTable.orderIndex);

    // Get connections
    const connections = await db
      .select()
      .from(mindMapConnectionsTable)
      .where(eq(mindMapConnectionsTable.mindmapId, mindmapId));

    return NextResponse.json({
      success: true,
      mindMap: {
        ...mindMap,
        nodes,
        connections
      }
    });

  } catch (error) {
    console.error("Error fetching mind map:", error);
    return NextResponse.json(
      { error: "Failed to fetch mind map" },
      { status: 500 }
    );
  }
} 