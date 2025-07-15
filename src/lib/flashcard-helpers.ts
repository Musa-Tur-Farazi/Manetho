import { db } from '@/db';
import { flashcardDecksTable, flashcardsTable, usersTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface CreateDeckData {
  userId: string;
  title: string;
  description?: string;
  subjectId?: string;
  topicId?: string;
  isPublic?: boolean;
}

export interface CreateCardData {
  deckId: string;
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex?: number;
}

export async function getUserInternalId(clerkId: string): Promise<string | null> {
  try {
    const users = await db.select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId));

    return users.length > 0 ? users[0].userId : null;
  } catch (error) {
    console.error('Error getting user internal ID:', error);
    return null;
  }
}

export async function createFlashcardDeck(data: CreateDeckData) {
  try {
    const deck = await db.insert(flashcardDecksTable).values({
      userId: data.userId,
      title: data.title,
      description: data.description || '',
      subjectId: data.subjectId || null,
      topicId: data.topicId || null,
      isPublic: data.isPublic || false,
      totalCards: 0,
    }).returning();

    return deck[0];
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    throw error;
  }
}

export async function getUserFlashcardDecks(userId: string) {
  try {
    const decks = await db.select({
      deckId: flashcardDecksTable.deckId,
      title: flashcardDecksTable.title,
      description: flashcardDecksTable.description,
      totalCards: flashcardDecksTable.totalCards,
      isPublic: flashcardDecksTable.isPublic,
      createdAt: flashcardDecksTable.createdAt,
      updatedAt: flashcardDecksTable.updatedAt,
    }).from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, userId))
      .orderBy(flashcardDecksTable.createdAt);

    return decks;
  } catch (error) {
    console.error('Error fetching user flashcard decks:', error);
    throw error;
  }
}

export async function getFlashcardDeck(deckId: string, userId: string) {
  try {
    const deck = await db.select()
      .from(flashcardDecksTable)
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, userId)
      ));

    return deck.length > 0 ? deck[0] : null;
  } catch (error) {
    console.error('Error fetching flashcard deck:', error);
    throw error;
  }
}

export async function createFlashcard(data: CreateCardData) {
  try {
    // Get current card count for order index if not provided
    if (data.orderIndex === undefined) {
      const cardCount = await db.select({ count: sql<number>`count(*)` })
        .from(flashcardsTable)
        .where(eq(flashcardsTable.deckId, data.deckId));

      data.orderIndex = cardCount[0].count;
    }

    const card = await db.insert(flashcardsTable).values({
      deckId: data.deckId,
      question: data.question,
      answer: data.answer,
      hint: data.hint || null,
      explanation: data.explanation || null,
      difficulty: data.difficulty,
      orderIndex: data.orderIndex,
    }).returning();

    // Update deck's total cards count
    await db.update(flashcardDecksTable)
      .set({
        totalCards: sql`${flashcardDecksTable.totalCards} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(flashcardDecksTable.deckId, data.deckId));

    return card[0];
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
}

export async function getDeckFlashcards(deckId: string) {
  try {
    const cards = await db.select({
      cardId: flashcardsTable.cardId,
      deckId: flashcardsTable.deckId,
      question: flashcardsTable.question,
      answer: flashcardsTable.answer,
      hint: flashcardsTable.hint,
      explanation: flashcardsTable.explanation,
      difficulty: flashcardsTable.difficulty,
      orderIndex: flashcardsTable.orderIndex,
      timesReviewed: flashcardsTable.timesReviewed,
      correctAnswers: flashcardsTable.correctAnswers,
      lastReviewed: flashcardsTable.lastReviewed,
      createdAt: flashcardsTable.createdAt,
    }).from(flashcardsTable)
      .where(eq(flashcardsTable.deckId, deckId))
      .orderBy(flashcardsTable.orderIndex, flashcardsTable.createdAt);

    return cards;
  } catch (error) {
    console.error('Error fetching deck flashcards:', error);
    throw error;
  }
}

export async function updateFlashcardStats(cardId: string, correct: boolean) {
  try {
    await db.update(flashcardsTable)
      .set({
        timesReviewed: sql`${flashcardsTable.timesReviewed} + 1`,
        correctAnswers: correct ? sql`${flashcardsTable.correctAnswers} + 1` : flashcardsTable.correctAnswers,
        lastReviewed: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(flashcardsTable.cardId, cardId));
  } catch (error) {
    console.error('Error updating flashcard stats:', error);
    throw error;
  }
}

export async function deleteFlashcard(cardId: string, deckId: string) {
  try {
    await db.delete(flashcardsTable)
      .where(eq(flashcardsTable.cardId, cardId));

    // Update deck's total cards count
    await db.update(flashcardDecksTable)
      .set({
        totalCards: sql`${flashcardDecksTable.totalCards} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(flashcardDecksTable.deckId, deckId));
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }
}

export async function deleteFlashcardDeck(deckId: string, userId: string) {
  try {
    // Delete all cards in the deck first
    await db.delete(flashcardsTable)
      .where(eq(flashcardsTable.deckId, deckId));

    // Delete the deck
    await db.delete(flashcardDecksTable)
      .where(and(
        eq(flashcardDecksTable.deckId, deckId),
        eq(flashcardDecksTable.userId, userId)
      ));
  } catch (error) {
    console.error('Error deleting flashcard deck:', error);
    throw error;
  }
} 