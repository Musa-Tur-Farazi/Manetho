import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardsTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
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

    const cards = await db
      .select({
        cardId: flashcardsTable.cardId,
        question: flashcardsTable.question,
        answer: flashcardsTable.answer,
        hint: flashcardsTable.hint,
        explanation: flashcardsTable.explanation,
        difficulty: flashcardsTable.difficulty,
        orderIndex: flashcardsTable.orderIndex,
        contentSource: flashcardsTable.contentSource,
        aiConfidenceScore: flashcardsTable.aiConfidenceScore,
        userRating: flashcardsTable.userRating,
        timesReviewed: flashcardsTable.timesReviewed,
        correctAnswers: flashcardsTable.correctAnswers,
        lastReviewed: flashcardsTable.lastReviewed,
        needsReview: flashcardsTable.needsReview,
        createdAt: flashcardsTable.createdAt,
        updatedAt: flashcardsTable.updatedAt
      })
      .from(flashcardsTable)
      .where(eq(flashcardsTable.userId, user.userId))
      .orderBy(flashcardsTable.orderIndex, flashcardsTable.createdAt);

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
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

    const { 
      question, 
      answer, 
      hint, 
      explanation, 
      difficulty = 'beginner', 
      orderIndex = 0,
      contentSource = 'user_created' 
    } = await request.json();

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const [card] = await db
      .insert(flashcardsTable)
      .values({
        userId: user.userId,
        question: question.trim(),
        answer: answer.trim(),
        hint: hint?.trim() || null,
        explanation: explanation?.trim() || null,
        difficulty,
        orderIndex,
        contentSource,
        timesReviewed: 0,
        correctAnswers: 0,
        needsReview: false
      })
      .returning({
        cardId: flashcardsTable.cardId,
        question: flashcardsTable.question,
        answer: flashcardsTable.answer,
        hint: flashcardsTable.hint,
        explanation: flashcardsTable.explanation,
        difficulty: flashcardsTable.difficulty,
        orderIndex: flashcardsTable.orderIndex,
        contentSource: flashcardsTable.contentSource,
        createdAt: flashcardsTable.createdAt,
        updatedAt: flashcardsTable.updatedAt
      });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}