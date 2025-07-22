import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  practiceTestsTable,
  testQuestionsTable,
  practiceTestSubmissionsTable,
  usersTable,
  subjectsTable,
  topicsTable
} from '@/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
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

    const { testId } = await params;

    // Get quiz details
    const [quiz] = await db
      .select({
        testId: practiceTestsTable.testId,
        title: practiceTestsTable.title,
        description: practiceTestsTable.description,
        difficulty: practiceTestsTable.difficulty,
        totalQuestions: practiceTestsTable.totalQuestions,
        timeLimit: practiceTestsTable.timeLimit,
        isPublic: practiceTestsTable.isPublic,
        createdAt: practiceTestsTable.createdAt,
        createdBy: practiceTestsTable.userId,
        // Subject info
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        subjectIconUrl: subjectsTable.iconUrl,
        // Topic info
        topicName: topicsTable.name,
        // Creator info
        creatorName: usersTable.fullName,
        creatorAvatarUrl: usersTable.avatarUrl,
      })
      .from(practiceTestsTable)
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(practiceTestsTable.topicId, topicsTable.topicId))
      .leftJoin(usersTable, eq(practiceTestsTable.userId, usersTable.userId))
      .where(eq(practiceTestsTable.testId, testId))
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if quiz is public or user has access
    if (!quiz.isPublic && quiz.createdBy !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get quiz questions
    const questions = await db
      .select({
        questionId: testQuestionsTable.questionId,
        question: testQuestionsTable.question,
        options: testQuestionsTable.options,
        points: testQuestionsTable.points,
        orderIndex: testQuestionsTable.orderIndex,
        // Don't include correct answer and explanation for active quiz
      })
      .from(testQuestionsTable)
      .where(eq(testQuestionsTable.testId, testId))
      .orderBy(testQuestionsTable.orderIndex);

    // Parse options JSON with error handling
    const formattedQuestions = questions.map(q => {
      let parsedOptions = null;
      if (q.options) {
        try {
          parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        } catch (e) {
          console.error('Error parsing options for question:', q.questionId, 'Raw options:', q.options);
          // If JSON parsing fails, treat as null (no options)
          parsedOptions = null;
        }
      }
      
      return {
        ...q,
        options: parsedOptions,
      };
    });

    // Get user's previous attempts
    const userAttempts = await db
      .select({
        submissionId: practiceTestSubmissionsTable.submissionId,
        score: practiceTestSubmissionsTable.score,
        totalPoints: practiceTestSubmissionsTable.totalPoints,
        timeSpent: practiceTestSubmissionsTable.timeSpent,
        submittedAt: practiceTestSubmissionsTable.submittedAt,
      })
      .from(practiceTestSubmissionsTable)
      .where(
        and(
          eq(practiceTestSubmissionsTable.testId, testId),
          eq(practiceTestSubmissionsTable.userId, user.userId)
        )
      )
      .orderBy(desc(practiceTestSubmissionsTable.submittedAt))
      .limit(5);

    // Get quiz statistics
    const [attemptStats] = await db
      .select({
        totalAttempts: count(),
        avgScore: sql`AVG(${practiceTestSubmissionsTable.score})`,
        maxScore: sql`MAX(${practiceTestSubmissionsTable.score})`,
        minScore: sql`MIN(${practiceTestSubmissionsTable.score})`,
      })
      .from(practiceTestSubmissionsTable)
      .where(eq(practiceTestSubmissionsTable.testId, testId));

    // Calculate user's best score
    const userBestScore = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.score)) : 0;
    const userBestScorePercent = userBestScore && quiz.totalQuestions ?
      Math.round((userBestScore / (quiz.totalQuestions * 1)) * 100) : 0; // Assuming 1 point per question

    return NextResponse.json({
      quiz: {
        ...quiz,
        totalQuestions: questions.length, // Use actual count
      },
      questions: formattedQuestions,
      userAttempts,
      userBestScore,
      userBestScorePercent,
      statistics: {
        totalAttempts: attemptStats?.totalAttempts || 0,
        averageScore: attemptStats?.avgScore || 0,
        highScore: attemptStats?.maxScore || 0,
        lowScore: attemptStats?.minScore || 0,
      },
      canTakeQuiz: quiz.isPublic || quiz.createdBy === user.userId,
      hasAttempted: userAttempts.length > 0,
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update or delete a quiz (for creators)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
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

    const { testId } = await params;
    const body = await request.json();

    // Check if user owns the quiz
    const [quiz] = await db
      .select()
      .from(practiceTestsTable)
      .where(
        and(
          eq(practiceTestsTable.testId, testId),
          eq(practiceTestsTable.userId, user.userId)
        )
      )
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Update quiz
    const { title, description, difficulty, timeLimit, isPublic } = body;

    const [updatedQuiz] = await db
      .update(practiceTestsTable)
      .set({
        title: title || quiz.title,
        description: description || quiz.description,
        difficulty: difficulty || quiz.difficulty,
        timeLimit: timeLimit || quiz.timeLimit,
        isPublic: isPublic !== undefined ? isPublic : quiz.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(practiceTestsTable.testId, testId))
      .returning();

    return NextResponse.json({
      quiz: updatedQuiz,
      message: 'Quiz updated successfully',
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
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

    const { testId } = await params;

    // Check if user owns the quiz
    const [quiz] = await db
      .select()
      .from(practiceTestsTable)
      .where(
        and(
          eq(practiceTestsTable.testId, testId),
          eq(practiceTestsTable.userId, user.userId)
        )
      )
      .limit(1);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    // Delete quiz (cascade will handle questions and submissions)
    await db
      .delete(practiceTestsTable)
      .where(eq(practiceTestsTable.testId, testId));

    return NextResponse.json({
      message: 'Quiz deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 