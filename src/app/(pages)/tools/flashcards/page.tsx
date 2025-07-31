"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Removed unused import
import {
  BookOpen,
  Plus,
  Brain,
  Edit,
  Trash2,
  Play,
  Star,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  Sparkles,
  BookMarked,
  Eye,
  EyeOff,
  X,
  Save,
  Settings,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
// Removed unused import
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface Flashcard {
  cardId: string;
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
  contentSource: string;
  timesReviewed: number;
  correctAnswers: number;
  lastReviewed?: string;
  needsReview: boolean;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
  deckId?: string;
  deckName?: string;
  deckColor?: string;
}

interface FlashcardDeck {
  deckId: string;
  name: string;
  description?: string;
  color: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StudySession {
  currentIndex: number;
  showAnswer: boolean;
  sessionStartTime: Date;
  correctCount: number;
  totalAnswered: number;
  timeSpent: number;
}

interface CreateFlashcardForm {
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: 'beginner';
  deckId: string;
}

interface CreateDeckForm {
  name: string;
  description: string;
  color: string;
  isPublic: boolean;
}

interface AIGenerateForm {
  topic: string;
  subject: string;
  difficulty: 'beginner';
  count: number;
  additionalContext: string;
}

const FlashcardPage = () => {
  // Removed unused variables
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'library' | 'create' | 'generate' | 'study' | 'manage-decks'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'difficulty' | 'performance'>('recent');

  // Create form state
  const [createForm, setCreateForm] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    difficulty: 'beginner' as const,
    deckId: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Deck management state
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [createDeckForm, setCreateDeckForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isPublic: false
  });
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [showMoveCardsModal, setShowMoveCardsModal] = useState(false);
  const [selectedDeckForMove, setSelectedDeckForMove] = useState<string>('');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isMovingCards, setIsMovingCards] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [editDeckForm, setEditDeckForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isPublic: false
  });
  const [isUpdatingDeck, setIsUpdatingDeck] = useState(false);

  // AI generation state
  const [aiForm, setAiForm] = useState({
    topic: '',
    subject: '',
    difficulty: 'beginner' as const,
    count: 1,
    additionalContext: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Study mode state
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);

  // Edit state
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Fetch flashcards
  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards/cards');
      if (response.ok) {
        const cards = await response.json();
        setFlashcards(cards);
      } else {
        toast.error('Failed to fetch flashcards');
      }
    } catch {
      toast.error('Error fetching flashcards');
    } finally {
      setLoading(false);
    }
  };

  // Fetch decks
  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/flashcards/decks');
      if (response.ok) {
        const deckData = await response.json();
        setDecks(deckData);
      } else {
        toast.error('Failed to fetch decks');
      }
    } catch {
      toast.error('Error fetching decks');
    }
  };

  useEffect(() => {
    fetchFlashcards();
    fetchDecks();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const createParam = searchParams.get('create');
    const generateParam = searchParams.get('generate');
    const studyParam = searchParams.get('study');
    const manageDecksParam = searchParams.get('manage-decks');

    if (createParam === 'true') {
      setView('create');
    } else if (generateParam === 'true') {
      setView('generate');
    } else if (studyParam === 'true') {
      setView('study');
    } else if (manageDecksParam === 'true') {
      setView('manage-decks');
    } else {
      setView('library');
    }
  }, [searchParams]);

  // Create deck
  const createDeck = async () => {
    if (!createDeckForm.name.trim()) {
      toast.error('Deck name is required');
      return;
    }

    if (isCreatingDeck) {
      return; // Prevent duplicate submissions
    }

    setIsCreatingDeck(true);
    try {
      const response = await fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createDeckForm)
      });

      if (response.ok) {
        const newDeck = await response.json();
        setDecks(prev => [newDeck, ...prev]);
        setCreateDeckForm({ name: '', description: '', color: '#3B82F6', isPublic: false });
        toast.success('Deck created successfully!');
        setShowCreateDeckModal(false);
      } else {
        toast.error('Failed to create deck');
      }
    } catch {
      toast.error('Error creating deck');
    } finally {
      setIsCreatingDeck(false);
    }
  };

  // Delete deck
  const deleteDeck = async (deckId: string, deckName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${deckName}"?\n\nAll flashcards in this deck will be moved to ungrouped.`);
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch('/api/flashcards/decks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId })
      });

      if (response.ok) {
        const result = await response.json();
        setDecks(prev => prev.filter(deck => deck.deckId !== deckId));
        toast.success(`${result.deckName} deleted successfully! Cards moved to ungrouped.`);
        fetchFlashcards(); // Refresh flashcards to show updated grouping
      } else {
        toast.error('Failed to delete deck');
      }
    } catch {
      toast.error('Error deleting deck');
    }
  };

  // Edit deck
  const startEditDeck = (deck: FlashcardDeck) => {
    setEditingDeck(deck);
    setEditDeckForm({
      name: deck.name,
      description: deck.description || '',
      color: deck.color,
      isPublic: deck.isPublic
    });
    setShowEditDeckModal(true);
  };

  // Update deck
  const updateDeck = async () => {
    if (!editDeckForm.name.trim()) {
      toast.error('Deck name is required');
      return;
    }

    if (!editingDeck) {
      return;
    }

    if (isUpdatingDeck) {
      return; // Prevent duplicate submissions
    }

    setIsUpdatingDeck(true);
    try {
      const response = await fetch('/api/flashcards/decks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: editingDeck.deckId,
          ...editDeckForm
        })
      });

      if (response.ok) {
        const updatedDeck = await response.json();
        setDecks(prev => prev.map(deck => 
          deck.deckId === editingDeck.deckId ? updatedDeck : deck
        ));
        toast.success('Deck updated successfully!');
        setShowEditDeckModal(false);
        setEditingDeck(null);
      } else {
        toast.error('Failed to update deck');
      }
    } catch {
      toast.error('Error updating deck');
    } finally {
      setIsUpdatingDeck(false);
    }
  };

  // Move selected cards to deck
  const moveCardsToDecks = async () => {
    if (selectedCards.size === 0) {
      toast.error('Please select cards to move');
      return;
    }

    if (isMovingCards) {
      return;
    }

    setIsMovingCards(true);
    try {
      const movePromises = Array.from(selectedCards).map(cardId =>
        fetch('/api/flashcards/cards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cardId, 
            deckId: selectedDeckForMove || null 
          })
        })
      );

      const results = await Promise.all(movePromises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount === selectedCards.size) {
        toast.success(`${successCount} cards moved successfully!`);
        setSelectedCards(new Set());
        setShowMoveCardsModal(false);
        fetchFlashcards();
        fetchDecks();
      } else {
        toast.error(`Only ${successCount} of ${selectedCards.size} cards moved successfully`);
      }
    } catch {
      toast.error('Error moving cards');
    } finally {
      setIsMovingCards(false);
    }
  };

  // Create flashcard manually
  const createFlashcard = async () => {
    if (!createForm.question.trim() || !createForm.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    if (isCreating) {
      return; // Prevent duplicate submissions
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/flashcards/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          deckId: createForm.deckId || null
        })
      });

      if (response.ok) {
        const newCard = await response.json();
        setFlashcards(prev => [newCard, ...prev]);
        setCreateForm({ question: '', answer: '', hint: '', explanation: '', difficulty: 'beginner', deckId: '' });
        toast.success('Flashcard created successfully!');
        setView('library');
        fetchDecks(); // Refresh deck card counts
      } else {
        toast.error('Failed to create flashcard');
      }
    } catch {
      toast.error('Error creating flashcard');
    } finally {
      setIsCreating(false);
    }
  };

  // Generate flashcards with AI
  const generateFlashcards = async () => {
    if (!aiForm.topic.trim()) {
      toast.error('Topic is required for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm)
      });

      if (response.ok) {
        const result = await response.json();
        setFlashcards(prev => [...result.flashcards, ...prev]);
        setAiForm({ topic: '', subject: '', difficulty: 'beginner', count: 1, additionalContext: '' });
        toast.success(`Generated ${result.count} flashcards successfully!`);
        setView('library');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate flashcards');
      }
    } catch {
      toast.error('Error generating flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete flashcard
  const deleteFlashcard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/flashcards/cards/${cardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFlashcards(prev => prev.filter(card => card.cardId !== cardId));
        toast.success('Flashcard deleted successfully');
      } else {
        toast.error('Failed to delete flashcard');
      }
    } catch {
      toast.error('Error deleting flashcard');
    }
  };

  // Update flashcard
  const updateFlashcard = async (cardId: string, updates: Partial<Flashcard>) => {
    try {
      const response = await fetch(`/api/flashcards/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setFlashcards(prev => prev.map(card =>
          card.cardId === cardId ? updatedCard : card
        ));
        setEditingCard(null);
        toast.success('Flashcard updated successfully');
      } else {
        toast.error('Failed to update flashcard');
      }
    } catch {
      toast.error('Error updating flashcard');
    }
  };

  // Start study session
  const startStudySession = (cards: Flashcard[]) => {
    if (cards.length === 0) {
      toast.error('No flashcards to study');
      return;
    }

    setStudyCards(cards);
    setStudySession({
      currentIndex: 0,
      showAnswer: false,
      sessionStartTime: new Date(),
      correctCount: 0,
      totalAnswered: 0,
      timeSpent: 0
    });
    setView('study');
    // Push a new history entry so that browser back returns to library
    router.push('/tools/flashcards?study=true');
  };

  // Handle study answer
  const handleStudyAnswer = async (isCorrect: boolean) => {
    if (!studySession || !studyCards[studySession.currentIndex]) return;

    const currentCard = studyCards[studySession.currentIndex];

    // Update card statistics
    try {
      await fetch(`/api/flashcards/cards/${currentCard.cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect })
      });
    } catch (error) {
      console.error('Error updating card statistics:', error);
    }

    // Update session state
    setStudySession(prev => prev ? {
      ...prev,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      totalAnswered: prev.totalAnswered + 1,
      currentIndex: prev.currentIndex + 1,
      showAnswer: false
    } : null);

    // Check if session is complete
    if (studySession.currentIndex + 1 >= studyCards.length) {
      const accuracy = ((studySession.correctCount + (isCorrect ? 1 : 0)) / (studySession.totalAnswered + 1)) * 100;
      toast.success(`Study session complete! Accuracy: ${accuracy.toFixed(1)}%`);
      setStudySession(null);
      setView('library');
      router.push('/tools/flashcards');
      fetchFlashcards(); // Refresh to get updated statistics
    }
  };

  // Filter and sort flashcards
  const filteredFlashcards = flashcards
    .filter(card => {
      const matchesSearch = card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = filterDifficulty === 'all' || card.difficulty === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'performance':
          const aAccuracy = a.timesReviewed > 0 ? a.correctAnswers / a.timesReviewed : 0;
          const bAccuracy = b.timesReviewed > 0 ? b.correctAnswers / b.timesReviewed : 0;
          return aAccuracy - bAccuracy;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Group flashcards by deck
  const groupedFlashcards = filteredFlashcards.reduce((groups, card) => {
    const deckId = card.deckId || 'ungrouped';
    const deckName = card.deckName || 'Ungrouped Cards';
    const deckColor = card.deckColor || '#6B7280';
    
    if (!groups[deckId]) {
      groups[deckId] = {
        deckId,
        deckName,
        deckColor,
        cards: []
      };
    }
    groups[deckId].cards.push(card);
    return groups;
  }, {} as Record<string, { deckId: string; deckName: string; deckColor: string; cards: Flashcard[] }>);

  const deckGroups = Object.values(groupedFlashcards);

  // Get study statistics
  const getStudyStats = () => {
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter(card => card.timesReviewed > 0).length;
    const needsReview = flashcards.filter(card => card.needsReview).length;
    const averageAccuracy = flashcards.reduce((acc, card) => {
      if (card.timesReviewed > 0) {
        return acc + (card.correctAnswers / card.timesReviewed);
      }
      return acc;
    }, 0) / (reviewedCards || 1);

    return { totalCards, reviewedCards, needsReview, averageAccuracy };
  };

  const stats = getStudyStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <div className="border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-full mx-auto px-2">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookMarked className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => {
                    setView('library');
                    router.push('/tools/flashcards');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'library'
                    ? 'bg-white/40 dark:bg-gray-600/40 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Library
                </button>
                <button
                  onClick={() => {
                    setView('create');
                    router.push('/tools/flashcards?create=true');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'create'
                    ? 'bg-white/40 dark:bg-gray-600/40 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setView('generate');
                    router.push('/tools/flashcards?generate=true');
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'generate'
                    ? 'bg-white/40 dark:bg-gray-600/40 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  AI Generate
                </button>
                <button
                  onClick={() => setView('manage-decks')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${view === 'manage-decks'
                    ? 'bg-white/40 dark:bg-gray-600/40 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Manage Decks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-full mx-auto px-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalCards}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.reviewedCards}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.needsReview}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Needs Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {(stats.averageAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-2 py-8">
        <AnimatePresence mode="wait">
          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Library Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search flashcards..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'recent' | 'difficulty' | 'performance')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="difficulty">By Difficulty</option>
                      <option value="performance">By Performance</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => startStudySession(filteredFlashcards)}
                    disabled={filteredFlashcards.length === 0}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Study All ({filteredFlashcards.length})
                  </Button>

                  <Button
                    onClick={() => setShowMoveCardsModal(true)}
                    disabled={filteredFlashcards.length === 0}
                    variant="outline"
                    className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Move Cards ({selectedCards.size})
                  </Button>

                  <Button
                    onClick={() => startStudySession(flashcards.filter(card => card.needsReview))}
                    disabled={stats.needsReview === 0}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Review ({stats.needsReview})
                  </Button>
                </div>
              </div>

              {/* Flashcards Grid */}
              {filteredFlashcards.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No flashcards found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {flashcards.length === 0 
                      ? "Create your first flashcard to get started with studying"
                      : "Try adjusting your search or filters to find flashcards"
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setView('create');
                      router.push('/tools/flashcards?create=true');
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Flashcard
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {deckGroups.map((group) => (
                    <div key={group.deckId} className="bg-white/5 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
                      {/* Deck Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.deckColor }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {group.deckName}
                        </h3>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded-full">
                          {group.cards.length} cards
                        </span>
                        <Button
                          onClick={() => startStudySession(group.cards)}
                          size="sm"
                          className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Study Deck
                        </Button>
                      </div>
                      
                      {/* Deck Cards */}
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {group.cards.map((card) => (
                          <FlashcardItem
                            key={card.cardId}
                            card={card}
                            onEdit={setEditingCard}
                            onDelete={deleteFlashcard}
                            onStudy={() => startStudySession([card])}
                            onToggleSelect={(cardId) => {
                              const newSelected = new Set(selectedCards);
                              if (newSelected.has(cardId)) {
                                newSelected.delete(cardId);
                              } else {
                                newSelected.add(cardId);
                              }
                              setSelectedCards(newSelected);
                            }}
                            isSelected={selectedCards.has(card.cardId)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CreateFlashcardForm
                form={createForm}
                setForm={setCreateForm}
                onSubmit={createFlashcard}
                onCancel={() => setView('library')}
                isCreating={isCreating}
                decks={decks}
              />
            </motion.div>
          )}

          {view === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AIGenerateForm
                form={aiForm}
                setForm={setAiForm}
                onSubmit={generateFlashcards}
                onCancel={() => setView('library')}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}

          {view === 'study' && studySession && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StudyMode
                card={studyCards[studySession.currentIndex]}
                session={studySession}
                totalCards={studyCards.length}
                onAnswer={handleStudyAnswer}
                onShowAnswer={() => setStudySession(prev => prev ? { ...prev, showAnswer: true } : null)}
                onExit={() => {
                  setStudySession(null);
                  setView('library');
                  router.push('/tools/flashcards');
                }}
              />
            </motion.div>
          )}

          {view === 'manage-decks' && (
            <motion.div
              key="manage-decks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DeckManagementView
                decks={decks}
                onCreateDeck={() => setShowCreateDeckModal(true)}
                onRefreshDecks={fetchDecks}
                onDeleteDeck={deleteDeck}
                onEditDeck={startEditDeck}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <EditFlashcardModal
          card={editingCard}
          onSave={updateFlashcard}
          onCancel={() => setEditingCard(null)}
        />
      )}

      {/* Create Deck Modal */}
      {showCreateDeckModal && (
        <CreateDeckModal
          form={createDeckForm}
          setForm={setCreateDeckForm}
          onSubmit={createDeck}
          onCancel={() => setShowCreateDeckModal(false)}
          isCreating={isCreatingDeck}
        />
      )}

      {/* Move Cards Modal */}
      {showMoveCardsModal && (
        <MoveCardsModal
          cards={flashcards}
          decks={decks}
          selectedCards={selectedCards}
          onClose={() => {
            setShowMoveCardsModal(false);
            setSelectedCards(new Set());
          }}
          onMoveCards={moveCardsToDecks}
          selectedDeck={selectedDeckForMove}
          setSelectedDeck={setSelectedDeckForMove}
          isMoving={isMovingCards}
        />
      )}

      {/* Edit Deck Modal */}
      {showEditDeckModal && editingDeck && (
        <EditDeckModal
          deck={editingDeck}
          form={editDeckForm}
          setForm={setEditDeckForm}
          onSubmit={updateDeck}
          onCancel={() => {
            setShowEditDeckModal(false);
            setEditingDeck(null);
          }}
          isUpdating={isUpdatingDeck}
        />
      )}
    </div>
  );
};

// Flashcard Item Component
const FlashcardItem = ({ card, onEdit, onDelete, onStudy, onToggleSelect, isSelected }: {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (cardId: string) => void;
  onStudy: () => void;
  onToggleSelect?: (cardId: string) => void;
  isSelected?: boolean;
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const accuracy = card.timesReviewed > 0 ? (card.correctAnswers / card.timesReviewed) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 shadow-emerald-500/20 shadow-sm';
      case 'intermediate': return 'bg-amber-500/20 text-amber-100 border border-amber-500/30 shadow-amber-500/20 shadow-sm';
      case 'advanced': return 'bg-rose-500/20 text-rose-100 border border-rose-500/30 shadow-rose-500/20 shadow-sm';
      default: return 'bg-slate-500/20 text-slate-100 border border-slate-500/30 shadow-slate-500/20 shadow-sm';
    }
  };

  return (
    <div className={`bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
      <div className="p-4">
        {onToggleSelect && (
          <div className="flex justify-end mb-2">
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={() => onToggleSelect(card.cardId)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
            {card.difficulty}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(card)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Edit flashcard"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(card.cardId)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete flashcard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Question:</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">{card.question}</p>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-2 text-indigo-400 dark:text-indigo-300 hover:text-indigo-300 dark:hover:text-indigo-200 text-sm font-medium hover:bg-indigo-500/10 px-2 py-1 rounded-md transition-colors"
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer && (
            <div className="mt-2 p-3 bg-indigo-500/10 dark:bg-indigo-500/5 backdrop-blur-sm rounded-md border border-indigo-500/20">
              <p className="text-gray-100 dark:text-gray-200 text-sm">{card.answer}</p>
              {card.explanation && (
                <div className="mt-2 pt-2 border-t border-indigo-400/30 dark:border-indigo-500/30">
                  <p className="text-gray-300 dark:text-gray-400 text-xs">{card.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>Reviewed: {card.timesReviewed} times</span>
          {card.timesReviewed > 0 && (
            <span>Accuracy: {accuracy.toFixed(1)}%</span>
          )}
        </div>

        <Button
          onClick={onStudy}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Study This Card
        </Button>
      </div>
    </div>
  );
};

// Create Flashcard Form Component
const CreateFlashcardForm = ({ form, setForm, onSubmit, onCancel, isCreating, decks }: {
  form: CreateFlashcardForm;
  setForm: (form: CreateFlashcardForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isCreating: boolean;
  decks: FlashcardDeck[];
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Flashcard</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your question here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer *
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter the answer here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={form.hint}
              onChange={(e) => setForm({ ...form, hint: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Optional hint to help with recall..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Optional detailed explanation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={form.difficulty}
              onChange={() => setForm({ ...form, difficulty: 'beginner' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck
            </label>
            <select
              value={form.deckId}
              onChange={(e) => setForm({ ...form, deckId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a deck</option>
              {decks.map((deck) => (
                <option key={deck.deckId} value={deck.deckId}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onSubmit}
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create Flashcard'}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Generate Form Component
const AIGenerateForm = ({ form, setForm, onSubmit, onCancel, isGenerating }: {
  form: AIGenerateForm;
  setForm: (form: AIGenerateForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isGenerating: boolean;
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Generate Flashcards</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Let AI create personalized flashcards for any topic you want to study
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 'French Revolution', 'JavaScript Arrays', 'Photosynthesis'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 'History', 'Computer Science', 'Biology'"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={form.difficulty}
                onChange={() => setForm({ ...form, difficulty: 'beginner' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Cards
              </label>
              <select
                value={form.count}
                onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={1}>1 Card</option>
                <option value={2}>2 Cards</option>
                <option value={3}>3 Cards</option>
                <option value={4}>4 Cards</option>
                <option value={5}>5 Cards</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={form.additionalContext}
              onChange={(e) => setForm({ ...form, additionalContext: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Any specific focus areas, learning objectives, or context you'd like to include..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onSubmit}
              disabled={isGenerating || !form.topic.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Study Mode Component
const StudyMode = ({ card, session, totalCards, onAnswer, onShowAnswer, onExit }: {
  card: Flashcard;
  session: StudySession;
  totalCards: number;
  onAnswer: (isCorrect: boolean) => void;
  onShowAnswer: () => void;
  onExit: () => void;
}) => {
  const progress = ((session.currentIndex + 1) / totalCards) * 100;
  const sessionAccuracy = session.totalAnswered > 0 ? (session.correctCount / session.totalAnswered) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Study Header */}
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 mb-8">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Card {session.currentIndex + 1} of {totalCards}
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{session.correctCount}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{session.totalAnswered}</span>
              </div>
              {session.totalAnswered > 0 && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {sessionAccuracy.toFixed(1)}%
                </span>
              )}
            </div>
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
            >
              Exit Study
            </Button>
          </div>

          <div className="w-full bg-gray-200/30 dark:bg-gray-700/30 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Study Card */}
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30">
        <div className="p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${card.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {card.difficulty}
              </span>
              {card.contentSource === 'ai_generated' && (
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Reviewed {card.timesReviewed} times
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question:</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {card.question}
            </p>
          </div>

          {card.hint && (
            <div className="mb-6 p-4 bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-sm rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400 dark:text-amber-300" />
                <span className="text-sm font-medium text-amber-200 dark:text-amber-100">Hint:</span>
              </div>
              <p className="text-amber-100 dark:text-amber-200 text-sm">{card.hint}</p>
            </div>
          )}

          {!session.showAnswer ? (
            <div className="flex justify-center">
              <Button
                onClick={onShowAnswer}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 px-8 py-3 text-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-indigo-500/10 dark:bg-indigo-500/5 backdrop-blur-sm rounded-lg border border-indigo-500/20">
                <h4 className="font-semibold text-gray-100 dark:text-white mb-3">Answer:</h4>
                <p className="text-gray-100 dark:text-gray-200 text-lg leading-relaxed">
                  {card.answer}
                </p>
              </div>

              {card.explanation && (
                <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-sm rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-emerald-400 dark:text-emerald-300" />
                    <span className="text-sm font-medium text-emerald-200 dark:text-emerald-100">Explanation:</span>
                  </div>
                  <p className="text-emerald-100 dark:text-emerald-200 text-sm">{card.explanation}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => onAnswer(false)}
                  className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-300 px-8 py-3 text-lg"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Incorrect
                </Button>
                <Button
                  onClick={() => onAnswer(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 px-8 py-3 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Correct
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Flashcard Modal Component
const EditFlashcardModal = ({ card, onSave, onCancel }: {
  card: Flashcard;
  onSave: (cardId: string, updates: Partial<Flashcard>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState({
    question: card.question,
    answer: card.answer,
    hint: card.hint || '',
    explanation: card.explanation || '',
    difficulty: card.difficulty,
    userRating: card.userRating || 0
  });

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    onSave(card.cardId, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Flashcard</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Answer *
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hint (Optional)
            </label>
            <input
              type="text"
              value={form.hint}
              onChange={(e) => setForm({ ...form, hint: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setForm({ ...form, userRating: star })}
                    className={`w-6 h-6 ${star <= form.userRating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                      }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
            >
              Save Changes
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Deck Modal Component
const CreateDeckModal = ({ form, setForm, onSubmit, onCancel, isCreating }: {
  form: CreateDeckForm;
  setForm: (form: CreateDeckForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isCreating: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Deck</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., 'JavaScript Basics', 'French Verbs'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Brief description of the deck..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck Color
            </label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-600"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Make this deck public
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onSubmit}
              disabled={isCreating || !form.name.trim()}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deck
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Deck Management View Component
const DeckManagementView = ({ decks, onCreateDeck, onRefreshDecks, onDeleteDeck, onEditDeck }: {
  decks: FlashcardDeck[];
  onCreateDeck: () => void;
  onRefreshDecks: () => void;
  onDeleteDeck: (deckId: string, deckName: string) => void;
  onEditDeck: (deck: FlashcardDeck) => void;
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Decks</h2>
          <Button
            onClick={onCreateDeck}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Deck
          </Button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No decks created yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first deck to organize your flashcards
            </p>
            <Button
              onClick={onCreateDeck}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <div key={deck.deckId} className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: deck.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{deck.name}</h3>
                </div>
                
                {deck.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{deck.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-2 py-1 rounded-full">
                    {deck.cardCount} cards
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Study
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={() => onEditDeck(deck)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onDeleteDeck(deck.deckId, deck.name)}
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Move Cards Modal Component
const MoveCardsModal = ({ cards, decks, selectedCards, onClose, onMoveCards, selectedDeck, setSelectedDeck, isMoving }: {
  cards: Flashcard[];
  decks: FlashcardDeck[];
  selectedCards: Set<string>;
  onClose: () => void;
  onMoveCards: () => void;
  selectedDeck: string;
  setSelectedDeck: (deckId: string) => void;
  isMoving: boolean;
}) => {
  const selectedCardData = cards.filter(card => selectedCards.has(card.cardId));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Move {selectedCards.size} Cards
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Move to Deck
            </label>
            <select
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Ungrouped</option>
              {decks.map((deck) => (
                <option key={deck.deckId} value={deck.deckId}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Cards ({selectedCards.size})
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {selectedCardData.map((card) => (
                <div key={card.cardId} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {card.question}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Currently in: {card.deckName || 'Ungrouped'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    card.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {card.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onMoveCards}
              disabled={isMoving}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isMoving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Moving...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Move Cards
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isMoving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Deck Modal Component
const EditDeckModal = ({ deck, form, setForm, onSubmit, onCancel, isUpdating }: {
  deck: FlashcardDeck;
  form: CreateDeckForm;
  setForm: (form: CreateDeckForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isUpdating: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Deck: {deck.name}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter deck name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter deck description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-12 h-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                disabled={isUpdating}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {form.color}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="editIsPublic"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isUpdating}
            />
            <label htmlFor="editIsPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Make this deck public
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onSubmit}
              disabled={isUpdating || !form.name.trim()}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Deck
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
