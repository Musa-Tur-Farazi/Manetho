"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "simple";
}

const Logo = ({
  className = "",
  showIcon = true,
  size = "md",
  variant = "default"
}: LogoProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const getTextContent = () => {
    switch (variant) {
      case "gradient":
        return (
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
            Manetho
          </span>
        );
      case "simple":
        return (
          <span className="text-gray-900 dark:text-white font-semibold">
            Manetho
          </span>
        );
      default:
        return (
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
            Manetho
          </span>
        );
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-1 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {showIcon && (
        <motion.div
          className="relative"
          animate={{
            rotate: ["0deg", "5deg", "-5deg", "0deg"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-sm opacity-20 ${iconSizes[size]}`} />

            {/* Brain icon - smaller and more balanced */}
            <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
              <Brain className="w-4/5 h-4/5 text-indigo-500 stroke-2" fill="none" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Text with more natural font and less overlap */}
      <div className={`${sizeClasses[size]} font-medium tracking-wide`}>
        {getTextContent()}
      </div>
    </motion.div>
  );
};

export default Logo; 