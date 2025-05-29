"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Book, Clock, Award, CheckCircle, Zap, GraduationCap, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  color: string;
  gradient: string;
  delay: number;
}

const StatCard = ({ icon, value, label, suffix = "", color, gradient, delay }: StatCardProps) => {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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
    const duration = 2500;
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

  // Format large numbers with commas
  const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: delay * 0.15 }}
      className="h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative h-full overflow-hidden rounded-2xl transition-all duration-500 ${isHovered ? 'shadow-2xl translate-y-[-10px]' : 'shadow-lg'
          }`}
      >
        <div className={`absolute inset-0 ${gradient} opacity-70 transition-opacity duration-500`}></div>
        <div className={`absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${isHovered ? 'bg-opacity-60 dark:bg-opacity-60' : ''
          }`}></div>

        <div className="relative p-8 flex flex-col items-center text-center h-full z-10">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${color} transform transition-transform duration-500 ${isHovered ? 'scale-110' : ''
              }`}
          >
            <div className={`transform transition-all duration-500 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
              {icon}
            </div>
          </div>

          <div className="flex items-baseline justify-center mb-2">
            <span className="text-5xl font-extrabold text-color">
              {formattedCount}
            </span>
            <span className="text-2xl font-bold ml-1 text-color">{suffix}</span>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{label}</p>

          <div className={`mt-4 w-12 h-1 rounded-full ${color} transform transition-all duration-500 ${isHovered ? 'w-24' : ''
            }`}></div>
        </div>
      </div>
    </motion.div>
  );
};

const StatisticsSection = () => {
  return (
    <section className="py-24 px-6 md:px-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-purple-200/20 dark:bg-purple-900/20 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-emerald-200/20 dark:bg-emerald-900/20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Trusted by Students Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join the community of students who have transformed their learning experience with Manetho.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="[&_.text-color]:text-blue-600 [&_.dark:text-color]:text-blue-400">
            <StatCard
              icon={<Users className="w-9 h-9 text-blue-600 dark:text-blue-400" />}
              value={50000}
              label="Active Students"
              suffix="+"
              color="bg-blue-100 dark:bg-blue-900/40"
              gradient="bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10"
              delay={0}
            />
          </div>
          <div className="[&_.text-color]:text-purple-600 [&_.dark:text-color]:text-purple-400">
            <StatCard
              icon={<GraduationCap className="w-9 h-9 text-purple-600 dark:text-purple-400" />}
              value={25000}
              label="Study Materials"
              suffix="+"
              color="bg-purple-100 dark:bg-purple-900/40"
              gradient="bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10"
              delay={1}
            />
          </div>
          <div className="[&_.text-color]:text-emerald-600 [&_.dark:text-color]:text-emerald-400">
            <StatCard
              icon={<Zap className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />}
              value={2000000}
              label="Hours of Study"
              suffix="+"
              color="bg-emerald-100 dark:bg-emerald-900/40"
              gradient="bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10"
              delay={2}
            />
          </div>
          <div className="[&_.text-color]:text-rose-600 [&_.dark:text-color]:text-rose-400">
            <StatCard
              icon={<Heart className="w-9 h-9 text-rose-600 dark:text-rose-400" />}
              value={98}
              label="Satisfaction Rate"
              suffix="%"
              color="bg-rose-100 dark:bg-rose-900/40"
              gradient="bg-gradient-to-br from-rose-400/20 to-orange-400/20 dark:from-rose-400/10 dark:to-orange-400/10"
              delay={3}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection; 