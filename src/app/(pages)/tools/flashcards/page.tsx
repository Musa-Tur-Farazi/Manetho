'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';

interface Flashcard {
  cardId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export default function FlashcardsPage() {
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [cardForm, setCardForm] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchCards();
    }
  }, [isLoaded, user]);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/flashcards/cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.question.trim() || !cardForm.answer.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/flashcards/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardForm),
      });

      if (response.ok) {
        const newCard = await response.json();
        setCards([...cards, newCard]);
        setCardForm({ question: '', answer: '' });
      }
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to access flashcards.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

      <div className="max-w-4xl mx-auto p-6">
        {/* Create Card Form */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Flashcard</h2>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <textarea
                value={cardForm.question}
                onChange={(e) => setCardForm({ ...cardForm, question: e.target.value })}
                placeholder="Enter your question..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Answer</label>
              <textarea
                value={cardForm.answer}
                onChange={(e) => setCardForm({ ...cardForm, answer: e.target.value })}
                placeholder="Enter the answer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={creating || !cardForm.question.trim() || !cardForm.answer.trim()}
              className="w-full"
            >
              {creating ? 'Creating...' : 'Create Flashcard'}
            </Button>
          </form>
        </Card>

        {/* Cards Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Flashcards ({cards.length})</h2>

          {loading ? (
            <div className="text-center py-8">Loading flashcards...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flashcards yet. Create your first one above!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card
                  key={card.cardId}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => toggleCard(card.cardId)}
                >
                  <div className="min-h-[120px] flex flex-col">
                    <div className="flex-1">
                      {flippedCards.has(card.cardId) ? (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Answer:</div>
                          <div className="text-gray-800 dark:text-gray-200">{card.answer}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Question:</div>
                          <div className="text-gray-800 dark:text-gray-200">{card.question}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm">
                        {flippedCards.has(card.cardId) ? 'Show Question' : 'Show Answer'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}