"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annually: 0 },
      description: "Basic access to learning tools",
      features: [
        "AI-powered doubt solving (limited queries)",
        "Basic study materials",
        "Create 5 flashcard sets",
        "Join 2 study groups",
      ],
      buttonText: "Get Started",
      buttonLink: "/signup",
      popular: false,
    },
    {
      name: "Premium",
      price: { monthly: 14.99, annually: 149.99 },
      description: "Enhanced learning experience",
      features: [
        "Unlimited AI doubt solving",
        "Premium study materials for all subjects",
        "Unlimited flashcard sets",
        "Create & join unlimited study groups",
        "Progress tracking and analytics",
        "Personalized study schedules",
      ],
      buttonText: "Choose Premium",
      buttonLink: "/signup?plan=premium",
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: 29.99, annually: 299.99 },
      description: "For educational institutions",
      features: [
        "All Premium features",
        "Institution dashboard",
        "Student performance analytics",
        "Bulk account management",
        "Custom content integration",
        "API access",
        "Priority support",
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      popular: false,
    },
  ];

  return (
    <>
      <PageHeader
        title="Simple, Transparent Pricing"
        description="Choose the plan that's right for you and start your learning journey today."
      >
        <div className="flex justify-center items-center mt-8 space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${!annual
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${annual
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300"
              }`}
          >
            Annually <span className="text-cyan-600 dark:text-cyan-400 text-xs">Save 15%</span>
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border ${plan.popular
                ? "border-cyan-500 dark:border-cyan-600 relative"
                : "border-transparent"
              }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {plan.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${annual ? plan.price.annually : plan.price.monthly}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  {annual ? "/year" : "/month"}
                </span>
              </div>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full justify-center mb-8"
                size="lg"
              >
                {plan.buttonText}
              </Button>
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Need something customized?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          We offer custom solutions for schools, universities, and educational organizations.
          Contact our sales team to discuss your specific requirements.
        </p>
        <Button size="lg">Contact Sales</Button>
      </div>
    </>
  );
} 