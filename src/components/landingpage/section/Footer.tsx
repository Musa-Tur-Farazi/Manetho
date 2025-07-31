"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Logo from "../../ui/Logo";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="py-8 px-6 md:px-10 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-100/80 dark:from-transparent dark:via-gray-900/50 dark:to-gray-900/80"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* Bottom section */}
        <motion.div
          className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Logo size="sm" variant="simple" showIcon={false} />
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            © 2025 Manetho. All rights reserved.
            <span className="inline-flex items-center ml-2">
              Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> globally
            </span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
