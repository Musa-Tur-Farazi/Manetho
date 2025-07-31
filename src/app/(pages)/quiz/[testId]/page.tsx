"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Zap,
  Play,
  Pause,
  Send,
  BookOpen,
  AlertCircle,
  Home,
  Eye,
  EyeOff,
  Sparkles,
  Brain,
  Timer,
  Award,
  Star,
  ArrowRight,
  Check,
  SkipForward,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  questionId: string;
  question: string;
  options: string[] | null;
  points: number;
  orderIndex: number;
}

interface QuizData {
  quiz: {
    testId: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    totalQuestions: number;
    timeLimit: number;
    subjectName: string;
    subjectColor: string;
    topicName: string;
    creatorName: string;
    creatorAvatarUrl: string;
  };
  questions: Question[];
  userAttempts: Array<{
    attemptId: string;
    score: number;
    timestamp: string;
  }>;
  userBestScore: number;
  userBestScorePercent: number;
  canTakeQuiz: boolean;
  hasAttempted: boolean;
}

interface QuizResults {
  score: number;
  accuracyRate: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  maxPoints: number;
  xpEarned: number;
  timeSpent: number;
  detailedResults: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
    explanation: string;
  }>;
}

export default function QuizGameplayPage() {
  const { testId } = useParams();
  const router = useRouter();

  // Quiz data
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [gamePhase, setGamePhase] = useState<'loading' | 'ready' | 'playing' | 'paused' | 'finished' | 'results'>('loading');

  // Results
  const [results, setResults] = useState<QuizResults | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const difficultyColors = {
    beginner: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    intermediate: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    advanced: 'bg-gradient-to-r from-red-400 to-pink-500 text-white',
  };

  const difficultyIcons = {
    beginner: <Target className="w-4 h-4" />,
    intermediate: <Zap className="w-4 h-4" />,
    advanced: <Trophy className="w-4 h-4" />,
  };

  // Load quiz data
  const fetchQuizData = useCallback(async () => {
    try {
      const response = await fetch(`/api/quiz/${testId}`);
      const data = await response.json();

      if (response.ok) {
        setQuizData(data);
        setTimeLeft(data.quiz.timeLimit ? data.quiz.timeLimit * 60 : 0);
        setGamePhase('ready');
      } else {
        setError(data.error || 'Failed to load quiz');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!quizData || submitting) return;

    setSubmitting(true);
    setIsActive(false);
    setGamePhase('finished');

    try {
      // Convert answers to array format expected by API
      const answersArray = quizData.questions.map(q => ({
        questionId: q.questionId,
        answer: answers[q.questionId] || '',
        skipped: skippedQuestions.has(q.questionId)
      }));

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: testId,
          answers: answersArray,
          timeSpent: totalTimeSpent,
          skippedCount: skippedQuestions.size,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setGamePhase('results');
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [quizData, submitting, answers, skippedQuestions, testId, totalTimeSpent]);

  useEffect(() => {
    if (testId) {
      fetchQuizData();
    }
  }, [testId, fetchQuizData]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0 && gamePhase === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && gamePhase === 'playing') {
      // Time's up - auto submit
      handleSubmitQuiz();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, gamePhase, handleSubmitQuiz]);

  const startQuiz = () => {
    setGamePhase('playing');
    setIsActive(true);
    setTotalTimeSpent(0);
  };

  const pauseQuiz = () => {
    setGamePhase('paused');
    setIsActive(false);
  };

  const resumeQuiz = () => {
    setGamePhase('playing');
    setIsActive(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const skipQuestion = () => {
    if (currentQuestion) {
      setSkippedQuestions(prev => new Set([...prev, currentQuestion.questionId]));
      // Remove the answer if it exists
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[currentQuestion.questionId];
        return newAnswers;
      });
      // Move to next question if not the last one
      if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quizData) return 0;
    const answered = Object.keys(answers).length;
    const skipped = skippedQuestions.size;
    return ((answered + skipped) / quizData.questions.length) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">{error}</p>
              <Button
                onClick={() => router.push('/quiz')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Quiz Arena
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const currentAnswer = answers[currentQuestion?.questionId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Quiz Header */}
          <motion.div
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/quiz')}
                className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Quiz Arena</span>
              </Button>

              {gamePhase === 'playing' && (
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Timer className="w-5 h-5 text-blue-500" />
                    <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={pauseQuiz}
                    className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 rounded-xl"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">{quizData.quiz.title}</h1>
                  <div className="flex items-center space-x-4 flex-wrap gap-2">
                    <Badge className={`px-3 py-1 text-sm font-medium ${difficultyColors[quizData.quiz.difficulty]} shadow-md`}>
                      {difficultyIcons[quizData.quiz.difficulty]}
                      <span className="ml-1 capitalize">{quizData.quiz.difficulty}</span>
                    </Badge>
                    <Badge
                      style={{ backgroundColor: quizData.quiz.subjectColor }}
                      className="text-white text-sm px-3 py-1 shadow-md"
                    >
                      {quizData.quiz.subjectName}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <BookOpen className="w-4 h-4" />
                      <span>{quizData.quiz.totalQuestions} questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Phase: Ready */}
          {gamePhase === 'ready' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Play className="w-12 h-12 text-white ml-1" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.h2
                    className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Ready to Start?
                  </motion.h2>

                  <motion.p
                    className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {quizData.quiz.description}
                  </motion.p>

                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
                      <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{quizData.quiz.totalQuestions}</p>
                      <p className="text-gray-600 dark:text-gray-300">Questions</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl border border-green-200 dark:border-green-700">
                      <Clock className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {quizData.quiz.timeLimit ? `${quizData.quiz.timeLimit}` : '∞'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {quizData.quiz.timeLimit ? 'Minutes' : 'No Limit'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-700">
                      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{quizData.userBestScorePercent}%</p>
                      <p className="text-gray-600 dark:text-gray-300">Best Score</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Button
                      onClick={startQuiz}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Play className="w-6 h-6 mr-3" />
                      Start Quiz
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Game Phase: Paused */}
          {gamePhase === 'paused' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                <div className="max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Pause className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quiz Paused</h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Take a break. Click resume when you're ready to continue.</p>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={resumeQuiz}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                    <Button
                      onClick={() => router.push('/quiz')}
                      variant="outline"
                      className="px-8 py-3 text-lg rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      Exit Quiz
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Game Phase: Playing */}
          {gamePhase === 'playing' && currentQuestion && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Progress Bar */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                  <span>{Object.keys(answers).length} answered, {skippedQuestions.size} skipped</span>
                </div>
              </div>

              {/* Question Card */}
              <Card className="p-8 !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.questionId}
                    initial={{ opacity: 0, x: "50px" }}
                    animate={{ opacity: 1, x: "0px" }}
                    exit={{ opacity: 0, x: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    {skippedQuestions.has(currentQuestion.questionId) && (
                      <motion.div
                        className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border border-orange-200 dark:border-orange-700 rounded-2xl"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-orange-700 dark:text-orange-300 text-sm font-medium flex items-center">
                          <SkipForward className="w-4 h-4 mr-2" />
                          This question was skipped. You can still answer it.
                        </p>
                      </motion.div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                          Question {currentQuestionIndex + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentQuestion.points} pts
                          </div>
                        </div>
                      </div>
                      <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {currentQuestion.options ? (
                      <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => (
                          <motion.label
                            key={index}
                            className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${currentAnswer === option
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                              }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="radio"
                              name={currentQuestion.questionId}
                              value={option}
                              checked={currentAnswer === option}
                              onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${currentAnswer === option
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {currentAnswer === option && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className="text-lg font-medium">{option}</span>
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={currentAnswer || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                        placeholder="Enter your answer..."
                        className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        rows={6}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 rounded-xl px-6 py-3"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={skipQuestion}
                    disabled={skippedQuestions.has(currentQuestion?.questionId || '')}
                    className="flex items-center space-x-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-6 py-3"
                  >
                    <SkipForward className="w-5 h-5" />
                    <span>{skippedQuestions.has(currentQuestion?.questionId || '') ? 'Skipped' : 'Skip'}</span>
                  </Button>

                  <div className="flex items-center space-x-2">
                    {quizData.questions.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${index === currentQuestionIndex
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : answers[quizData.questions[index].questionId]
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : skippedQuestions.has(quizData.questions[index].questionId)
                              ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {index + 1}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center space-x-2 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Quiz</span>
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center space-x-2 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Game Phase: Finished (Submitting) */}
          {gamePhase === 'finished' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                <div className="max-w-2xl mx-auto">
                  <div className="animate-spin w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Submitting Quiz...</h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300">Please wait while we calculate your results.</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Game Phase: Results */}
          {gamePhase === 'results' && results && (
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Summary */}
              <Card className="p-12 text-center !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <motion.h2
                  className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Quiz Complete!
                </motion.h2>

                <motion.p
                  className="text-xl text-gray-600 dark:text-gray-300 mb-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Here are your results:
                </motion.p>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
                    <div className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}%
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Score</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl border border-green-200 dark:border-green-700">
                    <div className="text-4xl font-bold text-green-600">
                      {results.correctAnswers}/{results.totalQuestions}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Correct</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
                    <div className="text-4xl font-bold text-purple-600">
                      +{results.xpEarned}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">XP Earned</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-2xl border border-orange-200 dark:border-orange-700">
                    <div className="text-4xl font-bold text-orange-600">
                      {formatTime(results.timeSpent)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Time Spent</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex justify-center space-x-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    onClick={() => setShowExplanations(!showExplanations)}
                    variant="outline"
                    className="flex items-center space-x-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 rounded-xl px-6 py-3"
                  >
                    {showExplanations ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    <span>{showExplanations ? 'Hide' : 'Show'} Explanations</span>
                  </Button>
                  <Button
                    onClick={() => router.push('/quiz')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Back to Quiz Arena
                  </Button>
                </motion.div>
              </Card>

              {/* Detailed Results */}
              {showExplanations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-8 !bg-white/60 dark:!bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl rounded-3xl">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Detailed Results</h3>
                    <div className="space-y-6">
                      {results.detailedResults.map((result, index) => (
                        <motion.div
                          key={result.questionId}
                          className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-700"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Question {index + 1}</span>
                            <div className="flex items-center space-x-3">
                              {result.isCorrect ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                              )}
                              <span className="text-sm font-medium bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                                {result.points} / {result.points} pts
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">{result.question}</p>

                          <div className="space-y-2 text-base">
                            <p>
                              <span className="font-semibold text-gray-800 dark:text-gray-100">Your Answer:</span>{' '}
                              <span className={result.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {result.userAnswer || 'No answer'}
                              </span>
                            </p>
                            {!result.isCorrect && (
                              <p>
                                <span className="font-semibold text-gray-800 dark:text-gray-100">Correct Answer:</span>{' '}
                                <span className="text-green-600 font-medium">{result.correctAnswer}</span>
                              </p>
                            )}
                            {result.explanation && (
                              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold text-blue-800 dark:text-blue-300">Explanation:</span> {result.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 