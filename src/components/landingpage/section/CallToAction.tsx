"use client";

import { Button } from "../../ui/Button";
import AuthProtectedLink from "../AuthProtectedLink";
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
    <section className="px-6 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 rounded-3xl shadow-xl p-8 md:p-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Join thousands of students who are using Manetho to enhance their studies,
              solve difficult problems, and prepare for exams with confidence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AuthProtectedLink href="/signup">
                <Button
                  className="bg-white text-cyan-700 hover:bg-gray-100 sm:text-lg py-6 px-8"
                >
                  Get Started for Free
                </Button>
              </AuthProtectedLink>
              <AuthProtectedLink href="/pricing">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 sm:text-lg py-6 px-8"
                >
                  View Pricing
                </Button>
              </AuthProtectedLink>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-gradient-to-r from-cyan-400/20 to-blue-400/20 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default CallToAction;
