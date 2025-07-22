import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  userQuizStatsTable,
  globalLeaderboardTable,
  studyStreaksTable,
  userQuizAchievementsTable,
  quizAchievementsTable,
  practiceTestSubmissionsTable,
  usersTable,
  subjectsTable,
  topicsTable
} from '@/db/schema';
import { eq, desc, sql, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');

    // Get user quiz stats
    let statsQuery = db
      .select({
        statId: userQuizStatsTable.statId,
        totalQuizzesAttempted: userQuizStatsTable.totalQuizzesAttempted,
        totalQuizzesCompleted: userQuizStatsTable.totalQuizzesCompleted,
        totalPoints: userQuizStatsTable.totalPoints,
        averageScore: userQuizStatsTable.averageScore,
        bestScore: userQuizStatsTable.bestScore,
        totalTimeSpent: userQuizStatsTable.totalTimeSpent,
        currentLevel: userQuizStatsTable.currentLevel,
        currentXp: userQuizStatsTable.currentXp,
        xpToNextLevel: userQuizStatsTable.xpToNextLevel,
        correctAnswers: userQuizStatsTable.correctAnswers,
        totalAnswers: userQuizStatsTable.totalAnswers,
        accuracyRate: userQuizStatsTable.accuracyRate,
        longestStreak: userQuizStatsTable.longestStreak,
        currentStreak: userQuizStatsTable.currentStreak,
        lastQuizDate: userQuizStatsTable.lastQuizDate,
        createdAt: userQuizStatsTable.createdAt,
        updatedAt: userQuizStatsTable.updatedAt,
        // Subject and topic info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
      })
      .from(userQuizStatsTable)
      .leftJoin(subjectsTable, eq(userQuizStatsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(userQuizStatsTable.topicId, topicsTable.topicId))
      .where(eq(userQuizStatsTable.userId, user.userId));

    // Add filters if specified
    if (subjectId) {
      statsQuery = statsQuery.where(eq(userQuizStatsTable.subjectId, subjectId));
    }
    if (topicId) {
      statsQuery = statsQuery.where(eq(userQuizStatsTable.topicId, topicId));
    }

    const stats = await statsQuery.orderBy(desc(userQuizStatsTable.totalPoints));

    // Get overall stats (sum across all subjects/topics)
    const overallStats = await db
      .select({
        totalQuizzesCompleted: sql<number>`SUM(${userQuizStatsTable.totalQuizzesCompleted})`,
        totalPoints: sql<number>`SUM(${userQuizStatsTable.totalPoints})`,
        averageScore: sql<number>`AVG(${userQuizStatsTable.averageScore})`,
        bestScore: sql<number>`MAX(${userQuizStatsTable.bestScore})`,
        totalTimeSpent: sql<number>`SUM(${userQuizStatsTable.totalTimeSpent})`,
        maxLevel: sql<number>`MAX(${userQuizStatsTable.currentLevel})`,
        totalXp: sql<number>`SUM(${userQuizStatsTable.currentXp})`,
        correctAnswers: sql<number>`SUM(${userQuizStatsTable.correctAnswers})`,
        totalAnswers: sql<number>`SUM(${userQuizStatsTable.totalAnswers})`,
        longestStreak: sql<number>`MAX(${userQuizStatsTable.longestStreak})`,
      })
      .from(userQuizStatsTable)
      .where(eq(userQuizStatsTable.userId, user.userId));

    // Get study streak
    const [studyStreak] = await db
      .select()
      .from(studyStreaksTable)
      .where(eq(studyStreaksTable.userId, user.userId))
      .limit(1);

    // Get user's global ranking
    const [userRank] = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${globalLeaderboardTable.totalPoints} DESC)`,
        totalPoints: globalLeaderboardTable.totalPoints,
        currentLevel: globalLeaderboardTable.currentLevel,
        globalRank: globalLeaderboardTable.globalRank,
        subjectRank: globalLeaderboardTable.subjectRank,
      })
      .from(globalLeaderboardTable)
      .where(eq(globalLeaderboardTable.userId, user.userId))
      .limit(1);

    // Get recent quiz history
    const recentQuizzes = await db
      .select({
        submissionId: practiceTestSubmissionsTable.submissionId,
        score: practiceTestSubmissionsTable.score,
        totalPoints: practiceTestSubmissionsTable.totalPoints,
        timeSpent: practiceTestSubmissionsTable.timeSpent,
        submittedAt: practiceTestSubmissionsTable.submittedAt,
        // Quiz info would need to be joined with practiceTestsTable
      })
      .from(practiceTestSubmissionsTable)
      .where(eq(practiceTestSubmissionsTable.userId, user.userId))
      .orderBy(desc(practiceTestSubmissionsTable.submittedAt))
      .limit(10);

    // Get user achievements
    const achievements = await db
      .select({
        userAchievementId: userQuizAchievementsTable.userAchievementId,
        earnedAt: userQuizAchievementsTable.earnedAt,
        progress: userQuizAchievementsTable.progress,
        notified: userQuizAchievementsTable.notified,
        // Achievement details
        achievementId: quizAchievementsTable.achievementId,
        name: quizAchievementsTable.name,
        description: quizAchievementsTable.description,
        iconUrl: quizAchievementsTable.iconUrl,
        badgeColor: quizAchievementsTable.badgeColor,
        xpReward: quizAchievementsTable.xpReward,
        pointsReward: quizAchievementsTable.pointsReward,
        category: quizAchievementsTable.category,
        rarity: quizAchievementsTable.rarity,
      })
      .from(userQuizAchievementsTable)
      .leftJoin(quizAchievementsTable, eq(userQuizAchievementsTable.achievementId, quizAchievementsTable.achievementId))
      .where(eq(userQuizAchievementsTable.userId, user.userId))
      .orderBy(desc(userQuizAchievementsTable.earnedAt));

    // Calculate some additional metrics
    const totalQuizzesCompleted = overallStats[0]?.totalQuizzesCompleted || 0;
    const totalCorrectAnswers = overallStats[0]?.correctAnswers || 0;
    const totalAnswers = overallStats[0]?.totalAnswers || 0;
    const overallAccuracy = totalAnswers > 0 ? (totalCorrectAnswers / totalAnswers) * 100 : 0;

    return NextResponse.json({
      stats,
      overallStats: {
        totalQuizzesCompleted,
        totalPoints: overallStats[0]?.totalPoints || 0,
        averageScore: overallStats[0]?.averageScore || 0,
        bestScore: overallStats[0]?.bestScore || 0,
        totalTimeSpent: overallStats[0]?.totalTimeSpent || 0,
        maxLevel: overallStats[0]?.maxLevel || 1,
        totalXp: overallStats[0]?.totalXp || 0,
        overallAccuracy,
        totalSubjects: stats.length,
      },
      studyStreak: studyStreak || {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      },
      ranking: userRank || {
        rank: 0,
        totalPoints: 0,
        currentLevel: 1,
        globalRank: 0,
        subjectRank: 0,
      },
      recentQuizzes,
      achievements,
      metadata: {
        subjectId,
        topicId,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get specific user's stats by userId (for profile pages)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user quiz stats (public view)
    const stats = await db
      .select({
        totalQuizzesCompleted: userQuizStatsTable.totalQuizzesCompleted,
        totalPoints: userQuizStatsTable.totalPoints,
        averageScore: userQuizStatsTable.averageScore,
        bestScore: userQuizStatsTable.bestScore,
        currentLevel: userQuizStatsTable.currentLevel,
        currentXp: userQuizStatsTable.currentXp,
        accuracyRate: userQuizStatsTable.accuracyRate,
        longestStreak: userQuizStatsTable.longestStreak,
        currentStreak: userQuizStatsTable.currentStreak,
        lastQuizDate: userQuizStatsTable.lastQuizDate,
        // Subject info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
      })
      .from(userQuizStatsTable)
      .leftJoin(subjectsTable, eq(userQuizStatsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(userQuizStatsTable.topicId, topicsTable.topicId))
      .where(eq(userQuizStatsTable.userId, targetUserId))
      .orderBy(desc(userQuizStatsTable.totalPoints));

    // Get overall stats
    const overallStats = await db
      .select({
        totalQuizzesCompleted: sql<number>`SUM(${userQuizStatsTable.totalQuizzesCompleted})`,
        totalPoints: sql<number>`SUM(${userQuizStatsTable.totalPoints})`,
        averageScore: sql<number>`AVG(${userQuizStatsTable.averageScore})`,
        bestScore: sql<number>`MAX(${userQuizStatsTable.bestScore})`,
        maxLevel: sql<number>`MAX(${userQuizStatsTable.currentLevel})`,
        totalXp: sql<number>`SUM(${userQuizStatsTable.currentXp})`,
        correctAnswers: sql<number>`SUM(${userQuizStatsTable.correctAnswers})`,
        totalAnswers: sql<number>`SUM(${userQuizStatsTable.totalAnswers})`,
        longestStreak: sql<number>`MAX(${userQuizStatsTable.longestStreak})`,
      })
      .from(userQuizStatsTable)
      .where(eq(userQuizStatsTable.userId, targetUserId));

    // Get study streak
    const [studyStreak] = await db
      .select()
      .from(studyStreaksTable)
      .where(eq(studyStreaksTable.userId, targetUserId))
      .limit(1);

    // Get user's global ranking
    const [userRank] = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${globalLeaderboardTable.totalPoints} DESC)`,
        totalPoints: globalLeaderboardTable.totalPoints,
        currentLevel: globalLeaderboardTable.currentLevel,
      })
      .from(globalLeaderboardTable)
      .where(eq(globalLeaderboardTable.userId, targetUserId))
      .limit(1);

    // Get achievements count
    const [achievementsCount] = await db
      .select({ count: count() })
      .from(userQuizAchievementsTable)
      .where(eq(userQuizAchievementsTable.userId, targetUserId));

    const totalCorrectAnswers = overallStats[0]?.correctAnswers || 0;
    const totalAnswers = overallStats[0]?.totalAnswers || 0;
    const overallAccuracy = totalAnswers > 0 ? (totalCorrectAnswers / totalAnswers) * 100 : 0;

    return NextResponse.json({
      stats,
      overallStats: {
        totalQuizzesCompleted: overallStats[0]?.totalQuizzesCompleted || 0,
        totalPoints: overallStats[0]?.totalPoints || 0,
        averageScore: overallStats[0]?.averageScore || 0,
        bestScore: overallStats[0]?.bestScore || 0,
        maxLevel: overallStats[0]?.maxLevel || 1,
        totalXp: overallStats[0]?.totalXp || 0,
        overallAccuracy,
        totalSubjects: stats.length,
        achievementsCount: achievementsCount?.count || 0,
      },
      studyStreak: studyStreak || {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      },
      ranking: userRank || {
        rank: 0,
        totalPoints: 0,
        currentLevel: 1,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 