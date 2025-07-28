import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  usersTable,
  userFollowsTable,
  studySessionsTable,
  flashcardDecksTable,
  mindMapsTable,
  userQuizHistoryTable
} from "@/db/schema";
import { eq, count, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get the target user ID from query parameters
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId');

  let uid: string;
  
  if (targetUserId) {
    // If a specific user ID is provided, use that
    uid = targetUserId;
  } else {
    // Otherwise, use the current authenticated user
    const [user] = await db.select({ userId: usersTable.userId }).from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    uid = user.userId;
  }

  const [[followers], [following], [hoursRow], [decks], [maps], [quizzes]] = await Promise.all([
    db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followingId, uid)),
    db.select({ c: count() }).from(userFollowsTable).where(eq(userFollowsTable.followerId, uid)),
    db.select({ h: sum(studySessionsTable.duration) }).from(studySessionsTable).where(eq(studySessionsTable.userId, uid)),
    db.select({ c: count() }).from(flashcardDecksTable).where(eq(flashcardDecksTable.userId, uid)),
    db.select({ c: count() }).from(mindMapsTable).where(eq(mindMapsTable.userId, uid)),
    db.select({ c: count() }).from(userQuizHistoryTable).where(eq(userQuizHistoryTable.userId, uid)),
  ]);

  return NextResponse.json({
    followersCount: Number(followers?.c || 0),
    followingCount: Number(following?.c || 0),
    totalStudyHours: Math.round(((hoursRow?.h || 0) as number) / 3600),
    flashcardDecks: Number(decks?.c || 0),
    mindMapsSaved: Number(maps?.c || 0),
    problemsSolved: Number(quizzes?.c || 0), // Using quiz count as problems solved
    groupsJoined: 0,
  });
} 