import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { flashcardDecksTable, flashcardsTable, usersTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// GET - Get a specific deck with its cards
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { deckId } = await params;

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

    // Get deck info
    const [deck] = await db
      .select()
      .from(flashcardDecksTable)
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, user.userId)
      ))
      .limit(1);

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get cards in the deck
    const cards = await db
      .select()
      .from(flashcardsTable)
      .where(and(
        eq(flashcardsTable.deckId, deckId),
        eq(flashcardsTable.userId, user.userId)
      ))
      .orderBy(flashcardsTable.orderIndex, flashcardsTable.createdAt);

    return NextResponse.json({
      ...deck,
      cards
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}

// PUT - Update a deck
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { deckId } = await params;

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

    const { name, description, color, isPublic } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
    }

    const [updatedDeck] = await db
      .update(flashcardDecksTable)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        isPublic: isPublic || false,
        updatedAt: new Date()
      })
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, user.userId)
      ))
      .returning();

    if (!updatedDeck) {
      return NextResponse.json({ error: 'Deck not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

// DELETE - Delete a deck and all its cards
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { deckId } = await params;

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

    // Delete the deck (cards will be deleted automatically due to cascade)
    const [deletedDeck] = await db
      .delete(flashcardDecksTable)
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, user.userId)
      ))
      .returning({ deckId: flashcardDecksTable.deckId });

    if (!deletedDeck) {
      return NextResponse.json({ error: 'Deck not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deck deleted successfully', deckId: deletedDeck.deckId });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
} 