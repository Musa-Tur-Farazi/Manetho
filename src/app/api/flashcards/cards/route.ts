import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardsTable, usersTable, flashcardDecksTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
        updatedAt: flashcardsTable.updatedAt,
        deckId: flashcardsTable.deckId,
        deckName: flashcardDecksTable.name,
        deckColor: flashcardDecksTable.color
      })
      .from(flashcardsTable)
      .leftJoin(flashcardDecksTable, eq(flashcardsTable.deckId, flashcardDecksTable.deckId))
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
      contentSource = 'user_created',
      deckId
    } = await request.json();

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const [card] = await db
      .insert(flashcardsTable)
      .values({
        userId: user.userId,
        deckId: deckId || null,
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

export async function PATCH(request: NextRequest) {
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
      cardId,
      deckId,
      question,
      answer,
      hint,
      explanation,
      difficulty
    } = await request.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // Build update object with only provided fields
    const updateData: any = { updatedAt: new Date() };
    
    if (deckId !== undefined) updateData.deckId = deckId || null;
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (hint !== undefined) updateData.hint = hint?.trim() || null;
    if (explanation !== undefined) updateData.explanation = explanation?.trim() || null;
    if (difficulty !== undefined) updateData.difficulty = difficulty;

    const [updatedCard] = await db
      .update(flashcardsTable)
      .set(updateData)
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .returning({
        cardId: flashcardsTable.cardId,
        question: flashcardsTable.question,
        answer: flashcardsTable.answer,
        hint: flashcardsTable.hint,
        explanation: flashcardsTable.explanation,
        difficulty: flashcardsTable.difficulty,
        deckId: flashcardsTable.deckId,
        createdAt: flashcardsTable.createdAt,
        updatedAt: flashcardsTable.updatedAt
      });

    if (!updatedCard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}