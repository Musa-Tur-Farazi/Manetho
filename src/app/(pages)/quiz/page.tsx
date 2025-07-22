"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Users,
  Trophy,
  Target,
  Zap,
  Filter,
  Search,
  ChevronRight,
  Star,
  Play,
  BarChart3,
  Calendar,
  Award,
  TrendingUp,
  User,
  CheckCircle,
  XCircle,
  Medal,
  Flame,
  Crown,
  GraduationCap,
  Brain,
  Plus,
  Sparkles,
  BookMarked,
  Settings,
  RefreshCw,
  Lightbulb,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface GeneratedQuiz {
  testId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalQuestions: number;
  timeLimit: number;
  aiGenerated: boolean;
  createdAt: string;
}

interface QuizGenerationForm {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  focusAreas: string[];
  additionalContext: string;
}

export default function QuizArenaPage() {
  const router = useRouter();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'flashcards'>('generate');
  const [generatedQuizzes, setGeneratedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  // Quiz generation form state
  const [quizForm, setQuizForm] = useState<QuizGenerationForm>({
    topic: '',
    difficulty: 'intermediate',
    questionCount: 10,
    questionType: 'multiple_choice',
    focusAreas: [],
    additionalContext: '',
  });

  const [focusAreaInput, setFocusAreaInput] = useState('');

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-100 text-red-700 border-red-200',
  };

  const difficultyIcons = {
    beginner: <Target className="w-4 h-4" />,
    intermediate: <Zap className="w-4 h-4" />,
    advanced: <Trophy className="w-4 h-4" />,
  };

  const questionTypeOptions = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'true_false', label: 'True/False', icon: <XCircle className="w-4 h-4" /> },
    { value: 'short_answer', label: 'Short Answer', icon: <FileText className="w-4 h-4" /> },
  ];

  // Load user's generated quizzes
  useEffect(() => {
    if (user) {
      loadGeneratedQuizzes();
    }
  }, [user]);

  const loadGeneratedQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz?type=generated');
      const data = await response.json();

      if (response.ok) {
        setGeneratedQuizzes(data.quizzes || []);
      }
    } catch (error) {
      console.error('Error loading generated quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizForm.topic.trim()) {
      alert('Please enter a topic for the quiz');
      return;
    }

    setGenerateLoading(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the generated quiz
        router.push(`/quiz/${data.quiz.testId}`);
      } else {
        alert(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleAddFocusArea = () => {
    if (focusAreaInput.trim() && !quizForm.focusAreas.includes(focusAreaInput.trim())) {
      setQuizForm(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, focusAreaInput.trim()]
      }));
      setFocusAreaInput('');
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setQuizForm(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(a => a !== area)
    }));
  };

  const handleConvertToFlashcards = async (testId: string) => {
    const deckName = prompt('Enter a name for the flashcard deck:');
    if (!deckName) return;

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          deckName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Flashcard deck created successfully!');
        // Optionally redirect to flashcards page
        router.push('/tools/flashcards');
      } else {
        alert(data.error || 'Failed to create flashcard deck');
      }
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      alert('Failed to create flashcard deck. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="AI Quiz Generator"
        description="Create personalized quizzes using AI and convert them to flashcards for study"
      />

      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'generate'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Quizzes</span>
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'flashcards'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Flashcards</span>
            </button>
          </div>
        </div>

        {/* Generate Quiz Tab */}
        {activeTab === 'generate' && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Generate AI Quiz
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Create personalized quizzes on any topic using AI
                    </p>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Note:</strong> Full AI generation requires OpenRouter or OpenAI API key. Without it, you'll get sample questions based on your topic.
                      </p>
                    </div>
                  </div>
              </div>

              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Machine Learning Fundamentals, World War II, Organic Chemistry..."
                  />
                </div>

                {/* Difficulty and Question Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <div className="space-y-2">
                      {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                        <label key={level} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="difficulty"
                            value={level}
                            checked={quizForm.difficulty === level}
                            onChange={(e) => setQuizForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            {difficultyIcons[level]}
                            <span className="capitalize text-gray-700 dark:text-gray-300">{level}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={quizForm.questionCount}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value={5}>5 questions</option>
                      <option value={10}>10 questions</option>
                      <option value={15}>15 questions</option>
                      <option value={20}>20 questions</option>
                      <option value={25}>25 questions</option>
                    </select>
                  </div>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {questionTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input
                          type="radio"
                          name="questionType"
                          value={option.value}
                          checked={quizForm.questionType === option.value}
                          onChange={(e) => setQuizForm(prev => ({ ...prev, questionType: e.target.value as any }))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {option.icon}
                          <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Focus Areas (Optional)
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={focusAreaInput}
                      onChange={(e) => setFocusAreaInput(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Algorithms, Data Structures..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFocusArea()}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFocusArea}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quizForm.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                      >
                        {area}
                        <button
                          onClick={() => handleRemoveFocusArea(area)}
                          className="ml-2 hover:text-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    value={quizForm.additionalContext}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, additionalContext: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="Provide any specific context, learning objectives, or areas to emphasize..."
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generateLoading || !quizForm.topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 text-lg font-medium"
                >
                  {generateLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* My Quizzes Tab */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Generated Quizzes
              </h2>
              <Button
                onClick={loadGeneratedQuizzes}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : generatedQuizzes.length > 0 ? (
              <div className="space-y-4">
                {generatedQuizzes.map((quiz) => (
                  <Card key={quiz.testId} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {quiz.title}
                          </h3>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                          <Badge className={`px-2 py-1 text-xs font-medium border ${difficultyColors[quiz.difficulty]}`}>
                            {difficultyIcons[quiz.difficulty]}
                            <span className="ml-1 capitalize">{quiz.difficulty}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{quiz.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{quiz.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{quiz.timeLimit} minutes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => handleConvertToFlashcards(quiz.testId)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <BookMarked className="w-4 h-4" />
                          <span>To Flashcards</span>
                        </Button>
                        <Button
                          onClick={() => router.push(`/quiz/${quiz.testId}`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Take Quiz</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No quizzes generated yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start by generating your first AI-powered quiz!
                </p>
                <Button
                  onClick={() => setActiveTab('generate')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Flashcard Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Convert your generated quizzes into flashcard decks for better studying
              </p>
              <Button
                onClick={() => router.push('/tools/flashcards')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <BookMarked className="w-4 h-4 mr-2" />
                View Flashcards
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 