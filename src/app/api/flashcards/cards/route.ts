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
        createdAt: flashcardsTable.createdAt,
        updatedAt: flashcardsTable.updatedAt
      })
      .from(flashcardsTable)
      .where(eq(flashcardsTable.userId, user.userId))
      .orderBy(flashcardsTable.createdAt);

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

    const { question, answer } = await request.json();

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const [card] = await db
      .insert(flashcardsTable)
      .values({
        userId: user.userId,
        question: question.trim(),
        answer: answer.trim()
      })
      .returning({
        cardId: flashcardsTable.cardId,
        question: flashcardsTable.question,
        answer: flashcardsTable.answer,
        createdAt: flashcardsTable.createdAt,
        updatedAt: flashcardsTable.updatedAt
      });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}