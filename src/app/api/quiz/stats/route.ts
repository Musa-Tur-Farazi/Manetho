import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  userQuizHistoryTable,
  studyStreaksTable,
  practiceTestSubmissionsTable,
  usersTable,
  subjectsTable,
  topicsTable,
  practiceTestsTable
} from '@/db/schema';
import { eq, desc, sql, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('Quiz stats API called');
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      console.log('No clerk user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Clerk user ID:', clerkUserId);

    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      console.log('User not found in database for clerk ID:', clerkUserId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user in database:', user.userId);

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');

    // Get user quiz history stats

    // Build the where condition dynamically
    const whereConditions = [eq(userQuizHistoryTable.userId, user.userId)];
    
    if (subjectId) {
      whereConditions.push(eq(practiceTestsTable.subjectId, subjectId));
    }
    if (topicId) {
      whereConditions.push(eq(practiceTestsTable.topicId, topicId));
    }

    const statsQuery = db
      .select({
        historyId: userQuizHistoryTable.historyId,
        testId: userQuizHistoryTable.testId,
        score: userQuizHistoryTable.score,
        accuracyRate: userQuizHistoryTable.accuracyRate,
        timeSpent: userQuizHistoryTable.timeSpent,
        completedAt: userQuizHistoryTable.completedAt,
        submissionData: userQuizHistoryTable.submissionData,
        // Test info
        testTitle: practiceTestsTable.title,
        testDescription: practiceTestsTable.description,
        testDifficulty: practiceTestsTable.difficulty,
        // Subject and topic info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
      })
      .from(userQuizHistoryTable)
      .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(practiceTestsTable.topicId, topicsTable.topicId))
      .where(and(...whereConditions));

    const stats = await statsQuery.orderBy(desc(userQuizHistoryTable.completedAt));

    // Get overall stats (aggregated from quiz history)
    const overallStats = await db
      .select({
        totalQuizzesCompleted: count(userQuizHistoryTable.historyId),
        totalPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
        bestScore: sql<number>`MAX(${userQuizHistoryTable.score})`,
        totalTimeSpent: sql<number>`SUM(${userQuizHistoryTable.timeSpent})`,
        averageAccuracy: sql<number>`AVG(${userQuizHistoryTable.accuracyRate})`,
      })
      .from(userQuizHistoryTable)
      .where(eq(userQuizHistoryTable.userId, user.userId));

    // Get study streak info
    const [streakInfo] = await db
      .select({
        currentStreak: studyStreaksTable.currentStreak,
        longestStreak: studyStreaksTable.longestStreak,
        lastStudyDate: studyStreaksTable.lastStudyDate,
      })
      .from(studyStreaksTable)
      .where(eq(studyStreaksTable.userId, user.userId))
      .limit(1);

    // Get recent quiz activity
    const recentQuizzes = await db
      .select({
        historyId: userQuizHistoryTable.historyId,
        testTitle: practiceTestsTable.title,
        score: userQuizHistoryTable.score,
        accuracyRate: userQuizHistoryTable.accuracyRate,
        completedAt: userQuizHistoryTable.completedAt,
      })
      .from(userQuizHistoryTable)
      .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
      .where(eq(userQuizHistoryTable.userId, user.userId))
      .orderBy(desc(userQuizHistoryTable.completedAt))
      .limit(5);

    // Get subject-wise performance
    const subjectPerformance = await db
      .select({
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        quizCount: count(userQuizHistoryTable.historyId),
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
        bestScore: sql<number>`MAX(${userQuizHistoryTable.score})`,
        totalTimeSpent: sql<number>`SUM(${userQuizHistoryTable.timeSpent})`,
      })
      .from(userQuizHistoryTable)
      .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .where(eq(userQuizHistoryTable.userId, user.userId))
      .groupBy(subjectsTable.name, subjectsTable.color)
      .orderBy(desc(sql`AVG(${userQuizHistoryTable.score})`));

    const response = {
      stats: stats.map(stat => ({
        ...stat,
        // Calculate derived fields
        totalQuizzesAttempted: 1, // Each history entry represents one attempt
        totalQuizzesCompleted: 1,
        totalPoints: stat.score,
        averageScore: stat.score,
        bestScore: stat.score,
        totalTimeSpent: stat.timeSpent,
        currentLevel: Math.floor(stat.score / 10) + 1, // Simple level calculation
        currentXp: stat.score,
        xpToNextLevel: 100,
        correctAnswers: Math.floor((typeof stat.accuracyRate === 'number' ? stat.accuracyRate : parseFloat(stat.accuracyRate || '0')) * 10), // Estimate
        totalAnswers: 10, // Estimate
        accuracyRate: stat.accuracyRate,
        longestStreak: streakInfo?.longestStreak || 0,
        currentStreak: streakInfo?.currentStreak || 0,
        lastQuizDate: stat.completedAt,
      })),
      overallStats: {
        totalQuizzesCompleted: overallStats[0]?.totalQuizzesCompleted || 0,
        totalPoints: overallStats[0]?.totalPoints || 0,
        averageScore: overallStats[0]?.averageScore || 0,
        bestScore: overallStats[0]?.bestScore || 0,
        totalTimeSpent: overallStats[0]?.totalTimeSpent || 0,
        maxLevel: Math.floor((overallStats[0]?.bestScore || 0) / 10) + 1,
        totalXp: overallStats[0]?.totalPoints || 0,
        correctAnswers: Math.floor((overallStats[0]?.averageAccuracy || 0) * (overallStats[0]?.totalQuizzesCompleted || 0) * 10),
        totalAnswers: (overallStats[0]?.totalQuizzesCompleted || 0) * 10,
        longestStreak: streakInfo?.longestStreak || 0,
      },
      streakInfo: streakInfo || { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
      recentQuizzes,
      subjectPerformance,
    };

    console.log('Quiz stats response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching quiz stats:', error);
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

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Get target user's quiz history stats
    const targetUserStats = await db
      .select({
        historyId: userQuizHistoryTable.historyId,
        testId: userQuizHistoryTable.testId,
        score: userQuizHistoryTable.score,
        accuracyRate: userQuizHistoryTable.accuracyRate,
        timeSpent: userQuizHistoryTable.timeSpent,
        completedAt: userQuizHistoryTable.completedAt,
        submissionData: userQuizHistoryTable.submissionData,
        // Test info
        testTitle: practiceTestsTable.title,
        testDescription: practiceTestsTable.description,
        testDifficulty: practiceTestsTable.difficulty,
        // Subject and topic info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
      })
      .from(userQuizHistoryTable)
      .leftJoin(practiceTestsTable, eq(userQuizHistoryTable.testId, practiceTestsTable.testId))
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(practiceTestsTable.topicId, topicsTable.topicId))
      .where(eq(userQuizHistoryTable.userId, targetUserId))
      .orderBy(desc(userQuizHistoryTable.score));

    // Get target user's overall stats
    const targetOverallStats = await db
      .select({
        totalQuizzesCompleted: count(userQuizHistoryTable.historyId),
        totalPoints: sql<number>`SUM(${userQuizHistoryTable.score})`,
        averageScore: sql<number>`AVG(${userQuizHistoryTable.score})`,
        bestScore: sql<number>`MAX(${userQuizHistoryTable.score})`,
        totalTimeSpent: sql<number>`SUM(${userQuizHistoryTable.timeSpent})`,
        averageAccuracy: sql<number>`AVG(${userQuizHistoryTable.accuracyRate})`,
      })
      .from(userQuizHistoryTable)
      .where(eq(userQuizHistoryTable.userId, targetUserId));

    // Get target user's study streak
    const [targetStreakInfo] = await db
      .select({
        currentStreak: studyStreaksTable.currentStreak,
        longestStreak: studyStreaksTable.longestStreak,
        lastStudyDate: studyStreaksTable.lastStudyDate,
      })
      .from(studyStreaksTable)
      .where(eq(studyStreaksTable.userId, targetUserId))
      .limit(1);

    const response = {
      stats: targetUserStats.map(stat => ({
        ...stat,
        // Calculate derived fields
        totalQuizzesAttempted: 1,
        totalQuizzesCompleted: 1,
        totalPoints: stat.score,
        averageScore: stat.score,
        bestScore: stat.score,
        totalTimeSpent: stat.timeSpent,
        currentLevel: Math.floor(stat.score / 10) + 1,
        currentXp: stat.score,
        xpToNextLevel: 100,
        correctAnswers: Math.floor((typeof stat.accuracyRate === 'number' ? stat.accuracyRate : parseFloat(stat.accuracyRate || '0')) * 10),
        totalAnswers: 10,
        accuracyRate: stat.accuracyRate,
        longestStreak: targetStreakInfo?.longestStreak || 0,
        currentStreak: targetStreakInfo?.currentStreak || 0,
        lastQuizDate: stat.completedAt,
      })),
      overallStats: {
        totalQuizzesCompleted: targetOverallStats[0]?.totalQuizzesCompleted || 0,
        totalPoints: targetOverallStats[0]?.totalPoints || 0,
        averageScore: targetOverallStats[0]?.averageScore || 0,
        bestScore: targetOverallStats[0]?.bestScore || 0,
        totalTimeSpent: targetOverallStats[0]?.totalTimeSpent || 0,
        maxLevel: Math.floor((targetOverallStats[0]?.bestScore || 0) / 10) + 1,
        totalXp: targetOverallStats[0]?.totalPoints || 0,
        correctAnswers: Math.floor((targetOverallStats[0]?.averageAccuracy || 0) * (targetOverallStats[0]?.totalQuizzesCompleted || 0) * 10),
        totalAnswers: (targetOverallStats[0]?.totalQuizzesCompleted || 0) * 10,
        longestStreak: targetStreakInfo?.longestStreak || 0,
      },
      streakInfo: targetStreakInfo || { currentStreak: 0, longestStreak: 0, lastStudyDate: null },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching target user quiz stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 