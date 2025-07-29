"use client";

import {
  Calculator,
  BookOpen,
  Video,
  FileText,
  Users,
  Check,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Sigma,
  Infinity,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import ContentCard from "@/components/ui/ContentCard";

interface TopicProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
}

export default function MathematicsPage() {
  const resources = [
    {
      title: "Video Lectures",
      description: "Watch comprehensive video explanations of key math concepts",
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=2070&auto=format&fit=crop",
      buttonText: "Browse Videos",
      buttonLink: "/subjects/mathematics/videos",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Practice Problems",
      description: "Strengthen your skills with our curated set of practice exercises",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop",
      buttonText: "Start Practicing",
      buttonLink: "/subjects/mathematics/practice",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Study Groups",
      description: "Join virtual study groups with students tackling similar math topics",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop",
      buttonText: "Find Groups",
      buttonLink: "/subjects/mathematics/groups",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Interactive Courses",
      description: "Complete comprehensive courses with step-by-step guidance",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      buttonText: "Explore Courses",
      buttonLink: "/subjects/mathematics/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  const topics: TopicProps[] = [
    {
      title: "Algebra",
      description: "Variables, equations, functions, graphs, and systems of equations",
      icon: <Sigma className="h-6 w-6" />,
      difficulty: "Intermediate",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Calculus",
      description: "Limits, derivatives, integrals, and differential equations",
      icon: <Infinity className="h-6 w-6" />,
      difficulty: "Advanced",
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Geometry",
      description: "Shapes, sizes, properties of space, and trigonometry",
      icon: <TrendingUp className="h-6 w-6" />,
      difficulty: "Intermediate",
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Statistics & Probability",
      description: "Data analysis, distributions, hypothesis testing, and probability theory",
      icon: <PieChart className="h-6 w-6" />,
      difficulty: "Intermediate",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Number Theory",
      description: "Prime numbers, divisibility, congruences, and Diophantine equations",
      icon: <Calculator className="h-6 w-6" />,
      difficulty: "Advanced",
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Discrete Mathematics",
      description: "Logic, set theory, combinatorics, and graph theory",
      icon: <BrainCircuit className="h-6 w-6" />,
      difficulty: "Advanced",
      color: "from-amber-500 to-yellow-500",
    },
  ];

  const features = [
    "AI-powered problem solving and step-by-step explanations",
    "Interactive visualizations for complex concepts",
    "Personalized learning paths based on your skill level",
    "Extensive practice problems with instant feedback",
    "Rigorous theory combined with practical applications",
    "Regular content updates aligned with academic standards",
  ];

  return (
    <>
      <PageHeader
        title="Mathematics"
        subtitle="Explore the fascinating world of mathematics with our comprehensive learning resources"
      />
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button size="lg">
          Get Started
        </Button>
        <Button variant="outline" size="lg">
          View Curriculum
        </Button>
      </div>

      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Learning Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ContentCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              image={resource.image}
              icon={resource.icon}
              buttonText={resource.buttonText}
              buttonLink={resource.buttonLink}
            />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Popular Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`h-2 bg-gradient-to-r ${topic.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-3">
                    {topic.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${topic.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        topic.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {topic.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{topic.description}</p>
                <div className="flex justify-end">
                  <Button variant="link" className="text-cyan-600 dark:text-cyan-400 p-0 group-hover:translate-x-1 transition-transform">
                    Explore <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why Study Mathematics with Us?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our mathematics curriculum combines rigorous theory with practical applications,
            designed to develop strong problem-solving skills and conceptual understanding.
                            Whether you&apos;re preparing for exams, pursuing a degree, or simply curious about
            mathematics, our resources are tailored to help you succeed.
          </p>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop"
            alt="Students learning mathematics"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Need Help with a Specific Math Problem?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Try our AI-powered doubt solving tool for step-by-step solutions and explanations.
        </p>
        <Button size="lg">
          Solve My Problem
        </Button>
      </div>
    </>
  );
} 