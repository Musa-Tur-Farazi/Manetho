"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  ChevronRight,
  Brain,
  Clock,
  Star,
  UserPlus,
  BarChart2,
  Zap,
  ArrowRight,
  CheckCircle2,
  Flame,
  Check,
  ChevronLeft
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import ContentCard from "../../../../../components/ui/ContentCard";
import { motion } from "framer-motion";

interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  cardsCount: number;
  author: string;
  rating: number;
  reviewCount: number;
  isPublic: boolean;
  isFeatured?: boolean;
  image?: string;
  color: string;
  progress?: number;
}

export default function FlashcardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [hoveredSet, setHoveredSet] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  
  // Add new state for UI control
  const [viewMode, setViewMode] = useState<"browse" | "create" | "study" | "preview">("browse");
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Add new state for study mode
  const [currentStudyCardIndex, setCurrentStudyCardIndex] = useState(0);
  const [isStudyCardFlipped, setIsStudyCardFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<string[]>([]);

  const categories = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Languages",
  ];

  const flashcardSets: FlashcardSet[] = [
    {
      id: "1",
      title: "Algebra Fundamentals",
      subject: "Mathematics",
      cardsCount: 45,
      author: "Sarah Johnson",
      rating: 4.8,
      reviewCount: 342,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2070&auto=format&fit=crop",
      color: "from-blue-500 to-cyan-500",
      progress: 65,
    },
    {
      id: "2",
      title: "Physics: Motion & Forces",
      subject: "Physics",
      cardsCount: 32,
      author: "Alex Martinez",
      rating: 4.7,
      reviewCount: 218,
      isPublic: true,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=1974&auto=format&fit=crop",
      color: "from-purple-500 to-indigo-500",
      progress: 42,
    },
    {
      id: "3",
      title: "Organic Chemistry Reactions",
      subject: "Chemistry",
      cardsCount: 64,
      author: "Dr. Lisa Chen",
      rating: 4.9,
      reviewCount: 176,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop",
      color: "from-green-500 to-teal-500",
      progress: 28,
    },
    {
      id: "4",
      title: "Cell Biology Essentials",
      subject: "Biology",
      cardsCount: 38,
      author: "Prof. James Wilson",
      rating: 4.6,
      reviewCount: 154,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1579154392429-a8ff269925ba?q=80&w=2070&auto=format&fit=crop",
      color: "from-red-500 to-orange-500",
      progress: 75,
    },
    {
      id: "5",
      title: "World History: Modern Era",
      subject: "History",
      cardsCount: 72,
      author: "Emma Thompson",
      rating: 4.7,
      reviewCount: 198,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=2074&auto=format&fit=crop",
      color: "from-amber-500 to-yellow-500",
      progress: 15,
    },
    {
      id: "6",
      title: "Spanish Vocabulary",
      subject: "Languages",
      cardsCount: 120,
      author: "Carlos Rodriguez",
      rating: 4.8,
      reviewCount: 287,
      isPublic: true,
      image: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=2073&auto=format&fit=crop",
      color: "from-pink-500 to-rose-500",
      progress: 58,
    },
  ];

  const features = [
    {
      title: "Spaced Repetition",
      description: "Our adaptive algorithm optimizes your review schedule to maximize retention",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Smart Flashcards",
      description: "AI-powered suggestions for effective learning based on your performance",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Progress Analytics",
      description: "Track your learning progress with detailed statistics and insights",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: "Collaborative Learning",
      description: "Share and study flashcards with friends or classmates",
      icon: <UserPlus className="h-5 w-5" />,
    },
  ];

  const studyTips = [
    "Review cards in smaller, frequent sessions rather than one long session",
    "Always test yourself before flipping the card to improve recall",
    "Use mnemonics and personal connections to make information memorable",
    "Mix up your cards rather than studying in a predictable sequence"
  ];

  const filteredSets = flashcardSets.filter((set) => {
    const matchesCategory = activeCategory === "All" || set.subject === activeCategory;
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredSets = flashcardSets.filter(set => set.isFeatured);

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

  // Demo card flip animation
  const [isFlipped, setIsFlipped] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Add new state for example flashcards
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isExampleFlipped, setIsExampleFlipped] = useState(false);
  
  const exampleFlashcards = [
    {
      front: "What is the Pythagorean theorem?",
      back: "a² + b² = c²\n\nIn a right triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two sides (a and b).",
      subject: "Mathematics"
    },
    {
      front: "What is Newton's First Law of Motion?",
      back: "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an external force.",
      subject: "Physics"
    },
    {
      front: "What is photosynthesis?",
      back: "The process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water, generating oxygen as a byproduct.",
      subject: "Biology"
    },
    {
      front: "What year did World War II end?",
      back: "1945\n\nWWII ended with the surrender of Nazi Germany in May and Japan in September 1945.",
      subject: "History"
    },
    {
      front: "What is the chemical formula for water?",
      back: "H₂O\n\nWater consists of two hydrogen atoms bonded to one oxygen atom.",
      subject: "Chemistry"
    }
  ];
  
  const goToNextCard = () => {
    setIsExampleFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % exampleFlashcards.length);
    }, 300);
  };
  
  const goToPrevCard = () => {
    setIsExampleFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prevIndex) => (prevIndex === 0 ? exampleFlashcards.length - 1 : prevIndex - 1));
    }, 300);
  };

  // Add new functions for button actions
  const handleCreateFlashcards = () => {
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBrowseLibrary = () => {
    setViewMode("browse");
    setActiveCategory("All");
    setSearchQuery("");
    
    // Scroll to category board
    const categoryBoard = document.getElementById("category-board");
    if (categoryBoard) {
      categoryBoard.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleStartLearning = () => {
    // Scroll to example flashcards section
    const exampleSection = document.getElementById("example-flashcards");
    if (exampleSection) {
      exampleSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleStudySet = (setId: string) => {
    setSelectedSetId(setId);
    setViewMode("study");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePreviewSet = (setId: string) => {
    setSelectedSetId(setId);
    setViewMode("preview");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleViewAllFlashcards = () => {
    setActiveCategory("All");
    setSearchQuery("");
  };

  return (
    <>
      {viewMode === "browse" && (
        <>
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-transparent bg-clip-text bg-size-200 animate-gradient-x">
                Flashcards
              </h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Create, study, and share flashcards to <span className="font-bold text-purple-600 dark:text-purple-400">accelerate your learning</span> and boost your memory retention.
                </p>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-5 mt-8"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 px-8"
                onClick={handleCreateFlashcards}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Flashcards
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-200 dark:border-purple-900 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 px-8"
                onClick={handleBrowseLibrary}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Library
              </Button>
            </motion.div>
          </div>

          {/* Animated demo flashcard */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 rounded-xl p-8 overflow-hidden relative shadow-lg">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/3">
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4 flex items-center">
                    <Flame className="mr-2 h-6 w-6 text-pink-500" />
                    Master with Flashcards
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Click the card to flip it and test your knowledge. Effective flashcards are the key to long-term memory retention.
                  </p>
                  <Button 
                    className="w-full lg:w-auto justify-center group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg"
                    onClick={handleStartLearning}
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-6">
                  <div 
                    className="relative w-full h-[200px] cursor-pointer perspective-1000"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <motion.div 
                      className="w-full h-full absolute flip-card-inner"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {/* Front of card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full h-full absolute backface-hidden flex items-center justify-center border-2 border-purple-200 dark:border-purple-900/30">
                        <p className="text-xl font-medium text-center text-gray-800 dark:text-white">What is the quadratic formula?</p>
                      </div>
                      
                      {/* Back of card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full h-full absolute backface-hidden flex items-center justify-center flip-card-back border-2 border-pink-200 dark:border-pink-900/30">
                        <div className="text-center">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-2">x = (-b ± √(b² - 4ac)) / 2a</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">For a quadratic equation in the form ax² + bx + c = 0</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {featuredSets.length > 0 && (
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500 mb-0 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Star className="mr-3 h-7 w-7 text-yellow-500" />
                  Featured Collections
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Button variant="outline" size="sm" className="px-4 border-2 border-yellow-200 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:border-yellow-500">
                    View All 
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredSets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-yellow-100 dark:border-yellow-900/20"
                    onMouseEnter={() => setHoveredSet(set.id)}
                    onMouseLeave={() => setHoveredSet(null)}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="h-56 relative overflow-hidden">
                      {set.image && (
                        <img
                          src={set.image}
                          alt={set.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10 flex items-end p-8">
                        <div>
                          <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-md mb-3 inline-block border border-white/10">
                            {set.subject}
                          </span>
                          <h3 className="text-2xl font-bold text-white">{set.title}</h3>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                        <Flame className="mr-1 h-3 w-3" />
                        FEATURED
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                          <Star className="h-4 w-4 text-yellow-500 mr-1.5" />
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                            {set.rating} <span className="text-gray-500 dark:text-gray-400 font-normal">({set.reviewCount})</span>
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1.5 text-purple-500" />
                          {set.cardsCount} cards
                        </span>
                      </div>
                      {set.progress && (
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Your Progress</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{set.progress}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className={`h-full bg-gradient-to-r ${set.color.replace('blue', 'purple').replace('cyan', 'pink')} transition-all duration-700 ease-out`}
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredSet === set.id ? set.progress + 5 : set.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center mb-5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          Created by <span className="text-purple-600 dark:text-purple-400">{set.author}</span>
                        </p>
                      </div>
                      <Button 
                        className="w-full justify-center group bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-medium py-6 shadow-md hover:shadow-lg"
                        onClick={() => handleStudySet(set.id)}
                      >
                        <span>Start Studying</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Category Board */}
          <motion.section 
            id="category-board"
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 dark:border-purple-900/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <BookOpen className="mr-2 h-6 w-6 text-purple-500" />
                Browse by Category
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    onClick={() => setActiveCategory(category)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden h-32 sm:h-40 shadow-md transition-all duration-300 group
                      ${activeCategory === category 
                        ? "ring-4 ring-purple-500 dark:ring-purple-400" 
                        : "ring-1 ring-purple-100 dark:ring-purple-900/20"
                      }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      category === "All" ? "from-purple-500 to-pink-500" :
                      category === "Mathematics" ? "from-blue-500 to-cyan-500" :
                      category === "Physics" ? "from-purple-500 to-indigo-500" :
                      category === "Chemistry" ? "from-green-500 to-teal-500" :
                      category === "Biology" ? "from-red-500 to-orange-500" :
                      category === "History" ? "from-amber-500 to-yellow-500" :
                      "from-pink-500 to-rose-500"
                    } opacity-80 dark:opacity-70 transition-opacity duration-300 group-hover:opacity-90`}></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <span className="text-white font-bold text-lg text-center">{category}</span>
                      {category !== "All" && (
                        <span className="text-white/80 text-sm mt-2">
                          {flashcardSets.filter(set => set.subject === category).length} sets
                        </span>
                      )}
                      {category === "All" && (
                        <span className="text-white/80 text-sm mt-2">
                          {flashcardSets.length} sets
                        </span>
                      )}
                    </div>
                    
                    {activeCategory === category && (
                      <div className="absolute bottom-3 right-3 bg-white rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                        <Check className="h-4 w-4 text-purple-500" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Flashcard Sets */}
          <motion.section 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {activeCategory === "All" ? (
                  <>All Flashcard Sets</>
                ) : (
                  <>{activeCategory} Flashcards</>
                )}
                <span className="ml-3 px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {filteredSets.length} sets
                </span>
              </h2>
              
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                </div>
                <input
                  type="search"
                  className="pl-11 pr-4 py-2 bg-purple-50 dark:bg-gray-700 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 border-none shadow-inner"
                  placeholder="Search flashcards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredSets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSets.map((set) => (
                  <motion.div
                    key={set.id}
                    variants={itemVariants}
                    className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group border border-purple-100 dark:border-purple-900/20"
                    onMouseEnter={() => setHoveredSet(set.id)}
                    onMouseLeave={() => setHoveredSet(null)}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className={`h-3 bg-gradient-to-r ${set.color.replace('blue', 'purple').replace('cyan', 'pink')}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {set.title}
                        </h3>
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30">
                          {set.subject}
                        </span>
                      </div>
                      {set.progress && (
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Learning Progress</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{set.progress}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className={`h-full bg-gradient-to-r ${set.color.replace('blue', 'purple').replace('cyan', 'pink')} transition-all duration-700 ease-out`}
                              initial={{ width: 0 }}
                              animate={{ width: `${hoveredSet === set.id ? set.progress + 5 : set.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            ></motion.div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-5 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {set.rating}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                            <BookOpen className="h-4 w-4 mr-1 text-purple-500" />
                            {set.cardsCount} cards
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                          onClick={() => handlePreviewSet(set.id)}
                        >
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium shadow-md hover:shadow-lg"
                          onClick={() => handleStudySet(set.id)}
                        >
                          <span>Study</span>
                          <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-purple-100 dark:border-purple-900/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                  <Search className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Flashcards Found</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
                  {searchQuery ? (
                    <>We couldn't find any flashcards matching your search "<span className="font-medium text-purple-600 dark:text-purple-400">{searchQuery}</span>".</>
                  ) : (
                    <>There are no flashcards available in the "<span className="font-medium text-purple-600 dark:text-purple-400">{activeCategory}</span>" category.</>
                  )}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                    onClick={handleViewAllFlashcards}
                  >
                    View All Flashcards
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium shadow-md hover:shadow-lg"
                    onClick={handleCreateFlashcards}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Set
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* Interactive Example Flashcards */}
          <motion.section
            id="example-flashcards"
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-size-200 animate-gradient-x mb-3">
                Try Some Flashcards
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Click on a card to flip it. Use the arrows to navigate between different examples.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mx-auto max-w-5xl">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700"
                onClick={goToPrevCard}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>

              <div className="relative w-full max-w-2xl">
                <div 
                  className="perspective-1000 w-full aspect-[2/1] cursor-pointer mx-auto"
                  onClick={() => setIsExampleFlipped(!isExampleFlipped)}
                >
                  <motion.div 
                    className="w-full h-full relative flip-card-inner"
                    animate={{ rotateY: isExampleFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Front of example card */}
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 backface-hidden flex flex-col border-2 border-purple-200 dark:border-purple-900/30">
                      <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30">
                          {exampleFlashcards[currentCardIndex].subject}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Card {currentCardIndex + 1} of {exampleFlashcards.length}
                        </span>
                      </div>
                      
                      <div className="flex-grow flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                          {exampleFlashcards[currentCardIndex].front}
                        </h3>
                      </div>
                      
                      <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
                        Click to reveal answer
                      </div>
                    </div>
                    
                    {/* Back of example card */}
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 backface-hidden flip-card-back flex flex-col border-2 border-pink-200 dark:border-pink-900/30">
                      <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/30">
                          Answer
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Card {currentCardIndex + 1} of {exampleFlashcards.length}
                        </span>
                      </div>
                      
                      <div className="flex-grow flex items-center justify-center">
                        <div className="text-center max-w-xl">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
                            {exampleFlashcards[currentCardIndex].back.split('\n\n')[0]}
                          </p>
                          {exampleFlashcards[currentCardIndex].back.split('\n\n')[1] && (
                            <p className="text-gray-600 dark:text-gray-300">
                              {exampleFlashcards[currentCardIndex].back.split('\n\n')[1]}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
                        Click to see question
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="flex justify-center mt-8 gap-4">
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                    onClick={() => setIsExampleFlipped(!isExampleFlipped)}
                  >
                    Flip Card
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium shadow-md hover:shadow-lg"
                    onClick={handleCreateFlashcards}
                  >
                    <span>Create Your Own</span>
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700"
                onClick={goToNextCard}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {exampleFlashcards.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentCardIndex === index 
                        ? "bg-purple-600 dark:bg-purple-400 w-6" 
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    onClick={() => {
                      setIsExampleFlipped(false);
                      setTimeout(() => setCurrentCardIndex(index), 300);
                    }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-purple-950/20 rounded-2xl p-10 mb-16 shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-size-200 animate-gradient-x mb-3">
                Maximize Your Learning
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our advanced features are designed to optimize your study experience and boost your retention
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 border border-purple-100 dark:border-purple-900/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 w-fit mb-6 group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/40 dark:group-hover:to-pink-800/40 transition-all duration-300">
                    <div className="text-purple-600 dark:text-purple-400 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </>
      )}
      
      {viewMode === "study" && selectedSetId && (
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="mr-4 border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 text-purple-700 dark:text-purple-300"
                onClick={() => {
                  setViewMode("browse");
                  setSelectedSetId(null);
                  setCurrentStudyCardIndex(0);
                  setIsStudyCardFlipped(false);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {flashcardSets.find(set => set.id === selectedSetId)?.title}
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded-full">
                Card {currentStudyCardIndex + 1} of {flashcardSets.find(set => set.id === selectedSetId)?.cardsCount || 0}
              </span>
            </div>
          </motion.div>
          
          <div className="flex flex-col items-center justify-center">
            <div 
              className="perspective-1000 w-full max-w-3xl aspect-[3/2] cursor-pointer mx-auto"
              onClick={() => setIsStudyCardFlipped(!isStudyCardFlipped)}
            >
              <motion.div 
                className="w-full h-full relative flip-card-inner"
                animate={{ rotateY: isStudyCardFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front of study card */}
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 backface-hidden flex flex-col border-2 border-purple-200 dark:border-purple-900/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30">
                      {flashcardSets.find(set => set.id === selectedSetId)?.subject}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {knownCards.length} cards learned
                    </span>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
                      {/* Using the exampleFlashcards as placeholder since we don't have actual data */}
                      {exampleFlashcards[currentStudyCardIndex % exampleFlashcards.length].front}
                    </h3>
                  </div>
                  
                  <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
                    Click to reveal answer
                  </div>
                </div>
                
                {/* Back of study card */}
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 backface-hidden flip-card-back flex flex-col border-2 border-pink-200 dark:border-pink-900/30">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/30">
                      Answer
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                      onClick={() => setShowTips(!showTips)}
                    >
                      {showTips ? "Hide Tips" : "Show Tips"}
                    </Button>
                  </div>
                  
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center max-w-xl">
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
                        {exampleFlashcards[currentStudyCardIndex % exampleFlashcards.length].back.split('\n\n')[0]}
                      </p>
                      {exampleFlashcards[currentStudyCardIndex % exampleFlashcards.length].back.split('\n\n')[1] && (
                        <p className="text-gray-600 dark:text-gray-300">
                          {exampleFlashcards[currentStudyCardIndex % exampleFlashcards.length].back.split('\n\n')[1]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {showTips && (
                    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
                      <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Study Tips:</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {studyTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
                    Click to see question
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex justify-center mt-8 gap-4">
              <Button 
                variant="outline" 
                className="border-2 border-red-200 dark:border-red-900/30 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 font-medium"
                onClick={() => {
                  setIsStudyCardFlipped(false);
                  setTimeout(() => {
                    setCurrentStudyCardIndex((prev) => (prev + 1) % (flashcardSets.find(set => set.id === selectedSetId)?.cardsCount || exampleFlashcards.length));
                  }, 300);
                }}
              >
                Don't Know
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-medium shadow-md hover:shadow-lg"
                onClick={() => {
                  setKnownCards([...knownCards, `${selectedSetId}-${currentStudyCardIndex}`]);
                  setIsStudyCardFlipped(false);
                  setTimeout(() => {
                    setCurrentStudyCardIndex((prev) => (prev + 1) % (flashcardSets.find(set => set.id === selectedSetId)?.cardsCount || exampleFlashcards.length));
                  }, 300);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Know It
              </Button>
            </div>
            
            <div className="mt-10 max-w-3xl w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {Math.round((knownCards.filter(id => id.startsWith(`${selectedSetId}-`)).length / (flashcardSets.find(set => set.id === selectedSetId)?.cardsCount || exampleFlashcards.length)) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 ease-out"
                  initial={{ width: 0 }}
                  animate={{ width: `${(knownCards.filter(id => id.startsWith(`${selectedSetId}-`)).length / (flashcardSets.find(set => set.id === selectedSetId)?.cardsCount || exampleFlashcards.length)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {viewMode === "preview" && selectedSetId && (
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-between items-center mb-8 gap-4"
          >
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="mr-4 border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 text-purple-700 dark:text-purple-300"
                onClick={() => {
                  setViewMode("browse");
                  setSelectedSetId(null);
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {flashcardSets.find(set => set.id === selectedSetId)?.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded-full">
                {flashcardSets.find(set => set.id === selectedSetId)?.subject}
              </span>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg"
                onClick={() => handleStudySet(selectedSetId)}
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Studying
              </Button>
            </div>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-10">
            <div className="w-full lg:w-2/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/30 px-6 py-4 border-b border-purple-100 dark:border-purple-900/30">
                  <h3 className="font-medium text-gray-800 dark:text-white">Flashcards Preview</h3>
                  <span className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-full">
                    {flashcardSets.find(set => set.id === selectedSetId)?.cardsCount} cards
                  </span>
                </div>
                <div className="p-6">
                  {/* Here we're using exampleFlashcards as placeholder since we don't have the actual flashcard content */}
                  {exampleFlashcards.map((card, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="mb-4 last:mb-0"
                    >
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg mb-2 border border-purple-100 dark:border-purple-900/30">
                        <div className="font-medium text-gray-800 dark:text-white">{card.front}</div>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-900/20 p-5 rounded-lg border border-pink-100 dark:border-pink-900/30">
                        <div className="font-medium text-gray-800 dark:text-white">{card.back.split('\n\n')[0]}</div>
                        {card.back.split('\n\n')[1] && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{card.back.split('\n\n')[1]}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-purple-100 dark:border-purple-900/20 sticky top-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <h3 className="font-medium text-white">Set Information</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Author</h4>
                    <p className="font-medium text-gray-800 dark:text-white">{flashcardSets.find(set => set.id === selectedSetId)?.author}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Rating</h4>
                    <div className="flex items-center">
                      <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 mr-1.5" />
                        <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                          {flashcardSets.find(set => set.id === selectedSetId)?.rating} 
                          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                            ({flashcardSets.find(set => set.id === selectedSetId)?.reviewCount})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Public</h4>
                    <div className="flex items-center">
                      {flashcardSets.find(set => set.id === selectedSetId)?.isPublic ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <Check className="mr-1 h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {flashcardSets.find(set => set.id === selectedSetId)?.progress !== undefined && (
                    <div>
                      <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Progress</h4>
                      <div className="mb-1.5">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Learning</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {flashcardSets.find(set => set.id === selectedSetId)?.progress}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${flashcardSets.find(set => set.id === selectedSetId)?.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full justify-center group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium shadow-md hover:shadow-lg"
                      onClick={() => handleStudySet(selectedSetId)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Study Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="mr-4 border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 text-purple-700 dark:text-purple-300"
                onClick={() => {
                  setShowCreateForm(false);
                  setViewMode("browse");
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create New Flashcard Set
              </h1>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-purple-100 dark:border-purple-900/20">
                <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 border-b border-purple-100 dark:border-purple-900/30">
                  <h3 className="font-medium text-gray-800 dark:text-white">Set Details</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter a title for your flashcard set"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      {categories.filter(category => category !== "All").map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a description for your flashcard set"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Make this flashcard set public
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-purple-100 dark:border-purple-900/20 mt-8">
                <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 border-b border-purple-100 dark:border-purple-900/30 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white">Flashcards</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-2 border-purple-200 dark:border-purple-900/30 hover:border-purple-500 text-purple-700 dark:text-purple-300"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Card
                  </Button>
                </div>
                <div className="p-6">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Card {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`front-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Front
                          </label>
                          <textarea
                            id={`front-${index}`}
                            rows={4}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Question or term"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor={`back-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Back
                          </label>
                          <textarea
                            id={`back-${index}`}
                            rows={4}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Answer or definition"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 flex justify-center">
                    <Button
                      className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Card
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-purple-100 dark:border-purple-900/20 sticky top-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <h3 className="font-medium text-white">Create Your Set</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Creating effective flashcards makes a big difference in your learning. Here are some tips:
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Keep your cards simple and focused on one concept</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Use clear, concise language</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Include images when relevant to enhance memory</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">For best results, create at least 20 cards per set</span>
                    </li>
                  </ul>
                  
                  <div className="flex flex-col space-y-4">
                    <Button 
                      className="w-full justify-center group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium shadow-md hover:shadow-lg"
                      onClick={() => {
                        // In a real app, this would save the flashcard set
                        setShowCreateForm(false);
                        setViewMode("browse");
                        alert("Flashcard set created successfully!");
                      }}
                    >
                      Create Flashcard Set
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        setShowCreateForm(false);
                        setViewMode("browse");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
        
        .bg-size-200 {
          background-size: 200% 200%;
        }
        
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </>
  );
} 