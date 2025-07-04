"use client";

import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import AuthProtectedLink from "../AuthProtectedLink";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 px-6 md:px-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/80 dark:from-transparent dark:via-gray-900/30 dark:to-gray-900/50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-violet-300/10 to-purple-300/10 rounded-full filter blur-3xl -z-10"></div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center p-10 md:p-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Ready to Transform Your Learning Experience?
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Join thousands of students who are already benefiting from Manetho's AI-powered educational tools.
          </p>

          <div className="flex justify-center">
            <AuthProtectedLink href="/tools/doubt-solving">
              <Button size="lg" className="transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-6 text-lg font-medium rounded-xl flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </AuthProtectedLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection; 