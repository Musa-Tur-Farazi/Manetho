"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/landingpage/layout/Navbar";
import Footer from "../../../components/landingpage/section/Footer";
import { ChevronDown, ChevronUp, Search, Users, BookOpen, Brain, Award, CheckCircle, HelpCircle, Star, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// FAQ item interface
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// FAQ data
const faqData: FAQItem[] = [
  {
    question: "What is Manetho?",
    answer: "Manetho is an AI-powered learning platform designed to help students master subjects more effectively. Our platform combines personalized learning paths, AI-powered doubt solving, interactive flashcards, mind maps, and progress tracking to provide a comprehensive educational experience.",
    category: "General"
  },
  {
    question: "Is Manetho free to use?",
    answer: "Manetho offers both free and premium plans. The free plan gives you access to basic features, while our premium plans unlock advanced tools like unlimited AI doubt solving, personalized study plans, and comprehensive progress analytics. Visit our pricing page for more details.",
    category: "Pricing"
  },
  {
    question: "How does the AI doubt solver work?",
    answer: "Our AI doubt solver uses advanced natural language processing to understand your questions and provide clear, concise explanations. Simply type your question, upload relevant images or documents if needed, and our AI will generate a detailed answer with relevant examples and illustrations to help you understand the concept better.",
    category: "Features"
  },
  {
    question: "Can I use Manetho on my mobile device?",
    answer: "Yes! Manetho is fully responsive and works seamlessly across desktop, tablet, and mobile devices. You can access all features from any device with an internet connection, making it easy to study on the go.",
    category: "Access"
  },
  {
    question: "How do I create flashcards?",
    answer: "Creating flashcards is simple! Navigate to the Flashcards tool, click 'Create New Set', name your set, and start adding cards with questions on one side and answers on the other. You can also include images, formulas, and other rich content to enhance learning.",
    category: "Features"
  },
  {
    question: "Can I track my progress over time?",
    answer: "Absolutely! Manetho's progress tracking feature monitors your study habits, quiz scores, and mastery levels across all subjects. You'll receive detailed analytics showing your improvement over time, areas that need more attention, and suggestions to optimize your learning strategy.",
    category: "Features"
  },
  {
    question: "Is my data secure on Manetho?",
    answer: "We take data security very seriously. All user data is encrypted both in transit and at rest. We follow industry best practices for security and compliance, and we never share your personal information with third parties without your consent.",
    category: "Privacy"
  },
  {
    question: "Can I collaborate with classmates?",
    answer: "Yes! Manetho offers collaboration features that allow you to share study materials, flashcards, and mind maps with classmates. You can also form study groups to work together on challenging topics and track group progress.",
    category: "Features"
  },
  {
    question: "How do I get started with Manetho?",
    answer: "Getting started is easy! Simply sign up for a free account, set up your profile by selecting your subjects of interest, and you'll be guided through a quick tour of the platform. You can then start exploring our tools and features to enhance your learning experience.",
    category: "General"
  },
  {
    question: "What subjects does Manetho support?",
    answer: "Manetho supports a wide range of subjects including mathematics, science (physics, chemistry, biology), humanities, languages, computer science, and more. We're constantly expanding our subject coverage based on user feedback and demand.",
    category: "Content"
  },
  {
    question: "How can I contact support?",
    answer: "If you need assistance, you can reach our support team through the 'Help & Support' section in your account dashboard. You can also email us at support@manetho.com, and we'll respond within 24 hours. For premium users, we offer priority support with faster response times.",
    category: "Support"
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll still have access to premium features until the end of your current billing period. We don't offer refunds for partial months, but you're welcome to use the service until the period ends.",
    category: "Pricing"
  }
];

// Platform statistics for visuals
const platformStats = [
  { label: "Active Users", value: "50K+", icon: <Users className="w-6 h-6" />, color: "bg-blue-100/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  { label: "Subjects Covered", value: "200+", icon: <BookOpen className="w-6 h-6" />, color: "bg-indigo-100/80 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" },
  { label: "Questions Answered", value: "2M+", icon: <HelpCircle className="w-6 h-6" />, color: "bg-cyan-100/80 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400" },
  { label: "Avg. Grade Improvement", value: "18%", icon: <Award className="w-6 h-6" />, color: "bg-purple-100/80 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
];

// Subject popularity data for the chart
const subjectPopularity = [
  { name: "Mathematics", percentage: 85 },
  { name: "Physics", percentage: 70 },
  { name: "Chemistry", percentage: 65 },
  { name: "Biology", percentage: 60 },
  { name: "Computer Science", percentage: 75 },
  { name: "Languages", percentage: 55 },
  { name: "Humanities", percentage: 45 },
];

// User satisfaction metrics
const satisfactionMetrics = [
  { label: "Platform Ease of Use", percentage: 92 },
  { label: "AI Answer Accuracy", percentage: 88 },
  { label: "Study Resource Quality", percentage: 94 },
  { label: "Progress Tracking", percentage: 90 },
];

// Available categories
const categories = ["All", ...Array.from(new Set(faqData.map(item => item.category)))];

export default function FAQPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFAQs = faqData
    .filter(item => {
      // First filter by category
      const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;

      // Then filter by search query if it exists
      const searchMatch = searchQuery === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <Navbar isScrolled={isScrolled} />

      <main className="relative pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header with animated gradient border */}
          <div className="text-center mb-12 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-md shadow-lg border border-transparent relative before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-indigo-400/40 before:via-cyan-500/40 before:to-indigo-400/40 before:opacity-40 dark:before:opacity-30 before:-z-10 before:animate-gradient-xy">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-indigo-400 text-transparent bg-clip-text mb-4"
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Find answers to common questions about Manetho's AI-powered learning platform
            </motion.p>
          </div>

          {/* Platform Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Platform Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platformStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/40 p-4 text-center transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onMouseEnter={() => setHoveredStat(index)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-white">{stat.value}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-8 relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-4 pl-12 rounded-full bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/40 shadow-sm focus:ring-2 focus:ring-indigo-400/60 dark:focus:ring-indigo-400/60 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-4">
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                  ? "bg-gradient-to-r from-indigo-500/90 via-cyan-500/90 to-indigo-500/90 text-white shadow-md"
                  : "bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/40 border border-gray-100/60 dark:border-gray-700/40"
                  }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* No results message */}
          {filteredFAQs.length === 0 && (
            <div className="text-center py-8 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/40">
              <HelpCircle className="w-12 h-12 text-indigo-400/80 dark:text-indigo-400/80 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or category filter
              </p>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-16">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/40 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none group"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{faq.question}</h3>
                  <span className="text-indigo-600 dark:text-indigo-400 ml-2 p-1 rounded-full bg-indigo-50/80 dark:bg-indigo-900/20">
                    {expandedIndex === index ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </button>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                        <div className="border-t border-gray-100/80 dark:border-gray-700/60 pt-4">
                          {faq.answer}
                          <div className="mt-4 flex justify-end">
                            <span className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                              <Star className="h-4 w-4 mr-1" />
                              Was this helpful?
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Graphical Elements Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Subject Popularity Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/40 p-6"
            >
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Most Popular Subjects</h3>
              </div>
              <div className="space-y-4">
                {subjectPopularity.map((subject, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.name}</span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{subject.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200/80 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.percentage}%` }}
                        transition={{ duration: 1, delay: 0.1 * index }}
                        className={`h-2.5 rounded-full ${index % 3 === 0 ? "bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-500 dark:to-cyan-500" :
                          index % 3 === 1 ? "bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-500 dark:to-blue-500" :
                            "bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-500 dark:to-indigo-500"
                          }`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* User Satisfaction Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/60 dark:border-gray-700/40 p-6"
            >
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Satisfaction</h3>
              </div>
              <div className="space-y-6">
                {satisfactionMetrics.map((metric, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{metric.percentage}%</span>
                    </div>
                    <div className="w-full h-8 bg-gray-200/80 dark:bg-gray-700/60 rounded-lg relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 * index }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 via-cyan-500 to-indigo-600 dark:from-indigo-500 dark:via-cyan-500 dark:to-indigo-600 rounded-lg"
                      ></motion.div>
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-xs font-bold text-white drop-shadow-md">{metric.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Simple Contact Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-6"
          >
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Contact us on email: <a href="mailto:support@manetho.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@manetho.com</a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 