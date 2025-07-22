import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  globalLeaderboardTable,
  usersTable,
  subjectsTable,
  topicsTable
} from '@/db/schema';
import { eq, desc, sql, and, isNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global'; // global, subject, topic
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');
    const period = searchParams.get('period') || 'all-time'; // all-time, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereConditions = [];
    let orderByColumn = globalLeaderboardTable.totalPoints;

    // Filter by type
    if (type === 'global') {
      whereConditions.push(isNull(globalLeaderboardTable.subjectId));
      whereConditions.push(isNull(globalLeaderboardTable.topicId));
    } else if (type === 'subject' && subjectId) {
      whereConditions.push(eq(globalLeaderboardTable.subjectId, subjectId));
      whereConditions.push(isNull(globalLeaderboardTable.topicId));
    } else if (type === 'topic' && topicId) {
      whereConditions.push(eq(globalLeaderboardTable.topicId, topicId));
    }

    // Filter by period
    if (period === 'weekly') {
      orderByColumn = globalLeaderboardTable.weeklyPoints;
    } else if (period === 'monthly') {
      orderByColumn = globalLeaderboardTable.monthlyPoints;
    }

    // Get leaderboard data
    const leaderboard = await db
      .select({
        leaderboardId: globalLeaderboardTable.leaderboardId,
        userId: globalLeaderboardTable.userId,
        totalPoints: globalLeaderboardTable.totalPoints,
        totalQuizzes: globalLeaderboardTable.totalQuizzes,
        averageScore: globalLeaderboardTable.averageScore,
        currentLevel: globalLeaderboardTable.currentLevel,
        globalRank: globalLeaderboardTable.globalRank,
        subjectRank: globalLeaderboardTable.subjectRank,
        weeklyPoints: globalLeaderboardTable.weeklyPoints,
        monthlyPoints: globalLeaderboardTable.monthlyPoints,
        lastActiveDate: globalLeaderboardTable.lastActiveDate,
        // User info
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl,
        // Subject info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        // Topic info
        topicName: topicsTable.name,
      })
      .from(globalLeaderboardTable)
      .leftJoin(usersTable, eq(globalLeaderboardTable.userId, usersTable.userId))
      .leftJoin(subjectsTable, eq(globalLeaderboardTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(globalLeaderboardTable.topicId, topicsTable.topicId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    // Add rank numbers
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
      points: period === 'weekly' ? entry.weeklyPoints :
        period === 'monthly' ? entry.monthlyPoints :
          entry.totalPoints,
    }));

    // Get current user's position if authenticated
    let currentUserRank = null;
    const { userId: clerkUserId } = await auth();

    if (clerkUserId) {
      const [user] = await db
        .select({ userId: usersTable.userId })
        .from(usersTable)
        .where(eq(usersTable.clerkId, clerkUserId))
        .limit(1);

      if (user) {
        // Get user's ranking
        const userRankQuery = await db
          .select({
            rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${orderByColumn} DESC)`,
            totalPoints: globalLeaderboardTable.totalPoints,
            weeklyPoints: globalLeaderboardTable.weeklyPoints,
            monthlyPoints: globalLeaderboardTable.monthlyPoints,
            totalQuizzes: globalLeaderboardTable.totalQuizzes,
            averageScore: globalLeaderboardTable.averageScore,
            currentLevel: globalLeaderboardTable.currentLevel,
          })
          .from(globalLeaderboardTable)
          .where(
            and(
              eq(globalLeaderboardTable.userId, user.userId),
              ...(whereConditions.length > 0 ? whereConditions : [])
            )
          )
          .limit(1);

        if (userRankQuery.length > 0) {
          currentUserRank = {
            ...userRankQuery[0],
            points: period === 'weekly' ? userRankQuery[0].weeklyPoints :
              period === 'monthly' ? userRankQuery[0].monthlyPoints :
                userRankQuery[0].totalPoints,
          };
        }
      }
    }

    // Get some statistics
    const totalParticipants = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(globalLeaderboardTable)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const topPerformer = rankedLeaderboard[0] || null;

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      statistics: {
        totalParticipants: totalParticipants[0]?.count || 0,
        topPerformer,
        period,
        type,
        subjectId,
        topicId,
      },
      pagination: {
        limit,
        offset,
        total: rankedLeaderboard.length,
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get top performers for homepage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'top-global', limit = 5 } = body;

    let query;

    switch (type) {
      case 'top-global':
        // Top 5 global performers
        query = db
          .select({
            userId: globalLeaderboardTable.userId,
            totalPoints: globalLeaderboardTable.totalPoints,
            currentLevel: globalLeaderboardTable.currentLevel,
            totalQuizzes: globalLeaderboardTable.totalQuizzes,
            averageScore: globalLeaderboardTable.averageScore,
            fullName: usersTable.fullName,
            avatarUrl: usersTable.avatarUrl,
          })
          .from(globalLeaderboardTable)
          .leftJoin(usersTable, eq(globalLeaderboardTable.userId, usersTable.userId))
          .where(
            and(
              isNull(globalLeaderboardTable.subjectId),
              isNull(globalLeaderboardTable.topicId)
            )
          )
          .orderBy(desc(globalLeaderboardTable.totalPoints))
          .limit(limit);
        break;

      case 'top-weekly':
        // Top weekly performers
        query = db
          .select({
            userId: globalLeaderboardTable.userId,
            weeklyPoints: globalLeaderboardTable.weeklyPoints,
            currentLevel: globalLeaderboardTable.currentLevel,
            totalQuizzes: globalLeaderboardTable.totalQuizzes,
            averageScore: globalLeaderboardTable.averageScore,
            fullName: usersTable.fullName,
            avatarUrl: usersTable.avatarUrl,
          })
          .from(globalLeaderboardTable)
          .leftJoin(usersTable, eq(globalLeaderboardTable.userId, usersTable.userId))
          .where(
            and(
              isNull(globalLeaderboardTable.subjectId),
              isNull(globalLeaderboardTable.topicId)
            )
          )
          .orderBy(desc(globalLeaderboardTable.weeklyPoints))
          .limit(limit);
        break;

      case 'rising-stars':
        // Users with highest level but relatively new
        query = db
          .select({
            userId: globalLeaderboardTable.userId,
            currentLevel: globalLeaderboardTable.currentLevel,
            totalPoints: globalLeaderboardTable.totalPoints,
            totalQuizzes: globalLeaderboardTable.totalQuizzes,
            averageScore: globalLeaderboardTable.averageScore,
            fullName: usersTable.fullName,
            avatarUrl: usersTable.avatarUrl,
            createdAt: globalLeaderboardTable.createdAt,
          })
          .from(globalLeaderboardTable)
          .leftJoin(usersTable, eq(globalLeaderboardTable.userId, usersTable.userId))
          .where(
            and(
              isNull(globalLeaderboardTable.subjectId),
              isNull(globalLeaderboardTable.topicId),
              sql`${globalLeaderboardTable.createdAt} > NOW() - INTERVAL '30 days'`
            )
          )
          .orderBy(desc(globalLeaderboardTable.currentLevel))
          .limit(limit);
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const results = await query;

    // Add rank numbers
    const rankedResults = results.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      performers: rankedResults,
      type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 