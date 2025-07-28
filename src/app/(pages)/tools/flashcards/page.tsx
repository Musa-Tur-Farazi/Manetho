"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  Plus,
  Brain,
  Edit,
  Trash2,
  Play,
  BarChart3,
  Star,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  RotateCcw,
  Settings,
  Filter,
  Search,
  Sparkles,
  BookMarked,
  TrendingUp,
  Award,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";
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
}

interface StudySession {
  currentIndex: number;
  showAnswer: boolean;
  sessionStartTime: Date;
  correctCount: number;
  totalAnswered: number;
  timeSpent: number;
}

const FlashcardPage = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'library' | 'create' | 'generate' | 'study'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'difficulty' | 'performance'>('recent');

  // Create form state
  const [createForm, setCreateForm] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    difficulty: 'beginner' as const
  });

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
    } catch (error) {
      toast.error('Error fetching flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const createParam = searchParams.get('create');
    const generateParam = searchParams.get('generate');
    const studyParam = searchParams.get('study');

    if (createParam === 'true') {
      setView('create');
    } else if (generateParam === 'true') {
      setView('generate');
    } else if (studyParam === 'true') {
      setView('study');
    } else {
      setView('library');
    }
  }, [searchParams]);

  // Create flashcard manually
  const createFlashcard = async () => {
    if (!createForm.question.trim() || !createForm.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      const response = await fetch('/api/flashcards/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        const newCard = await response.json();
        setFlashcards(prev => [newCard, ...prev]);
        setCreateForm({ question: '', answer: '', hint: '', explanation: '', difficulty: 'beginner' });
        toast.success('Flashcard created successfully!');
        setView('library');
      } else {
        toast.error('Failed to create flashcard');
      }
    } catch (error) {
      toast.error('Error creating flashcard');
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
                      onChange={(e) => setSortBy(e.target.value as any)}
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
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {flashcards.length === 0 ? 'No flashcards yet' : 'No flashcards match your search'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {flashcards.length === 0
                      ? 'Create your first flashcard or generate some with AI to get started!'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  {flashcards.length === 0 && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setView('create')}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Flashcard
                      </Button>
                      <Button
                        onClick={() => setView('generate')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Generate
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFlashcards.map((card) => (
                    <FlashcardItem
                      key={card.cardId}
                      card={card}
                      onEdit={setEditingCard}
                      onDelete={deleteFlashcard}
                      onStudy={() => startStudySession([card])}
                    />
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
    </div>
  );
};

// Flashcard Item Component
const FlashcardItem = ({ card, onEdit, onDelete, onStudy }: {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (cardId: string) => void;
  onStudy: () => void;
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
    <div className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 hover:bg-white/10 dark:hover:bg-gray-800/10 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/30 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
              {card.difficulty}
            </span>
            {card.contentSource === 'ai_generated' && (
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            )}
            {card.needsReview && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-100 border border-orange-500/30 shadow-orange-500/20 shadow-sm rounded-full text-xs font-medium">
                Review
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(card)}
              className="p-1 text-gray-400 hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors hover:bg-indigo-500/10 rounded-md"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(card.cardId)}
              className="p-1 text-gray-400 hover:text-rose-400 dark:hover:text-rose-300 transition-colors hover:bg-rose-500/10 rounded-md"
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
const CreateFlashcardForm = ({ form, setForm, onSubmit, onCancel }: {
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
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
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Flashcard
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

// AI Generate Form Component
const AIGenerateForm = ({ form, setForm, onSubmit, onCancel, isGenerating }: {
  form: any;
  setForm: (form: any) => void;
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
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
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
                  <Brain className="w-4 h-4 mr-2" />
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
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
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

export default FlashcardPage;
