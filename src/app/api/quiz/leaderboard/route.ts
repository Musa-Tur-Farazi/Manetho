import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  userQuizHistoryTable,
  usersTable,
  subjectsTable,
  topicsTable,
  practiceTestsTable
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
    let timeFilter = '';

    // Filter by type
    if (type === 'global') {
      // No additional filters for global leaderboard
    } else if (type === 'subject' && subjectId) {
      whereConditions.push(eq(practiceTestsTable.subjectId, subjectId));
    } else if (type === 'topic' && topicId) {
      whereConditions.push(eq(practiceTestsTable.topicId, topicId));
    }

    // Filter by period
    if (period === 'weekly') {
      timeFilter = "AND completed_at > NOW() - INTERVAL '7 days'";
    } else if (period === 'monthly') {
      timeFilter = "AND completed_at > NOW() - INTERVAL '30 days'";
    }

    // Get leaderboard data based on quiz history aggregation
    const leaderboard = await db
      .select({
        userId: userQuizHistoryTable.userId,
        totalPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        totalQuizzes: sql<number>`COUNT(${userQuizHistoryTable.historyId})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
        bestScore: sql<number>`MAX(${userQuizHistoryTable.score})`,
        totalTimeSpent: sql<number>`SUM(${userQuizHistoryTable.timeSpent})`,
        lastActiveDate: sql<Date>`MAX(${userQuizHistoryTable.completedAt})`,
        // User info
        fullName: usersTable.fullName,
        avatarUrl: usersTable.avatarUrl,
        // Subject info (for subject/topic leaderboards)
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
      })
      .from(userQuizHistoryTable)
      .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
      .leftJoin(usersTable, eq(userQuizHistoryTable.userId, usersTable.userId))
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(practiceTestsTable.topicId, topicsTable.topicId))
      .where(
        and(
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
          sql`1=1 ${sql.raw(timeFilter)}`
        )
      )
      .groupBy(
        userQuizHistoryTable.userId,
        usersTable.fullName,
        usersTable.avatarUrl,
        subjectsTable.name,
        subjectsTable.color,
        topicsTable.name
      )
      .orderBy(desc(sql`SUM(${userQuizHistoryTable.score})`))
      .limit(limit)
      .offset(offset);

    // Add rank numbers
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
      points: entry.totalPoints,
      currentLevel: Math.floor(entry.totalPoints / 100) + 1,
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
            rank: sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${userQuizHistoryTable.score}) DESC)`,
            totalPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
            totalQuizzes: sql<number>`COUNT(${userQuizHistoryTable.historyId})`,
            averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
          })
          .from(userQuizHistoryTable)
          .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
          .where(
            and(
              eq(userQuizHistoryTable.userId, user.userId),
              whereConditions.length > 0 ? and(...whereConditions) : undefined,
              sql`1=1 ${sql.raw(timeFilter)}`
            )
          )
          .groupBy(userQuizHistoryTable.userId);

        if (userRankQuery.length > 0) {
          currentUserRank = {
            rank: userRankQuery[0].rank,
            totalPoints: userRankQuery[0].totalPoints,
            totalQuizzes: userRankQuery[0].totalQuizzes,
            averageScore: userRankQuery[0].averageScore,
            currentLevel: Math.floor(userRankQuery[0].totalPoints / 100) + 1,
          };
        }
      }
    }

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      metadata: {
        type,
        subjectId,
        topicId,
        period,
        limit,
        offset,
        totalEntries: rankedLeaderboard.length,
      },
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const period = searchParams.get('period') || 'all-time';

    let timeFilter = '';
    if (period === 'weekly') {
      timeFilter = "AND completed_at > NOW() - INTERVAL '7 days'";
    } else if (period === 'monthly') {
      timeFilter = "AND completed_at > NOW() - INTERVAL '30 days'";
    }

    // Get user's global ranking
    const [globalRank] = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${userQuizHistoryTable.score}) DESC)`,
        totalPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        totalQuizzes: sql<number>`COUNT(${userQuizHistoryTable.historyId})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
      })
      .from(userQuizHistoryTable)
      .where(
        and(
          eq(userQuizHistoryTable.userId, user.userId),
          sql`1=1 ${sql.raw(timeFilter)}`
        )
      )
      .groupBy(userQuizHistoryTable.userId);

    // Get weekly ranking
    const [weeklyRank] = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${userQuizHistoryTable.score}) DESC)`,
        weeklyPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        totalQuizzes: sql<number>`COUNT(${userQuizHistoryTable.historyId})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
      })
      .from(userQuizHistoryTable)
      .where(
        and(
          eq(userQuizHistoryTable.userId, user.userId),
          sql`completed_at > NOW() - INTERVAL '7 days'`
        )
      )
      .groupBy(userQuizHistoryTable.userId);

    // Get monthly ranking
    const [monthlyRank] = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY SUM(${userQuizHistoryTable.score}) DESC)`,
        monthlyPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        totalQuizzes: sql<number>`COUNT(${userQuizHistoryTable.historyId})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
      })
      .from(userQuizHistoryTable)
      .where(
        and(
          eq(userQuizHistoryTable.userId, user.userId),
          sql`completed_at > NOW() - INTERVAL '30 days'`
        )
      )
      .groupBy(userQuizHistoryTable.userId);

    return NextResponse.json({
      globalRank: globalRank ? {
        rank: globalRank.rank,
        totalPoints: globalRank.totalPoints,
        totalQuizzes: globalRank.totalQuizzes,
        averageScore: globalRank.averageScore,
        currentLevel: Math.floor(globalRank.totalPoints / 100) + 1,
      } : null,
      weeklyRank: weeklyRank ? {
        rank: weeklyRank.rank,
        weeklyPoints: weeklyRank.weeklyPoints,
        totalQuizzes: weeklyRank.totalQuizzes,
        averageScore: weeklyRank.averageScore,
        currentLevel: Math.floor(weeklyRank.weeklyPoints / 100) + 1,
      } : null,
      monthlyRank: monthlyRank ? {
        rank: monthlyRank.rank,
        monthlyPoints: monthlyRank.monthlyPoints,
        totalQuizzes: monthlyRank.totalQuizzes,
        averageScore: monthlyRank.averageScore,
        currentLevel: Math.floor(monthlyRank.monthlyPoints / 100) + 1,
      } : null,
    });

  } catch (error) {
    console.error('Error fetching user rankings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 