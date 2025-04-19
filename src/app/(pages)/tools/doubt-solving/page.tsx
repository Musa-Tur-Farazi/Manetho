"use client";

import { useState } from "react";
import { Send, Image, Loader2, LightbulbIcon, BrainCircuit, BookOpen, FlaskConical, Calculator } from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import ContentCard from "../../../../../components/ui/ContentCard";

export default function DoubtSolvingPage() {
  const [query, setQuery] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = [
    {
      name: "Mathematics",
      description: "Get help with algebra, calculus, geometry, statistics, and more",
      icon: <Calculator className="h-6 w-6" />,
      color: "bg-blue-500",
    },
    {
      name: "Physics",
      description: "Solve problems in mechanics, electromagnetism, thermodynamics, etc.",
      icon: <FlaskConical className="h-6 w-6" />,
      color: "bg-purple-500",
    },
    {
      name: "Chemistry",
      description: "Assistance with organic chemistry, reactions, molecular structures",
      icon: <FlaskConical className="h-6 w-6" />,
      color: "bg-green-500",
    },
    {
      name: "Biology",
      description: "Explanations for genetics, ecology, anatomy, cellular biology, and more",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-red-500",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setQuery("");
      setAttachment(null);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  return (
    <>
      <PageHeader
        title="AI Doubt Solving"
        description="Get instant, accurate explanations for your academic questions"
      >
        <div className="flex items-center justify-center gap-3 mt-4">
          <BrainCircuit className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Powered by advanced AI technology
          </span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Ask Your Question
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your doubt or question
                </label>
                <textarea
                  id="query"
                  rows={5}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  placeholder="Type your question here... e.g., 'How does photosynthesis work?' or 'Can you explain the quadratic formula?'"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attach image or document (optional)
                </label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Image className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {attachment ? attachment.name : "Upload file"}
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  {attachment && (
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: PNG, JPG, PDF, DOC (max 10MB)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full py-3 mt-6"
                disabled={!query.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Question
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Pro Tips
            </h2>
            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="font-medium text-cyan-700 dark:text-cyan-400 mr-2">•</span>
                Be specific with your question to get more accurate answers
              </li>
              <li className="flex items-start">
                <span className="font-medium text-cyan-700 dark:text-cyan-400 mr-2">•</span>
                Include any relevant equations or specific terms
              </li>
              <li className="flex items-start">
                <span className="font-medium text-cyan-700 dark:text-cyan-400 mr-2">•</span>
                Upload images of problems for better context
              </li>
              <li className="flex items-start">
                <span className="font-medium text-cyan-700 dark:text-cyan-400 mr-2">•</span>
                Specify which aspects you're struggling with
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Need More Help?
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Try our tutoring sessions for personalized guidance and in-depth explanations.
            </p>
            <Button variant="outline" size="sm">
              Book a Tutor
            </Button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Explore by Subject
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {subjects.map((subject) => (
          <div
            key={subject.name}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
          >
            <div className={`w-16 h-16 rounded-full ${subject.color} opacity-10 absolute -top-4 -right-4`}></div>
            <div className="mb-4 text-cyan-600 dark:text-cyan-400">
              {subject.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {subject.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {subject.description}
            </p>
            <Button variant="link" className="text-cyan-600 dark:text-cyan-400 p-0">
              Explore {subject.name} →
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ask Your Question
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Type your question or upload an image of the problem you're struggling with
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our advanced AI analyzes your question and generates a comprehensive solution
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Get Your Answer
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receive a detailed explanation with step-by-step guidance and visual aids when needed
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 