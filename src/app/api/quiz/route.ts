import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  practiceTestsTable,
  testQuestionsTable,
  usersTable,
  subjectsTable,
  topicsTable,
  quizCategoriesTable
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

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
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query conditions
    let whereConditions = [eq(practiceTestsTable.isPublic, true)];

    if (subjectId) {
      whereConditions.push(eq(practiceTestsTable.subjectId, subjectId));
    }

    if (topicId) {
      whereConditions.push(eq(practiceTestsTable.topicId, topicId));
    }

    if (difficulty) {
      whereConditions.push(eq(practiceTestsTable.difficulty, difficulty as any));
    }

    // Get available quizzes with subject and topic info
    const quizzes = await db
      .select({
        testId: practiceTestsTable.testId,
        title: practiceTestsTable.title,
        description: practiceTestsTable.description,
        difficulty: practiceTestsTable.difficulty,
        totalQuestions: practiceTestsTable.totalQuestions,
        timeLimit: practiceTestsTable.timeLimit,
        createdAt: practiceTestsTable.createdAt,
        subjectName: subjectsTable.name,
        subjectColor: subjectsTable.color,
        topicName: topicsTable.name,
        creatorName: usersTable.fullName,
      })
      .from(practiceTestsTable)
      .leftJoin(subjectsTable, eq(practiceTestsTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(practiceTestsTable.topicId, topicsTable.topicId))
      .leftJoin(usersTable, eq(practiceTestsTable.userId, usersTable.userId))
      .where(and(...whereConditions))
      .orderBy(desc(practiceTestsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Get quiz categories for filtering
    const categories = await db
      .select({
        categoryId: quizCategoriesTable.categoryId,
        name: quizCategoriesTable.name,
        description: quizCategoriesTable.description,
        iconUrl: quizCategoriesTable.iconUrl,
        color: quizCategoriesTable.color,
        difficulty: quizCategoriesTable.difficulty,
        totalQuestions: quizCategoriesTable.totalQuestions,
        averageRating: quizCategoriesTable.averageRating,
        subjectName: subjectsTable.name,
        topicName: topicsTable.name,
      })
      .from(quizCategoriesTable)
      .leftJoin(subjectsTable, eq(quizCategoriesTable.subjectId, subjectsTable.subjectId))
      .leftJoin(topicsTable, eq(quizCategoriesTable.topicId, topicsTable.topicId))
      .where(eq(quizCategoriesTable.isActive, true))
      .orderBy(quizCategoriesTable.name);

    // Get subjects for filtering
    const subjects = await db
      .select({
        subjectId: subjectsTable.subjectId,
        name: subjectsTable.name,
        color: subjectsTable.color,
        iconUrl: subjectsTable.iconUrl,
      })
      .from(subjectsTable)
      .where(eq(subjectsTable.isActive, true))
      .orderBy(subjectsTable.name);

    return NextResponse.json({
      quizzes,
      categories,
      subjects,
      pagination: {
        limit,
        offset,
        total: quizzes.length,
      }
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
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

    const body = await request.json();
    const { title, description, subjectId, topicId, difficulty, timeLimit, questions } = body;

    // Validate required fields
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Title and questions are required' }, { status: 400 });
    }

    // Create the quiz
    const [quiz] = await db
      .insert(practiceTestsTable)
      .values({
        userId: user.userId,
        title,
        description,
        subjectId: subjectId || null,
        topicId: topicId || null,
        difficulty: difficulty || 'beginner',
        timeLimit: timeLimit || null,
        totalQuestions: questions.length,
        isPublic: true,
      })
      .returning();

    // Insert questions
    const questionValues = questions.map((q: any, index: number) => ({
      testId: quiz.testId,
      question: q.question,
      options: q.options ? JSON.stringify(q.options) : null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      points: q.points || 1,
      orderIndex: index,
    }));

    await db.insert(testQuestionsTable).values(questionValues);

    return NextResponse.json({ quiz, message: 'Quiz created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 