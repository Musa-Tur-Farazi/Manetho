"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../../ui/Button";
import { Mail, Github, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1000);
  };

  return (
    <footer className="py-10 px-6 md:px-10 backdrop-blur-lg bg-white/5 dark:bg-slate-900/5 border-t border-white/10 dark:border-gray-800/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">Manetho</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your AI-powered companion for learning, doubt solving, and academic success.
            </p>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-5 mb-6">
              <h3 className="font-medium mb-3 dark:text-white">Subscribe to our newsletter</h3>
              {isSubscribed ? (
                <p className="text-green-600 dark:text-green-400">Thanks for subscribing!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="px-3 py-2 rounded-md bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
              )}
            </div>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4 dark:text-white">Study Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/doubt-solving" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  AI Doubt Solving
                </Link>
              </li>
              <li>
                <Link href="/tools/flashcards" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Flashcards
                </Link>
              </li>
              <li>
                <Link href="/tools/study-materials" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link href="/tools/group-study" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Group Study
                </Link>
              </li>
              <li>
                <Link href="/tools/progress-tracking" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Progress Tracking
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 dark:text-white">Subjects</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/subjects/mathematics" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Mathematics
                </Link>
              </li>
              <li>
                <Link href="/subjects/physics" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Physics
                </Link>
              </li>
              <li>
                <Link href="/subjects/chemistry" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Chemistry
                </Link>
              </li>
              <li>
                <Link href="/subjects/biology" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Biology
                </Link>
              </li>
              <li>
                <Link href="/subjects/computer-science" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Computer Science
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 dark:text-white">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2025 Manetho. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400 text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-500 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-400 text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
