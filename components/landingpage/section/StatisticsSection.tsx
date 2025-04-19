"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Book, Clock, Award } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  color: string;
}

const StatCard = ({ icon, value, label, suffix = "", color }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      setCount(Math.floor(start));

      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => {
      clearInterval(timer);
    };
  }, [value, isVisible]);

  return (
    <div
      ref={cardRef}
      className={`${isVisible ? "animate-fade-up opacity-100" : "opacity-0"} backdrop-blur-lg bg-white/10 dark:bg-slate-800/10 rounded-2xl p-6 border border-white/20 dark:border-slate-700/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${color}`}>
        {icon}
      </div>
      <div className="flex items-baseline">
        <span ref={countRef} className="text-4xl font-bold">{count}</span>
        <span className="text-lg ml-1">{suffix}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{label}</p>
    </div>
  );
};

const StatisticsSection = () => {
  return (
    <section className="py-16 px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Trusted by Students Worldwide
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of students who have transformed their learning experience with Manetho.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
            value={50000}
            label="Active Students"
            suffix="+"
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            icon={<Book className="w-7 h-7 text-purple-600 dark:text-purple-400" />}
            value={25000}
            label="Study Materials"
            suffix="+"
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            icon={<Clock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />}
            value={2000000}
            label="Hours of Study"
            suffix="+"
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            icon={<Award className="w-7 h-7 text-amber-600 dark:text-amber-400" />}
            value={98}
            label="Satisfaction Rate"
            suffix="%"
            color="bg-amber-100 dark:bg-amber-900/30"
          />
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection; 