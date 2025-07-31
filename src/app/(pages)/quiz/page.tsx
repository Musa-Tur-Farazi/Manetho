"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  Zap,
  Play,
  Calendar,
  CheckCircle,
  XCircle,
  Brain,
  Plus,
  Sparkles,
  RefreshCw,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface GeneratedQuiz {
  testId: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionType: string;
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
  additionalContext: string;
}

export default function QuizArenaPage() {
  const router = useRouter();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [generatedQuizzes, setGeneratedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  // Quiz generation form state
  const [quizForm, setQuizForm] = useState<QuizGenerationForm>({
    topic: '',
    difficulty: 'intermediate',
    questionCount: 10,
    questionType: 'multiple_choice',
    additionalContext: '',
  });

  const difficultyColors = {
    beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700',
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
      alert('Please enter a topic for your quiz');
      return;
    }

    setGenerateLoading(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizForm,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="AI Quiz Generator"
        subtitle="Create personalized quizzes using AI and convert them to flashcards for study"
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
          </div>
        </div>

        {/* Generate Quiz Tab */}
        {activeTab === 'generate' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 dark:from-gray-800/90 dark:via-blue-900/20 dark:to-indigo-900/30 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100/50 dark:border-blue-800/30 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                Generate New Quiz
              </h2>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleGenerateQuiz(); }}>
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quizForm.topic}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white"
                    placeholder="e.g., JavaScript, World History, Biology..."
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <label
                        key={level}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${quizForm.difficulty === level
                          ? `${difficultyColors[level]} border-current`
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm'
                          }`}
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={level}
                          checked={quizForm.difficulty === level}
                          onChange={(e) => setQuizForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          {difficultyIcons[level]}
                          <span className="font-medium capitalize">{level}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={quizForm.questionCount}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Type
                  </label>
                  <div className="space-y-2">
                    {questionTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${quizForm.questionType === option.value
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm'
                          }`}
                      >
                        <input
                          type="radio"
                          name="questionType"
                          value={option.value}
                          checked={quizForm.questionType === option.value}
                          onChange={(e) => setQuizForm(prev => ({ ...prev, questionType: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          {option.icon}
                          <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                        </div>
                      </label>
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
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="Provide any specific context, learning objectives, or areas to emphasize..."
                  />
                </div>

                {/* Generate Button */}
                <Button
                  type="submit"
                  disabled={generateLoading || !quizForm.topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-medium transform hover:scale-105 transition-transform duration-200 shadow-lg"
                >
                  {generateLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Quiz...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Quiz</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Quiz History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : generatedQuizzes.length > 0 ? (
              <div className="space-y-4">
                {generatedQuizzes.map((quiz) => (
                  <div key={quiz.testId} className="bg-gradient-to-br from-white/90 via-green-50/80 to-teal-50/90 dark:from-gray-800/90 dark:via-green-900/20 dark:to-teal-900/30 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100/50 dark:border-green-800/30 p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm border ${difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}`}>
                          <div className="flex items-center space-x-1">
                            {difficultyIcons[quiz.difficulty as keyof typeof difficultyIcons]}
                            <span className="capitalize">{quiz.difficulty}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{quiz.totalQuestions} questions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => router.push(`/quiz/${quiz.testId}`)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Take Quiz
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Topic: {quiz.topic}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      <span>Type: {quiz.questionType.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90 dark:from-gray-800/90 dark:via-purple-900/20 dark:to-pink-900/30 rounded-xl shadow-lg border border-purple-100/50 dark:border-purple-800/30 p-8 backdrop-blur-sm">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No quizzes generated yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Start by generating your first AI-powered quiz!
                  </p>
                  <Button
                    onClick={() => setActiveTab('generate')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transform hover:scale-105 transition-transform duration-200 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Quiz
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 