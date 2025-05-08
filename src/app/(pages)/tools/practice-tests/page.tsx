"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronRight,
  Search,
  Filter,
  BarChart3,
  Award,
  Brain,
  Calculator,
  FlaskConical,
  BookMarked,
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  LucideIcon,
  Zap,
  Trophy,
  Flame,
  TimerReset,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import ContentCard from "../../../../../components/ui/ContentCard";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
};

interface PracticeTest {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  questionsCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviewCount: number;
  isPublic: boolean;
  isFeatured: boolean;
  image: string;
  color: string;
  icon: React.ReactNode;
  completionRate?: number;
}

export default function PracticeTestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [filteredTests, setFilteredTests] = useState<PracticeTest[]>([]);
  const [hoveredTest, setHoveredTest] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [animate, setAnimate] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const subjects = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Languages",
  ];

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const practiceTests: PracticeTest[] = [
    {
      id: "1",
      title: "Algebra Fundamentals",
      subject: "Mathematics",
      description: "Test your knowledge of basic algebraic concepts and problem-solving skills",
      duration: 45,
      questionsCount: 30,
      difficulty: "Beginner",
      rating: 4.8,
      reviewCount: 342,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500",
      icon: <Calculator className="h-6 w-6" />,
      completionRate: 65,
    },
    {
      id: "2",
      title: "Physics: Motion & Forces",
      subject: "Physics",
      description: "Comprehensive test covering Newton's laws, kinematics, and force analysis",
      duration: 60,
      questionsCount: 40,
      difficulty: "Intermediate",
      rating: 4.7,
      reviewCount: 218,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1974&auto=format&fit=crop",
      color: "from-purple-500 to-indigo-500",
      icon: <FlaskConical className="h-6 w-6" />,
      completionRate: 42,
    },
    {
      id: "3",
      title: "Organic Chemistry Reactions",
      subject: "Chemistry",
      description: "Test your understanding of organic reactions, mechanisms, and synthesis",
      duration: 90,
      questionsCount: 50,
      difficulty: "Advanced",
      rating: 4.9,
      reviewCount: 176,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop",
      color: "from-green-500 to-teal-500",
      icon: <FlaskConical className="h-6 w-6" />,
      completionRate: 28,
    },
    {
      id: "4",
      title: "Cell Biology Essentials",
      subject: "Biology",
      description: "Comprehensive test on cell structure, function, and cellular processes",
      duration: 45,
      questionsCount: 35,
      difficulty: "Intermediate",
      rating: 4.6,
      reviewCount: 154,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1579154392429-a8ff269925ba?q=80&w=2070&auto=format&fit=crop",
      color: "from-red-500 to-orange-500",
      icon: <BookMarked className="h-6 w-6" />,
      completionRate: 75,
    },
    {
      id: "5",
      title: "Data Structures & Algorithms",
      subject: "Computer Science",
      description: "Test your knowledge of fundamental data structures and algorithmic concepts",
      duration: 60,
      questionsCount: 40,
      difficulty: "Intermediate",
      rating: 4.8,
      reviewCount: 220,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
      color: "from-cyan-500 to-blue-500",
      icon: <Brain className="h-6 w-6" />,
      completionRate: 38,
    },
    {
      id: "6",
      title: "Spanish Vocabulary",
      subject: "Languages",
      description: "Test your knowledge of essential Spanish vocabulary for daily conversations",
      duration: 30,
      questionsCount: 50,
      difficulty: "Beginner",
      rating: 4.5,
      reviewCount: 189,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2073&auto=format&fit=crop",
      color: "from-yellow-500 to-amber-500",
      icon: <BookOpen className="h-6 w-6" />,
      completionRate: 82,
    },
  ];

  // Demo quiz questions
  const demoQuestions = [
    {
      question: "What is the quadratic formula?",
      options: [
        "x = (-b ± √(b² - 4ac)) / 2a",
        "x = -b / 2a",
        "x = -b / a",
        "x = c / a"
      ],
      correctAnswer: 0,
      explanation: "The quadratic formula is used to solve quadratic equations of the form ax² + bx + c = 0. It provides both solutions in a single formula."
    },
    {
      question: "Which of the following is Newton's First Law of Motion?",
      options: [
        "Force equals mass times acceleration",
        "For every action, there is an equal and opposite reaction",
        "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force",
        "Energy cannot be created or destroyed, only transformed"
      ],
      correctAnswer: 2,
      explanation: "Newton's First Law of Motion, also known as the Law of Inertia, states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force."
    },
    {
      question: "Which of the following is NOT a data structure?",
      options: [
        "Linked List",
        "Binary Tree",
        "HTTP Protocol",
        "Hash Table"
      ],
      correctAnswer: 2,
      explanation: "HTTP Protocol is a communication protocol used on the web, not a data structure. The others are all fundamental data structures in computer science."
    }
  ];

  // Animation effect on component mount
  useEffect(() => {
    setAnimate(true);
  }, []);
  
  // Start the demo quiz timer
  useEffect(() => {
    if (showDemo && testStartTime === null) {
      setTestStartTime(new Date());
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showDemo, testStartTime]);
  
  // Format the timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle answering a question in the demo
  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setIsAnswerCorrect(answerIndex === demoQuestions[currentQuestion].correctAnswer);
  };
  
  // Move to the next question in the demo
  const handleNextQuestion = () => {
    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
    } else {
      // End of quiz
      if (timerRef.current) clearInterval(timerRef.current);
      // For a real implementation, would show results here
    }
  };
  
  // Reset the demo quiz
  const resetDemo = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setTestStartTime(new Date());
    setTimeLeft(120);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Achievement badges for gamification
  const achievements = [
    { name: "Perfect Score", icon: <Trophy className="h-5 w-5 text-yellow-500" />, description: "Score 100% on any test" },
    { name: "Speed Demon", icon: <Zap className="h-5 w-5 text-cyan-500" />, description: "Complete a test in half the allocated time" },
    { name: "Subject Master", icon: <Award className="h-5 w-5 text-purple-500" />, description: "Complete all tests in a subject" },
    { name: "Daily Streak", icon: <Flame className="h-5 w-5 text-orange-500" />, description: "Take tests for 5 consecutive days" },
  ];

  useEffect(() => {
    const filtered = practiceTests.filter((test) => {
      const matchesSearch = searchQuery === "" || 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === "All" || test.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === "All" || test.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
    
    setFilteredTests(filtered);
  }, [searchQuery, selectedSubject, selectedDifficulty]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Practice Tests"
        description="Test your knowledge with our comprehensive practice tests"
        icon={<GraduationCap className="h-8 w-8" />}
      >
        <div className="flex gap-4 mt-8">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => setShowDemo(!showDemo)}
          >
            <Zap className="mr-2 h-4 w-4" />
            Try Demo Test
          </Button>
        </div>
      </PageHeader>

      {/* Demo Test Section */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900/30 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    Quick Quiz Demo
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                      <Clock className="h-4 w-4 text-white mr-2" />
                      <span className="text-white font-medium">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                      <span className="text-white font-medium">
                        {currentQuestion + 1}/{demoQuestions.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {demoQuestions[currentQuestion].question}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {demoQuestions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                          selectedAnswer === null
                            ? "border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500"
                            : selectedAnswer === index
                              ? isAnswerCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : index === demoQuestions[currentQuestion].correctAnswer && selectedAnswer !== null
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 dark:border-gray-700 opacity-60"
                        }`}
                        onClick={() => selectedAnswer === null && handleAnswer(index)}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                            selectedAnswer !== null
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}>
                            {selectedAnswer !== null ? (
                              selectedAnswer === index ? (
                                isAnswerCorrect ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )
                              ) : index === demoQuestions[currentQuestion].correctAnswer ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                String.fromCharCode(65 + index)
                              )
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </div>
                          <span className={`font-medium ${
                            selectedAnswer !== null && 
                            (selectedAnswer === index || index === demoQuestions[currentQuestion].correctAnswer)
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}>
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        isAnswerCorrect
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
                          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                      } mb-6`}
                    >
                      <div className="flex items-start">
                        {isAnswerCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className={`font-medium ${
                            isAnswerCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                          }`}>
                            {isAnswerCorrect ? "Correct!" : "Incorrect!"}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            {demoQuestions[currentQuestion].explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={resetDemo}
                      className="flex items-center"
                    >
                      <TimerReset className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                    
                    {selectedAnswer !== null && (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 group"
                      >
                        {currentQuestion < demoQuestions.length - 1 ? (
                          <>
                            Next Question
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          "Finish Quiz"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievement Badges */}
      <motion.section
        className="mb-8"
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Trophy className="h-5 w-5 text-amber-500 mr-2" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {achievement.icon}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Tests Section */}
      <motion.section 
        className="mb-12"
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
          Featured Tests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceTests
            .filter((test) => test.isFeatured)
            .map((test) => (
              <motion.div
                key={test.id}
                variants={scaleVariants}
                className="group cursor-pointer"
                onClick={() => router.push(`/tools/practice-tests/${test.id}`)}
                onMouseEnter={() => setHoveredTest(test.id)}
                onMouseLeave={() => setHoveredTest(null)}
              >
                <ContentCard
                  title={test.title}
                  description={test.description}
                  image={test.image}
                  buttonText="Start Test"
                  buttonLink={`/tools/practice-tests/${test.id}`}
                  icon={test.icon}
                  color={test.color}
                  className={`transform transition-transform duration-300 ${hoveredTest === test.id ? 'scale-[1.02]' : ''}`}
                >
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-1 text-purple-500" />
                        {test.duration} min
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 mr-1 text-cyan-500" />
                        {test.questionsCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
                      <p className={`font-medium flex items-center justify-center ${
                        test.difficulty === "Beginner" 
                          ? "text-green-600 dark:text-green-400" 
                          : test.difficulty === "Intermediate" 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {test.difficulty === "Beginner" && <CheckCircle2 className="h-4 w-4 mr-1" />}
                        {test.difficulty === "Intermediate" && <Award className="h-4 w-4 mr-1" />}
                        {test.difficulty === "Advanced" && <Zap className="h-4 w-4 mr-1" />}
                        {test.difficulty}
                      </p>
                    </div>
                  </div>
                </ContentCard>
              </motion.div>
            ))}
        </div>
      </motion.section>

      {/* All Tests Section */}
      <motion.section
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          All Tests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <motion.div
              key={test.id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
              onMouseEnter={() => setHoveredTest(test.id)}
              onMouseLeave={() => setHoveredTest(null)}
            >
              <div className={`h-2 bg-gradient-to-r ${test.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3 group-hover:scale-110 transition-transform">
                    {test.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {test.title}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {test.subject}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {test.description}
                </p>
                
                {test.completionRate !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">{test.completionRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${test.color} transition-all duration-700 ease-out`}
                        style={{ width: `${hoveredTest === test.id ? test.completionRate + 5 : test.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap justify-between gap-2 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {test.duration} min
                    </span>
                  </div>
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {test.questionsCount} questions
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {test.rating} ({test.reviewCount})
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    test.difficulty === "Beginner" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : test.difficulty === "Intermediate" 
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {test.difficulty}
                  </span>
                  <Button
                    onClick={() => router.push(`/tools/practice-tests/${test.id}`)}
                    size="sm"
                    className="group"
                  >
                    Start Test
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
} 