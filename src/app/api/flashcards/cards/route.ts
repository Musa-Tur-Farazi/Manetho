import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardsTable, flashcardDecksTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's internal ID
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userInternalId = users[0].userId;

    // Get or create default deck for user
    let defaultDeck = await db.select().from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, userInternalId))
      .limit(1);

    if (defaultDeck.length === 0) {
      // Create default deck
      defaultDeck = await db.insert(flashcardDecksTable).values({
        userId: userInternalId,
        title: 'My Flashcards',
        description: 'Default flashcard collection',
        totalCards: 0,
      }).returning();
    }

    // Fetch all cards for the user's default deck
    const cards = await db.select({
      cardId: flashcardsTable.cardId,
      question: flashcardsTable.question,
      answer: flashcardsTable.answer,
      createdAt: flashcardsTable.createdAt,
    }).from(flashcardsTable)
      .where(eq(flashcardsTable.deckId, defaultDeck[0].deckId))
      .orderBy(flashcardsTable.createdAt);

    return NextResponse.json({
      success: true,
      cards: cards.map(card => ({
        ...card,
        createdAt: card.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    // Get user's internal ID
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userInternalId = users[0].userId;

    // Get or create default deck for user
    let defaultDeck = await db.select().from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, userInternalId))
      .limit(1);

    if (defaultDeck.length === 0) {
      // Create default deck
      defaultDeck = await db.insert(flashcardDecksTable).values({
        userId: userInternalId,
        title: 'My Flashcards',
        description: 'Default flashcard collection',
        totalCards: 0,
      }).returning();
    }

    // Create new card in default deck
    const newCard = await db.insert(flashcardsTable).values({
      deckId: defaultDeck[0].deckId,
      question: question.trim(),
      answer: answer.trim(),
      orderIndex: 0,
    }).returning({
      cardId: flashcardsTable.cardId,
      question: flashcardsTable.question,
      answer: flashcardsTable.answer,
      createdAt: flashcardsTable.createdAt,
    });

    return NextResponse.json({
      success: true,
      card: {
        ...newCard[0],
        createdAt: newCard[0].createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 