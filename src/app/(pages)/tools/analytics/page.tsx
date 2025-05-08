"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Award,
  Clock,
  Brain,
  BookOpen,
  Target,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  BarChart2,
  Activity,
  Zap,
  CalendarDays,
  Flame,
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6 }
  }
};

interface TestResult {
  id: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  date: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  testsTaken: number;
  improvement: number;
  color: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month"); // month, week, year
  const [activeTab, setActiveTab] = useState("overview"); // overview, subjects, tests
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  // Animation trigger on component mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Daily progress data for charts
  const dailyProgress = [
    { day: "Mon", score: 75, time: 45 },
    { day: "Tue", score: 82, time: 60 },
    { day: "Wed", score: 78, time: 30 },
    { day: "Thu", score: 88, time: 75 },
    { day: "Fri", score: 90, time: 55 },
    { day: "Sat", score: 85, time: 40 },
    { day: "Sun", score: 92, time: 65 },
  ];

  // Mock data for test results
  const testResults: TestResult[] = [
    {
      id: "1",
      title: "Algebra Fundamentals",
      subject: "Mathematics",
      score: 85,
      totalQuestions: 30,
      correctAnswers: 25,
      timeTaken: 35,
      date: "2024-03-15",
      difficulty: "Beginner",
    },
    {
      id: "2",
      title: "Physics: Motion & Forces",
      subject: "Physics",
      score: 78,
      totalQuestions: 40,
      correctAnswers: 31,
      timeTaken: 45,
      date: "2024-03-10",
      difficulty: "Intermediate",
    },
    {
      id: "3",
      title: "Organic Chemistry Reactions",
      subject: "Chemistry",
      score: 92,
      totalQuestions: 50,
      correctAnswers: 46,
      timeTaken: 75,
      date: "2024-03-05",
      difficulty: "Advanced",
    },
  ];

  // Mock data for subject performance
  const subjectPerformance: SubjectPerformance[] = [
    {
      subject: "Mathematics",
      averageScore: 85,
      testsTaken: 12,
      improvement: 5,
      color: "bg-blue-500",
    },
    {
      subject: "Physics",
      averageScore: 78,
      testsTaken: 8,
      improvement: -2,
      color: "bg-purple-500",
    },
    {
      subject: "Chemistry",
      averageScore: 92,
      testsTaken: 15,
      improvement: 8,
      color: "bg-green-500",
    },
    {
      subject: "Biology",
      averageScore: 88,
      testsTaken: 10,
      improvement: 3,
      color: "bg-red-500",
    },
  ];

  // Calculate overall statistics
  const overallStats = {
    totalTests: testResults.length,
    averageScore: Math.round(
      testResults.reduce((acc, test) => acc + test.score, 0) / testResults.length
    ),
    totalTimeSpent: testResults.reduce((acc, test) => acc + test.timeTaken, 0),
    improvement: 5, // Mock data
    streakDays: 14, // Mock data
  };

  // Mock data for recommended focus areas
  const focusAreas = [
    { topic: "Quadratic Equations", subject: "Mathematics", priority: "High" },
    { topic: "Organic Chemistry Nomenclature", subject: "Chemistry", priority: "Medium" },
    { topic: "Circular Motion", subject: "Physics", priority: "Low" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Analytics"
        description="Track your learning progress and performance"
        icon={<BarChart3 className="h-8 w-8" />}
      >
        {/* Tab navigation */}
        <div className="flex mt-8 space-x-2 border-b border-gray-200 dark:border-gray-700">
          {["Overview", "Subjects", "Tests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeTab === tab.toLowerCase()
                  ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Time Range Selector */}
      <div className="mb-8 flex justify-end">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex overflow-hidden">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {range === "week" ? "Last Week" : range === "month" ? "Last Month" : "Last Year"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Overall Statistics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate={animate ? "visible" : "hidden"}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Tests
                </h3>
                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {overallStats.totalTests}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Completed tests
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Average Score
                </h3>
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-900/20">
                  <Target className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {overallStats.averageScore}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Across all tests
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Time Spent
                </h3>
                <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20">
                  <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {overallStats.totalTimeSpent} min
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Total study time
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Improvement
                </h3>
                <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20">
                  <TrendingUp className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {overallStats.improvement}%
                </p>
                <ArrowUp className="h-5 w-5 text-green-500 ml-2" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                From last {timeRange}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Streak
                </h3>
                <div className="p-2 rounded-full bg-cyan-50 dark:bg-cyan-900/20">
                  <Flame className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {overallStats.streakDays} days
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Keep it going!
              </p>
            </motion.div>
          </motion.div>
        </>
      )}

      {activeTab === "subjects" && (
        <>
          {/* Focus Areas */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
            variants={itemVariants}
            initial="hidden"
            animate={animate ? "visible" : "hidden"}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recommended Focus Areas
              </h2>
              <Target className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="space-y-4">
              {focusAreas.map((area, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group"
                >
                  <div className={`p-2 rounded-full mr-3 
                    ${area.priority === "High" 
                      ? "bg-red-100 dark:bg-red-900/30" 
                      : area.priority === "Medium" 
                      ? "bg-amber-100 dark:bg-amber-900/30" 
                      : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <Zap className={`h-5 w-5 
                      ${area.priority === "High" 
                        ? "text-red-500 dark:text-red-400" 
                        : area.priority === "Medium" 
                        ? "text-amber-500 dark:text-amber-400" 
                        : "text-green-500 dark:text-green-400"
                      }`} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {area.topic}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {area.subject}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${area.priority === "High" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" 
                          : area.priority === "Medium" 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {area.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    These focus areas are based on your performance patterns and learning goals.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Subject Performance */}
          <motion.section
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate={animate ? "visible" : "hidden"}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-cyan-500" />
              Subject Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjectPerformance.map((subject) => (
                <motion.div
                  key={subject.subject}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredSubject(subject.subject)}
                  onMouseLeave={() => setHoveredSubject(null)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {subject.subject}
                    </h3>
                    <div className={`h-2 w-2 rounded-full ${subject.color}`} />
                  </div>
                  
                  {/* Background pattern */}
                  <div 
                    className={`absolute right-0 bottom-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity rounded-full ${subject.color.replace('bg-', 'bg-')} -mr-6 -mb-6`}>
                  </div>
                  
                  <div className="space-y-4 relative">
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Average Score
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {subject.averageScore}%
                        </p>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full ${subject.color} transition-all duration-700 ease-out`}
                          style={{ 
                            width: `${hoveredSubject === subject.subject ? subject.averageScore + 5 : subject.averageScore}%`,
                            maxWidth: '100%'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tests Taken
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subject.testsTaken}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Improvement
                      </p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {subject.improvement}%
                        </p>
                        {subject.improvement > 0 ? (
                          <ArrowUp className="h-5 w-5 text-green-500 ml-2" />
                        ) : subject.improvement < 0 ? (
                          <ArrowDown className="h-5 w-5 text-red-500 ml-2" />
                        ) : (
                          <Minus className="h-5 w-5 text-gray-500 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 justify-center text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 group"
                  >
                    <span>View Details</span>
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </>
      )}

      {/* Recent Test Results */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Test Results
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {testResults.map((test) => (
                  <tr
                    key={test.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {test.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {test.difficulty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {test.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {test.score}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {test.correctAnswers}/{test.totalQuestions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {test.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {test.timeTaken} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(test.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <motion.section 
        className="mb-8"
        variants={chartVariants}
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Performance Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your study scores and time spent for the last {timeRange}
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Score</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Time</span>
              </div>
            </div>
          </div>
          
          {/* Mock Chart - In a real app, use a chart library like recharts or Chart.js */}
          <div className="w-full h-64">
            <div className="relative h-full w-full flex items-end justify-between">
              {dailyProgress.map((day, index) => (
                <div key={index} className="flex flex-col items-center w-full">
                  {/* Score bar */}
                  <div 
                    className="w-6 bg-cyan-500 dark:bg-cyan-400 rounded-t-md mx-1 relative group"
                    style={{ 
                      height: `${day.score * 0.6}%`,
                      opacity: hoveredSubject ? 0.7 : 1,
                      transition: "height 1s ease-out, opacity 0.3s" 
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {day.score}%
                    </div>
                  </div>
                  
                  {/* Time bar */}
                  <div 
                    className="w-6 bg-purple-500 dark:bg-purple-400 rounded-t-md mx-1 mt-1 relative group"
                    style={{ 
                      height: `${day.time * 0.7}%`,
                      opacity: hoveredSubject ? 0.7 : 1,
                      transition: "height 1s ease-out, opacity 0.3s"
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {day.time} min
                    </div>
                  </div>
                  
                  {/* Day label */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Recent Activity & Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
          variants={itemVariants}
          initial="hidden"
          animate={animate ? "visible" : "hidden"}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Activity className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div 
                key={test.id} 
                className="flex items-start p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
              >
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-3">
                  {test.subject === "Mathematics" ? (
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                  ) : test.subject === "Physics" ? (
                    <Activity className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {test.title}
                    </h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      test.score >= 90 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      test.score >= 75 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {test.score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {test.correctAnswers} of {test.totalQuestions} correct • {test.timeTaken} min
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {test.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 justify-center">
            View All Activity
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 