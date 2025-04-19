"use client";

import { useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const features = {
    free: [
      "Basic AI doubt solving (5 questions/day)",
      "Access to public study materials",
      "Limited flashcards",
      "Join up to 3 group study sessions",
      "Progress tracking",
    ],
    standard: [
      "Unlimited AI doubt solving",
      "Full access to study materials",
      "Unlimited flashcards",
      "Join unlimited group study sessions",
      "Create up to 3 group study sessions",
      "Detailed progress analytics",
      "Priority support",
    ],
    premium: [
      "Everything in Standard plan",
      "Advanced AI tutoring with step-by-step guidance",
      "Custom study material recommendations",
      "Create unlimited group study sessions",
      "Personalized learning paths",
      "Offline access to materials",
      "24/7 premium support",
      "Exam preparation tools",
    ],
  };

  const pricing = {
    free: {
      monthly: 0,
      annual: 0,
    },
    standard: {
      monthly: 9.99,
      annual: 99.99,
    },
    premium: {
      monthly: 19.99,
      annual: 199.99,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 dark:text-white">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
          Choose the plan that best fits your learning needs
        </p>

        <div className="inline-flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-full">
          <button
            onClick={() => setAnnual(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium ${!annual
                ? "bg-white dark:bg-slate-700 shadow-sm"
                : "text-gray-700 dark:text-gray-300"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium ${annual
                ? "bg-white dark:bg-slate-700 shadow-sm"
                : "text-gray-700 dark:text-gray-300"
              }`}
          >
            Annual <span className="text-cyan-600 dark:text-cyan-400 ml-1">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-transform duration-300 hover:-translate-y-1">
          <div className="p-8">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Free</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started with basic features</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold dark:text-white">$0</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">/ forever</span>
            </div>

            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800"
              href="/signup"
            >
              Get Started
            </Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-8">
            <h3 className="font-semibold mb-4 dark:text-white">What's included:</h3>
            <ul className="space-y-3">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standard Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border-2 border-cyan-500 dark:border-cyan-600 transform scale-105 z-10 relative transition-transform duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 bg-cyan-500 dark:bg-cyan-600 text-white text-center py-1 text-sm font-medium">
            MOST POPULAR
          </div>
          <div className="p-8 pt-12">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Standard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Perfect for dedicated students</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold dark:text-white">
                ${annual ? pricing.standard.annual : pricing.standard.monthly}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                / {annual ? "year" : "month"}
              </span>
            </div>

            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700"
              href="/signup"
            >
              Get Started
            </Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-8">
            <h3 className="font-semibold mb-4 dark:text-white">What's included:</h3>
            <ul className="space-y-3">
              {features.standard.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 transition-transform duration-300 hover:-translate-y-1">
          <div className="p-8">
            <h2 className="text-xl font-bold mb-2 dark:text-white">Premium</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Advanced features for serious learners</p>

            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold dark:text-white">
                ${annual ? pricing.premium.annual : pricing.premium.monthly}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                / {annual ? "year" : "month"}
              </span>
            </div>

            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800"
              href="/signup"
            >
              Get Started
            </Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-8">
            <h3 className="font-semibold mb-4 dark:text-white">What's included:</h3>
            <ul className="space-y-3">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-2 dark:text-white">
              Can I switch plans later?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. If you upgrade, we'll prorate the remaining time on your current plan. If you downgrade, the new plan will take effect at the end of your current billing cycle.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-2 dark:text-white">
              Do you offer student discounts?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! We offer a 20% discount for students with a valid .edu email address or other proof of enrollment. Contact our support team to apply for the discount.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-2 dark:text-white">
              Is there a free trial?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We offer a 14-day free trial of our Standard plan for new users. No credit card required to start. You can downgrade to the Free plan before the trial ends to avoid any charges.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium mb-2 dark:text-white">
              Do you offer refunds?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with your experience, contact our support team within 30 days of your purchase for a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-800 rounded-xl p-8 md:p-12 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your learning experience?</h2>
        <p className="text-white/90 mb-8 max-w-3xl mx-auto">
          Join thousands of students who are already using Manetho to enhance their studies, solve academic doubts, and collaborate with peers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-white text-cyan-700 hover:bg-gray-100 px-8 py-3"
            href="/signup"
          >
            Get Started for Free
          </Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/10 px-8 py-3"
            href="/contact"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
} 