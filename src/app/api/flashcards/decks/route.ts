import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardDecksTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Fetch user's flashcard decks
    const decks = await db.select({
      deckId: flashcardDecksTable.deckId,
      title: flashcardDecksTable.title,
      description: flashcardDecksTable.description,
      totalCards: flashcardDecksTable.totalCards,
      createdAt: flashcardDecksTable.createdAt,
    }).from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, userInternalId))
      .orderBy(flashcardDecksTable.createdAt);

    return NextResponse.json({
      success: true,
      decks: decks.map(deck => ({
        ...deck,
        createdAt: deck.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get user's internal ID
    const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userInternalId = users[0].userId;

    // Create new deck
    const newDeck = await db.insert(flashcardDecksTable).values({
      userId: userInternalId,
      title: title.trim(),
      description: description?.trim() || '',
      totalCards: 0,
    }).returning({
      deckId: flashcardDecksTable.deckId,
      title: flashcardDecksTable.title,
      description: flashcardDecksTable.description,
      totalCards: flashcardDecksTable.totalCards,
      createdAt: flashcardDecksTable.createdAt,
    });

    return NextResponse.json({
      success: true,
      deck: {
        ...newDeck[0],
        createdAt: newDeck[0].createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 