"use client";

import { Button } from "../../ui/Button";
import GetStartedButton from "../../ui/GetStartedButton";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";

const CallToAction = () => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-24 px-6 md:px-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 opacity-50"></div>

      <div
        ref={ctaRef}
        className={`transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          } backdrop-blur-xl bg-white/10 dark:bg-slate-900/10 border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 md:p-16 max-w-6xl mx-auto relative overflow-hidden`}
      >
        <div className="absolute w-96 h-96 bg-blue-300 dark:bg-blue-500/20 rounded-full -top-20 -right-20 blur-3xl opacity-20"></div>
        <div className="absolute w-96 h-96 bg-purple-300 dark:bg-purple-500/20 rounded-full -bottom-20 -left-20 blur-3xl opacity-20"></div>

        <div className="relative z-10 md:grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 dark:text-white">
              Ready to elevate your learning experience?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of students using Manetho's AI-powered platform to solve doubts instantly, access quality study materials, and collaborate effectively.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <GetStartedButton className="w-full sm:w-auto" />

              <Button
                variant="outline"
                size="lg"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-cyan-200 dark:border-cyan-900 text-cyan-600 dark:text-cyan-400 px-8 py-6 text-lg w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Schedule a Demo
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Why students love Manetho</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Instant answers to academic questions</p>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">High-quality study materials</p>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Interactive collaboration tools</p>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Personalized learning experience</p>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1 mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">Available on all devices, anytime</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
