"use client";

import { Button } from "../../ui/Button";
import { motion } from "framer-motion";
import AuthProtectedLink from "../AuthProtectedLink";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [currentSubheading, setCurrentSubheading] = useState(0);
  const subheadings = [
    "Experience a fully personalized learning journey tailored to your unique needs and goals",
    "Get instant, detailed answers to your academic questions through our advanced AI system",
    "Generate customized study materials that adapt to your learning style and pace",
    "Monitor your academic progress with comprehensive analytics and performance insights",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSubheading((prev) => (prev + 1) % subheadings.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              <div>
                Your AI-Powered
              </div>
              <div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
                  Learning Partner
                </span>
              </div>
            </h1>

            <div className="h-24 mb-8">
              {subheadings.map((text, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: currentSubheading === index ? 1 : 0,
                    y: currentSubheading === index ? 0 : 20
                  }}
                  transition={{ duration: 0.5 }}
                  className={`text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 absolute left-0 right-0 mx-auto max-w-3xl ${currentSubheading === index ? "block" : "hidden"
                    }`}
                >
                  {text}
                </motion.p>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <AuthProtectedLink href="/tools/doubt-solving">
                <Button size="lg" className="transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-medium rounded-xl flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </AuthProtectedLink>
            </div>

            <div className="mt-8 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Trusted by 10,000+ students and educators worldwide</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
