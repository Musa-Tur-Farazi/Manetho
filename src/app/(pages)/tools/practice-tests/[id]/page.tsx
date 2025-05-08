"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Brain,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../../../../components/ui/Button";
import PageHeader from "../../../../../../components/ui/PageHeader";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestDetails {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  questionsCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  reviewCount: number;
  questions: Question[];
}

export default function PracticeTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Mock test data - in a real app, this would come from an API
  const testDetails: TestDetails = {
    id: params.id,
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    description: "Test your knowledge of basic algebraic concepts and problem-solving skills",
    duration: 45,
    questionsCount: 30,
    difficulty: "Beginner",
    rating: 4.8,
    reviewCount: 342,
    questions: [
      {
        id: "1",
        text: "Solve for x: 2x + 5 = 13",
        options: ["x = 4", "x = 6", "x = 8", "x = 9"],
        correctAnswer: 0,
        explanation: "To solve for x, subtract 5 from both sides: 2x = 8, then divide both sides by 2: x = 4",
      },
      {
        id: "2",
        text: "What is the value of y in the equation: 3y - 7 = 14",
        options: ["y = 5", "y = 7", "y = 9", "y = 11"],
        correctAnswer: 1,
        explanation: "Add 7 to both sides: 3y = 21, then divide both sides by 3: y = 7",
      },
      // Add more questions here
    ],
  };

  const handleStartTest = () => {
    setIsStarting(true);
    setShowInstructions(false);
  };

  if (showInstructions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {testDetails.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {testDetails.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">
                Duration: {testDetails.duration} minutes
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">
                {testDetails.questionsCount} questions
              </span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">
                Rating: {testDetails.rating} ({testDetails.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  testDetails.difficulty === "Beginner"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : testDetails.difficulty === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {testDetails.difficulty}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Instructions
            </h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>You have {testDetails.duration} minutes to complete the test</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>There are {testDetails.questionsCount} multiple-choice questions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Each question has only one correct answer</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>You can review your answers before submitting</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <span>Once you start the test, the timer cannot be paused</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleStartTest}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Test
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {testDetails.title}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="h-5 w-5 mr-2" />
              <span>Time Remaining: {testDetails.duration}:00</span>
            </div>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              End Test
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {testDetails.questions.map((question, index) => (
            <div
              key={question.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-start mb-4">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium mr-4">
                  Question {index + 1}
                </span>
                <p className="text-gray-900 dark:text-white text-lg">
                  {question.text}
                </p>
              </div>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowInstructions(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instructions
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
} 