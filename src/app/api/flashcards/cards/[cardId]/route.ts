import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Get a specific flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { cardId } = await params;

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

    const [card] = await db
      .select()
      .from(flashcardsTable)
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .limit(1);

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcard' }, { status: 500 });
  }
}

// PUT - Update a flashcard
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { cardId } = await params;

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
      difficulty,
      orderIndex,
      userRating
    } = await request.json();

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const [updatedCard] = await db
      .update(flashcardsTable)
      .set({
        question: question.trim(),
        answer: answer.trim(),
        hint: hint?.trim() || null,
        explanation: explanation?.trim() || null,
        difficulty: difficulty || 'beginner',
        orderIndex: orderIndex || 0,
        userRating: userRating || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .returning();

    if (!updatedCard) {
      return NextResponse.json({ error: 'Flashcard not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
  }
}

// DELETE - Delete a flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { cardId } = await params;

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

    const [deletedCard] = await db
      .delete(flashcardsTable)
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .returning({ cardId: flashcardsTable.cardId });

    if (!deletedCard) {
      return NextResponse.json({ error: 'Flashcard not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Flashcard deleted successfully', cardId: deletedCard.cardId });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }
}

// PATCH - Update review status (for study mode)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { cardId } = await params;

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

    const { isCorrect, reviewTime } = await request.json();

    if (typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'isCorrect must be a boolean' }, { status: 400 });
    }

    // Get current card data
    const [currentCard] = await db
      .select({
        timesReviewed: flashcardsTable.timesReviewed,
        correctAnswers: flashcardsTable.correctAnswers
      })
      .from(flashcardsTable)
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .limit(1);

    if (!currentCard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // Update review statistics
    const [updatedCard] = await db
      .update(flashcardsTable)
      .set({
        timesReviewed: currentCard.timesReviewed + 1,
        correctAnswers: isCorrect ? currentCard.correctAnswers + 1 : currentCard.correctAnswers,
        lastReviewed: new Date(),
        needsReview: !isCorrect, // Mark for review if answered incorrectly
        updatedAt: new Date()
      })
      .where(and(
        eq(flashcardsTable.cardId, cardId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .returning();

    if (!updatedCard) {
      return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
      accuracy: updatedCard.timesReviewed > 0 ? (updatedCard.correctAnswers / updatedCard.timesReviewed) : 0
    });

  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
} 