import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardDecksTable, flashcardsTable, usersTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET - Get all user's decks with card counts
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

    // Get decks with card counts
    const decks = await db
      .select({
        deckId: flashcardDecksTable.deckId,
        name: flashcardDecksTable.name,
        description: flashcardDecksTable.description,
        color: flashcardDecksTable.color,
        isPublic: flashcardDecksTable.isPublic,
        cardCount: sql<number>`COALESCE(${flashcardDecksTable.cardCount}, 0)`,
        createdAt: flashcardDecksTable.createdAt,
        updatedAt: flashcardDecksTable.updatedAt,
      })
      .from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, user.userId))
      .orderBy(flashcardDecksTable.createdAt);

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcard decks' }, { status: 500 });
  }
}

// POST - Create a new deck
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

    const { name, description, color = '#3B82F6', isPublic = false } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    const [deck] = await db
      .insert(flashcardDecksTable)
      .values({
        userId: user.userId,
        name: name.trim(),
        description: description?.trim() || null,
        color,
        isPublic,
        cardCount: 0,
      })
      .returning();

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    return NextResponse.json({ error: 'Failed to create flashcard deck' }, { status: 500 });
  }
} 