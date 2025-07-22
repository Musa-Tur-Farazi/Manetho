import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  practiceTestsTable,
  testQuestionsTable,
  practiceTestSubmissionsTable,
  usersTable,
  userQuizStatsTable,
  globalLeaderboardTable,
  studyStreaksTable
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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

    const body = await request.json();
    const { testId, answers, timeSpent } = body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Test ID and answers are required' }, { status: 400 });
    }

    // Get the quiz questions
    const questions = await db
      .select()
      .from(testQuestionsTable)
      .where(eq(testQuestionsTable.testId, testId))
      .orderBy(testQuestionsTable.orderIndex);

    if (questions.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get the quiz info
    const [quiz] = await db
      .select()
      .from(practiceTestsTable)
      .where(eq(practiceTestsTable.testId, testId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let maxPoints = 0;
    const detailedResults = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i]?.answer || '';
      const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points;
      }

      maxPoints += question.points;

      detailedResults.push({
        questionId: question.questionId,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation,
      });
    }

    const score = Math.round((totalPoints / maxPoints) * 100);
    const accuracyRate = Math.round((correctAnswers / questions.length) * 100);

    // Calculate XP earned (base XP + bonus for performance)
    const baseXp = Math.floor(correctAnswers * 10);
    const timeBonus = timeSpent && quiz.timeLimit ? Math.max(0, Math.floor((quiz.timeLimit - timeSpent) / 60) * 2) : 0;
    const accuracyBonus = accuracyRate >= 80 ? 20 : accuracyRate >= 60 ? 10 : 0;
    const totalXp = baseXp + timeBonus + accuracyBonus;

    // Insert submission
    const [submission] = await db
      .insert(practiceTestSubmissionsTable)
      .values({
        testId,
        userId: user.userId,
        answers: JSON.stringify(answers),
        score: totalPoints,
        totalPoints: maxPoints,
        timeSpent: timeSpent || 0,
      })
      .returning();

    // Update user quiz stats
    await updateUserQuizStats(user.userId, quiz.subjectId, quiz.topicId, {
      score,
      totalPoints,
      maxPoints,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: timeSpent || 0,
      xpEarned: totalXp,
    });

    // Update global leaderboard
    await updateGlobalLeaderboard(user.userId, quiz.subjectId, quiz.topicId, {
      pointsEarned: totalPoints,
      quizCompleted: 1,
      averageScore: score,
    });

    // Update study streak
    await updateStudyStreak(user.userId);

    return NextResponse.json({
      submission,
      results: {
        score,
        accuracyRate,
        correctAnswers,
        totalQuestions: questions.length,
        totalPoints,
        maxPoints,
        xpEarned: totalXp,
        timeSpent: timeSpent || 0,
        detailedResults,
      },
      message: 'Quiz submitted successfully!',
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateUserQuizStats(
  userId: string,
  subjectId: string | null,
  topicId: string | null,
  results: {
    score: number;
    totalPoints: number;
    maxPoints: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    xpEarned: number;
  }
) {
  const { score, totalPoints, maxPoints, correctAnswers, totalQuestions, timeSpent, xpEarned } = results;

  // Check if user stats exist
  const [existingStats] = await db
    .select()
    .from(userQuizStatsTable)
    .where(
      and(
        eq(userQuizStatsTable.userId, userId),
        subjectId ? eq(userQuizStatsTable.subjectId, subjectId) : sql`subject_id IS NULL`,
        topicId ? eq(userQuizStatsTable.topicId, topicId) : sql`topic_id IS NULL`
      )
    )
    .limit(1);

  if (existingStats) {
    // Update existing stats
    const newTotalQuizzes = existingStats.totalQuizzesCompleted + 1;
    const newTotalPoints = existingStats.totalPoints + totalPoints;
    const newAverageScore = ((existingStats.averageScore * existingStats.totalQuizzesCompleted) + score) / newTotalQuizzes;
    const newBestScore = Math.max(existingStats.bestScore, score);
    const newTotalTimeSpent = existingStats.totalTimeSpent + timeSpent;
    const newCurrentXp = existingStats.currentXp + xpEarned;
    const newTotalCorrectAnswers = existingStats.correctAnswers + correctAnswers;
    const newTotalAnswers = existingStats.totalAnswers + totalQuestions;
    const newAccuracyRate = (newTotalCorrectAnswers / newTotalAnswers) * 100;

    // Calculate new level
    const newLevel = Math.floor(newCurrentXp / 100) + 1;
    const xpToNextLevel = (newLevel * 100) - newCurrentXp;

    await db
      .update(userQuizStatsTable)
      .set({
        totalQuizzesCompleted: newTotalQuizzes,
        totalPoints: newTotalPoints,
        averageScore: newAverageScore,
        bestScore: newBestScore,
        totalTimeSpent: newTotalTimeSpent,
        currentLevel: newLevel,
        currentXp: newCurrentXp,
        xpToNextLevel: xpToNextLevel,
        correctAnswers: newTotalCorrectAnswers,
        totalAnswers: newTotalAnswers,
        accuracyRate: newAccuracyRate,
        lastQuizDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userQuizStatsTable.statId, existingStats.statId));
  } else {
    // Create new stats
    const currentLevel = Math.floor(xpEarned / 100) + 1;
    const xpToNextLevel = (currentLevel * 100) - xpEarned;

    await db
      .insert(userQuizStatsTable)
      .values({
        userId,
        subjectId,
        topicId,
        totalQuizzesCompleted: 1,
        totalPoints,
        averageScore: score,
        bestScore: score,
        totalTimeSpent: timeSpent,
        currentLevel,
        currentXp: xpEarned,
        xpToNextLevel,
        correctAnswers,
        totalAnswers: totalQuestions,
        accuracyRate: (correctAnswers / totalQuestions) * 100,
        lastQuizDate: new Date(),
      });
  }
}

async function updateGlobalLeaderboard(
  userId: string,
  subjectId: string | null,
  topicId: string | null,
  results: {
    pointsEarned: number;
    quizCompleted: number;
    averageScore: number;
  }
) {
  const { pointsEarned, quizCompleted, averageScore } = results;

  // Check if user exists in leaderboard
  const [existingEntry] = await db
    .select()
    .from(globalLeaderboardTable)
    .where(
      and(
        eq(globalLeaderboardTable.userId, userId),
        subjectId ? eq(globalLeaderboardTable.subjectId, subjectId) : sql`subject_id IS NULL`,
        topicId ? eq(globalLeaderboardTable.topicId, topicId) : sql`topic_id IS NULL`
      )
    )
    .limit(1);

  if (existingEntry) {
    // Update existing entry
    const newTotalQuizzes = existingEntry.totalQuizzes + quizCompleted;
    const newTotalPoints = existingEntry.totalPoints + pointsEarned;
    const newAverageScore = ((existingEntry.averageScore * existingEntry.totalQuizzes) + averageScore) / newTotalQuizzes;

    await db
      .update(globalLeaderboardTable)
      .set({
        totalPoints: newTotalPoints,
        totalQuizzes: newTotalQuizzes,
        averageScore: newAverageScore,
        weeklyPoints: existingEntry.weeklyPoints + pointsEarned,
        monthlyPoints: existingEntry.monthlyPoints + pointsEarned,
        lastActiveDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(globalLeaderboardTable.leaderboardId, existingEntry.leaderboardId));
  } else {
    // Create new entry
    await db
      .insert(globalLeaderboardTable)
      .values({
        userId,
        subjectId,
        topicId,
        totalPoints: pointsEarned,
        totalQuizzes: quizCompleted,
        averageScore,
        weeklyPoints: pointsEarned,
        monthlyPoints: pointsEarned,
        lastActiveDate: new Date(),
      });
  }
}

async function updateStudyStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [existingStreak] = await db
    .select()
    .from(studyStreaksTable)
    .where(eq(studyStreaksTable.userId, userId))
    .limit(1);

  if (existingStreak) {
    const lastStudyDate = existingStreak.lastStudyDate?.toISOString().split('T')[0];

    if (lastStudyDate === today) {
      // Already studied today, no change
      return;
    } else if (lastStudyDate === yesterday) {
      // Continuing streak
      const newStreak = existingStreak.currentStreak + 1;
      await db
        .update(studyStreaksTable)
        .set({
          currentStreak: newStreak,
          longestStreak: Math.max(existingStreak.longestStreak, newStreak),
          lastStudyDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(studyStreaksTable.userId, userId));
    } else {
      // Streak broken, restart
      await db
        .update(studyStreaksTable)
        .set({
          currentStreak: 1,
          lastStudyDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(studyStreaksTable.userId, userId));
    }
  } else {
    // Create new streak
    await db
      .insert(studyStreaksTable)
      .values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: new Date(),
      });
  }
} 