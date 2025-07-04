"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: "How does Manetho's AI doubt solving work?",
    answer: "Manetho uses advanced AI to provide instant answers to your academic questions. Simply type your doubt or upload a photo of a problem, and our AI will analyze it and provide a clear, detailed explanation tailored to your learning level.",
  },
  {
    question: "Can I use Manetho on different devices?",
    answer: "Yes! Manetho is fully responsive and works seamlessly across all devices including desktops, laptops, tablets, and smartphones. Your progress and materials synchronize automatically, so you can switch between devices without losing your work.",
  },
  {
    question: "How do I join or create a study group?",
    answer: "To join an existing group, browse our 'Study Groups' section and request to join one that interests you. To create your own, click 'Create Group' in the same section, set up your group details and preferences, and then invite others using their email or username.",
  },
  {
    question: "Are the study materials regularly updated?",
    answer: "Absolutely. Our content team and education experts regularly review and update all study materials to ensure they're accurate, relevant, and aligned with current curricula. We also welcome feedback from users to continuously improve our content.",
  },
  {
    question: "What subjects does Manetho cover?",
    answer: "Manetho covers a wide range of subjects including Mathematics, Physics, Chemistry, Biology, Computer Science, and more. We're constantly expanding our library based on user requests and educational trends.",
  },
  {
    question: "Is there a limit to how many questions I can ask the AI?",
    answer: "Different subscription plans offer different usage limits. Free accounts have a monthly question limit, while premium plans offer higher or unlimited questions. You can always see your remaining questions in your account dashboard.",
  },
  {
    question: "How does Manetho's pricing work?",
    answer: "Manetho offers tiered subscription plans including a limited free plan, a standard plan for individual learners, and a premium plan with advanced features. We also offer special rates for schools and educational institutions. Visit our Pricing page for current details.",
  },
];

const FAQItem = ({
  item,
  isOpen,
  toggleOpen,
}: {
  item: FAQItem;
  isOpen: boolean;
  toggleOpen: () => void;
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-none">
      <button
        className="flex justify-between items-center w-full py-4 px-1 text-left font-medium text-gray-900 dark:text-white"
        onClick={toggleOpen}
      >
        <span>{item.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen
            ? "max-h-96 opacity-100 pb-4"
            : "max-h-0 opacity-0"
          }`}
      >
        <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-6 md:px-10 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about Manetho.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-md">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Still have questions?{" "}
            <a href="/contact" className="text-cyan-600 hover:underline dark:text-cyan-400">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 