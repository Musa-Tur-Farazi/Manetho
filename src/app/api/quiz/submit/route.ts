import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  practiceTestsTable,
  testQuestionsTable,
  practiceTestSubmissionsTable,
  userQuizHistoryTable,
  usersTable,
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
        answers: detailedResults,
        score: totalPoints,
        totalPoints: maxPoints,
        timeSpent: timeSpent || 0,
      })
      .returning();

    // Insert into user quiz history
    await db
      .insert(userQuizHistoryTable)
      .values({
        userId: user.userId,
        testId,
        score: totalPoints,
        accuracyRate: (accuracyRate / 100).toFixed(2), // Convert to decimal string
        timeSpent: timeSpent || 0,
        submissionData: {
          detailedResults,
          totalXp,
          accuracyRate,
          correctAnswers,
          totalQuestions: questions.length,
        },
      });

    // Update study streak
    await updateStudyStreak(user.userId);

    return NextResponse.json({
      success: true,
      results: {
        submissionId: submission.submissionId,
        score: score, // This is the percentage
        accuracyRate,
        correctAnswers,
        totalQuestions: questions.length,
        totalPoints,
        maxPoints,
        timeSpent,
        xpEarned: totalXp,
        detailedResults,
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateStudyStreak(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already has a streak record
    const [existingStreak] = await db
      .select()
      .from(studyStreaksTable)
      .where(eq(studyStreaksTable.userId, userId))
      .limit(1);

    if (existingStreak) {
      const lastStudyDate = existingStreak.lastStudyDate;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastStudyDate && new Date(lastStudyDate).getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        const newStreak = existingStreak.currentStreak + 1;
        await db
          .update(studyStreaksTable)
          .set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, existingStreak.longestStreak),
            lastStudyDate: today.toISOString().split('T')[0],
            updatedAt: new Date(),
          })
          .where(eq(studyStreaksTable.userId, userId));
      } else if (lastStudyDate && new Date(lastStudyDate).getTime() === today.getTime()) {
        // Already studied today - no change needed
        return;
      } else {
        // Break in streak - reset to 1
        await db
          .update(studyStreaksTable)
          .set({
            currentStreak: 1,
            lastStudyDate: today.toISOString().split('T')[0],
            updatedAt: new Date(),
          })
          .where(eq(studyStreaksTable.userId, userId));
      }
    } else {
      // First time studying - create streak record
      await db
        .insert(studyStreaksTable)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStudyDate: today.toISOString().split('T')[0],
        });
    }
  } catch (error) {
    console.error('Error updating study streak:', error);
  }
} 