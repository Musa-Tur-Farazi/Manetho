"use client";

import { Button } from "../../ui/Button";
import { motion } from "framer-motion";
import AuthProtectedLink from "../AuthProtectedLink";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Your AI-Powered{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
                Learning Partner
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
              Personalized learning experience powered by AI. Get instant answers to your academic questions, create custom study materials, and track your progress.
            </p>
            <div className="flex flex-wrap gap-4">
              <AuthProtectedLink href="/tools/doubt-solving">
                <Button size="lg">
                  Start Learning
                </Button>
              </AuthProtectedLink>
              <AuthProtectedLink href="/tools/flashcards">
                <Button variant="outline" size="lg">
                  Explore Tools
                </Button>
              </AuthProtectedLink>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Trusted by 10,000+ students and educators worldwide</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Doubt Solving
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Can you explain how photosynthesis works?
                  </p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 mb-4 border-l-4 border-cyan-500 dark:border-cyan-400">
                  <p className="text-gray-700 dark:text-gray-300">
                    Photosynthesis is the process where plants convert light energy into chemical energy. It happens in chloroplasts using chlorophyll, which captures sunlight. This energy is used to convert CO<sub>2</sub> and water into glucose and oxygen.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    The process has two stages:
                  </p>
                  <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300 mt-2">
                    <li>Light-dependent reactions</li>
                    <li>Calvin cycle (light-independent)</li>
                  </ul>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Instant answers to your questions</span>
                  <AuthProtectedLink href="/tools/doubt-solving" className="text-cyan-600 dark:text-cyan-400 font-medium flex items-center">
                    Try it now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </AuthProtectedLink>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-cyan-400/20 dark:bg-cyan-700/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -left-16 -top-16 w-72 h-72 bg-blue-400/10 dark:bg-blue-700/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
