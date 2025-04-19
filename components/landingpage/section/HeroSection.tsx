"use client";

import { Button } from "../../ui/Button";
import LoginButton from "../../ui/LoginButton";
import GetStartedButton from "../../ui/GetStartedButton";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Send, Bot } from "lucide-react";

export default function HeroSection() {
  const { isSignedIn } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [demoQuestion, setDemoQuestion] = useState("");
  const [demoResponse, setDemoResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoQuestion.trim()) return;

    setIsTyping(true);
    setShowResponse(true);

    // Simulate AI typing response
    let response = "";
    const possibleResponses = [
      "Photosynthesis is the process where plants convert light energy into chemical energy. The basic equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This happens in the chloroplasts of plant cells, using chlorophyll to capture light energy.",
      "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c², where c is the hypotenuse and a and b are the other two sides.",
      "Newton's Second Law of Motion states that the force acting on an object is equal to the mass of that object times its acceleration (F = ma). This fundamental law helps us understand the relationship between force, mass, and motion.",
      "The water cycle, or hydrologic cycle, describes how water moves continuously on Earth between the atmosphere, land, and ocean. The main processes include evaporation, condensation, precipitation, infiltration, and runoff."
    ];

    // Pick a response based on the question content
    if (demoQuestion.toLowerCase().includes("photo") || demoQuestion.toLowerCase().includes("plant")) {
      response = possibleResponses[0];
    } else if (demoQuestion.toLowerCase().includes("pythag") || demoQuestion.toLowerCase().includes("triangle")) {
      response = possibleResponses[1];
    } else if (demoQuestion.toLowerCase().includes("newton") || demoQuestion.toLowerCase().includes("force")) {
      response = possibleResponses[2];
    } else if (demoQuestion.toLowerCase().includes("water") || demoQuestion.toLowerCase().includes("cycle")) {
      response = possibleResponses[3];
    } else {
      // Default response if no keywords match
      response = "I understand your question about \"" + demoQuestion + "\". This is a complex topic with several aspects to consider. In a complete answer, I would explain the fundamental concepts, provide relevant examples, and address common misconceptions.";
    }

    let currentCharIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentCharIndex < response.length) {
        setDemoResponse(response.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 20);
  };

  return (
    <section className="pt-32 pb-16 px-6 md:px-10 relative">
      <div
        ref={heroRef}
        className={`max-w-7xl mx-auto transition-all duration-700 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 dark:text-white">
              Transform your study experience with{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Manetho</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto md:mx-0">
              Get instant doubt solving, rich study materials, and collaborative group study tools - all powered by AI to help you learn better and faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <GetStartedButton className="w-full sm:w-auto" />

              <Button
                variant="outline"
                className="text-cyan-600 dark:text-cyan-400 dark:border-cyan-800/50 w-full sm:w-auto flex items-center gap-2"
                href="/explore"
              >
                Explore Features
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <Bot className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-medium dark:text-white">Manetho AI Doubt Solver</h3>
              </div>

              <div className="flex flex-col space-y-4 mb-4 min-h-[200px]">
                {showResponse && (
                  <>
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-lg py-2 px-3 max-w-[80%] self-start">
                      <p className="text-sm text-gray-800 dark:text-gray-200">{demoQuestion}</p>
                    </div>

                    <div className="bg-cyan-600 dark:bg-cyan-700 rounded-lg py-2 px-3 max-w-[80%] self-end text-white">
                      <p className="text-sm">{demoResponse}</p>
                      {isTyping && (
                        <div className="flex space-x-1 mt-1">
                          <div className="typing-dot"></div>
                          <div className="typing-dot animation-delay-200"></div>
                          <div className="typing-dot animation-delay-400"></div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <form onSubmit={handleDemoSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={demoQuestion}
                  onChange={(e) => setDemoQuestion(e.target.value)}
                  placeholder="Ask any academic question..."
                  className="flex-1 py-2 px-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <Button type="submit" size="sm" disabled={isTyping} className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: white;
          display: inline-block;
          animation: typing 1.4s infinite both;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </section>
  );
}
