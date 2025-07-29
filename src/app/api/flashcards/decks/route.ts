import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardDecksTable, usersTable, flashcardsTable } from '@/db/schema';
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

    const decks = await db
      .select({
        deckId: flashcardDecksTable.deckId,
        name: flashcardDecksTable.name,
        description: flashcardDecksTable.description,
        color: flashcardDecksTable.color,
        isPublic: flashcardDecksTable.isPublic,
        cardCount: flashcardDecksTable.cardCount,
        createdAt: flashcardDecksTable.createdAt,
        updatedAt: flashcardDecksTable.updatedAt
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
      name, 
      description, 
      color = '#3B82F6', 
      isPublic = false 
    } = await request.json();

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
        cardCount: 0
      })
      .returning({
        deckId: flashcardDecksTable.deckId,
        name: flashcardDecksTable.name,
        description: flashcardDecksTable.description,
        color: flashcardDecksTable.color,
        isPublic: flashcardDecksTable.isPublic,
        cardCount: flashcardDecksTable.cardCount,
        createdAt: flashcardDecksTable.createdAt,
        updatedAt: flashcardDecksTable.updatedAt
      });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    return NextResponse.json({ error: 'Failed to create flashcard deck' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      deckId,
      name, 
      description, 
      color,
      isPublic
    } = await request.json();

    if (!deckId || !name?.trim()) {
      return NextResponse.json({ error: 'Deck ID and name are required' }, { status: 400 });
    }

    const [deck] = await db
      .update(flashcardDecksTable)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        color,
        isPublic,
        updatedAt: new Date()
      })
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, user.userId)
      ))
      .returning({
        deckId: flashcardDecksTable.deckId,
        name: flashcardDecksTable.name,
        description: flashcardDecksTable.description,
        color: flashcardDecksTable.color,
        isPublic: flashcardDecksTable.isPublic,
        cardCount: flashcardDecksTable.cardCount,
        createdAt: flashcardDecksTable.createdAt,
        updatedAt: flashcardDecksTable.updatedAt
      });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error updating flashcard deck:', error);
    return NextResponse.json({ error: 'Failed to update flashcard deck' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { deckId } = await request.json();

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    // First, move all cards in this deck to ungrouped (set deckId to null)
    await db
      .update(flashcardsTable)
      .set({ deckId: null, updatedAt: new Date() })
      .where(and(
        eq(flashcardsTable.deckId, deckId),
        eq(flashcardsTable.userId, user.userId)
      ));

    // Then delete the deck
    const [deletedDeck] = await db
      .delete(flashcardDecksTable)
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, user.userId)
      ))
      .returning({
        deckId: flashcardDecksTable.deckId,
        name: flashcardDecksTable.name
      });

    if (!deletedDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Deck deleted successfully',
      deckName: deletedDeck.name,
      movedCardsToUngrouped: true
    });
  } catch (error) {
    console.error('Error deleting flashcard deck:', error);
    return NextResponse.json({ error: 'Failed to delete flashcard deck' }, { status: 500 });
  }
} 