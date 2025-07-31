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
  // Removed unused variable

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
    beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700',
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/quiz')} className="bg-blue-500 hover:bg-blue-600">
            <Home className="w-4 h-4 mr-2" />
            Back to Quiz Arena
          </Button>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const currentAnswer = answers[currentQuestion?.questionId];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/quiz')}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Quiz Arena</span>
            </Button>

            {gamePhase === 'playing' && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <Clock className="w-5 h-5" />
                  <span className={timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={pauseQuiz}
                  className="flex items-center space-x-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{quizData.quiz.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge
                  className={`px-2 py-1 text-xs font-medium border ${difficultyColors[quizData.quiz.difficulty]}`}
                >
                  {difficultyIcons[quizData.quiz.difficulty]}
                  <span className="ml-1 capitalize">{quizData.quiz.difficulty}</span>
                </Badge>
                <Badge
                  style={{ backgroundColor: quizData.quiz.subjectColor }}
                  className="text-white text-xs"
                >
                  {quizData.quiz.subjectName}
                </Badge>
                <span className="text-sm text-gray-500">
                  {quizData.quiz.totalQuestions} questions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Phase: Ready */}
        {gamePhase === 'ready' && (
          <Card className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start?</h2>
              <p className="text-gray-600 mb-6">{quizData.quiz.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold">{quizData.quiz.totalQuestions} Questions</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">
                    {quizData.quiz.timeLimit ? `${quizData.quiz.timeLimit} Minutes` : 'No Time Limit'}
                  </p>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-semibold">Best: {quizData.userBestScorePercent}%</p>
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Quiz
              </Button>
            </div>
          </Card>
        )}

        {/* Game Phase: Paused */}
        {gamePhase === 'paused' && (
          <Card className="p-8 text-center">
            <Pause className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Paused</h2>
            <p className="text-gray-600 mb-6">Take a break. Click resume when you&apos;re ready to continue.</p>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={resumeQuiz}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button
                onClick={() => router.push('/quiz')}
                variant="outline"
                className="px-6 py-2"
              >
                Exit Quiz
              </Button>
            </div>
          </Card>
        )}

        {/* Game Phase: Playing */}
        {gamePhase === 'playing' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Question Counter */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
              <span className="text-sm text-gray-600">
                {Object.keys(answers).length} answered, {skippedQuestions.size} skipped
              </span>
            </div>

            {/* Question Card */}
            <Card className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.questionId}
                  initial={{ opacity: 0, x: "50px" }}
                  animate={{ opacity: 1, x: "0px" }}
                  exit={{ opacity: 0, x: "-50px" }}
                  transition={{ duration: 0.3 }}
                >
                  {skippedQuestions.has(currentQuestion.questionId) && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-700 text-sm font-medium">
                        ⚠️ This question was skipped. You can still answer it.
                      </p>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

                  {currentQuestion.options ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <label
                          key={index}
                          className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 ${currentAnswer === option
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100'
                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.questionId}
                            value={option}
                            checked={currentAnswer === option}
                            onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={skipQuestion}
                  disabled={skippedQuestions.has(currentQuestion?.questionId || '')}
                  className="flex items-center space-x-2 text-orange-600 border-orange-300 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{skippedQuestions.has(currentQuestion?.questionId || '') ? 'Skipped' : 'Skip'}</span>
                </Button>

                <div className="flex items-center space-x-2">
                  {quizData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestionIndex
                        ? 'bg-blue-500 text-white'
                        : answers[quizData.questions[index].questionId]
                          ? 'bg-green-500 text-white'
                          : skippedQuestions.has(quizData.questions[index].questionId)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitQuiz}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Game Phase: Finished (Submitting) */}
        {gamePhase === 'finished' && (
          <Card className="p-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Submitting Quiz...</h2>
            <p className="text-gray-600">Please wait while we calculate your results.</p>
          </Card>
        )}

        {/* Game Phase: Results */}
        {gamePhase === 'results' && results && (
          <div className="space-y-6">
            {/* Results Summary */}
            <Card className="p-8 text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-6">Here are your results:</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                    {results.score}%
                  </div>
                  <p className="text-gray-600">Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <p className="text-gray-600">Correct</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    +{results.xpEarned}
                  </div>
                  <p className="text-gray-600">XP Earned</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTime(results.timeSpent)}
                  </div>
                  <p className="text-gray-600">Time Spent</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setShowExplanations(!showExplanations)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {showExplanations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showExplanations ? 'Hide' : 'Show'} Explanations</span>
                </Button>
                <Button
                  onClick={() => router.push('/quiz')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Back to Quiz Arena
                </Button>
              </div>
            </Card>

            {/* Detailed Results */}
            {showExplanations && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
                <div className="space-y-4">
                  {results.detailedResults.map((result, index) => (
                    <div key={result.questionId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          {result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            {result.points} / {result.points} pts
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2">{result.question}</p>

                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Your Answer:</span>{' '}
                          <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {result.userAnswer || 'No answer'}
                          </span>
                        </p>
                        {!result.isCorrect && (
                          <p>
                            <span className="font-medium">Correct Answer:</span>{' '}
                            <span className="text-green-600">{result.correctAnswer}</span>
                          </p>
                        )}
                        {result.explanation && (
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">Explanation:</span> {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 