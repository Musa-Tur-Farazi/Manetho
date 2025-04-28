"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Github, Twitter, Linkedin, Instagram, Mail, ArrowUpRight } from "lucide-react";

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

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Github className="h-5 w-5" />, href: "https://github.com", label: "GitHub" },
    { icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com", label: "Instagram" },
  ];

  const aboutLinks = [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const legalLinks = [];

  return (
    <footer
      ref={footerRef}
      className="py-16 px-6 md:px-10 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-100/80 dark:from-transparent dark:via-gray-900/50 dark:to-gray-900/80 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-12">
          {/* Brand column */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">Manetho</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your AI-powered companion for learning, doubt solving, and academic success.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md flex items-center justify-center text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-gray-600 dark:text-gray-300">contact@manetho.edu</span>
              </div>
            </div>
          </motion.div>

          {/* About links */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ul className="space-y-4">
              {aboutLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-cyan-600 dark:text-gray-300 dark:hover:text-cyan-400 flex items-center group transition-all duration-300"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
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
