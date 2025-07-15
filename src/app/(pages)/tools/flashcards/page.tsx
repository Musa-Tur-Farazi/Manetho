"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

interface Flashcard {
  cardId: string;
  question: string;
  answer: string;
}

export default function FlashcardsPage() {
  const { user } = useUser();
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const [cardForm, setCardForm] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/flashcards/cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/flashcards/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardForm),
      });

      if (response.ok) {
        const data = await response.json();
        setCards([...cards, data.card]);
        setCardForm({ question: '', answer: '' });
        setShowCreateCard(false);
      }
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">Please sign in to access flashcards.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Flashcards" description="Create and study flashcards" />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button onClick={() => setShowCreateCard(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        {showCreateCard && (
          <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800">
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea
                  value={cardForm.question}
                  onChange={(e) => setCardForm({ ...cardForm, question: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer</label>
                <textarea
                  value={cardForm.answer}
                  onChange={(e) => setCardForm({ ...cardForm, answer: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Card'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateCard(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.cardId}
              className="border rounded-lg p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleCard(card.cardId)}
            >
              <div className="flex justify-end items-start mb-2">
                <button className="text-gray-500 hover:text-gray-700">
                  {flippedCards.has(card.cardId) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="min-h-[100px]">
                {!flippedCards.has(card.cardId) ? (
                  <div>
                    <p className="font-medium text-sm mb-2">Question:</p>
                    <p className="text-sm">{card.question}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-sm mb-2">Answer:</p>
                    <p className="text-sm">{card.answer}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No flashcards yet. Click "Add Card" to create your first one!
            </p>
          </div>
        )}
      </div>
    </>
  );
} 