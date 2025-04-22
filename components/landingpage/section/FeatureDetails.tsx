import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import AuthProtectedLink from "../AuthProtectedLink";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  color: string;
  bgGradient: string;
  learnMoreLink: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  benefits,
  color,
  bgGradient,
  learnMoreLink,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${isHovered ? 'shadow-2xl scale-[1.03]' : 'shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 ${bgGradient} opacity-50 transition-opacity duration-500 ${isHovered ? 'opacity-70' : ''}`}></div>
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md"></div>

      <div className="relative p-8 h-full flex flex-col">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${color} shadow-lg transform transition-transform duration-500 ${isHovered ? 'rotate-6 scale-110' : ''}`}>
          <div className="transform transition-transform duration-500">
            {icon}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>

        <div className="mt-auto">
          <ul className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <li key={index} className={`flex items-start transform transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`}>
                <div className={`flex-shrink-0 ${color} rounded-full p-1 mr-3 mt-0.5`}>
                  <Check className="h-3.5 w-3.5 text-gray-900 dark:text-white" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>

          <AuthProtectedLink href={learnMoreLink}>
            <div className={`inline-flex items-center text-sm font-medium transition-all duration-300 rounded-lg px-4 py-2 
            ${color.replace('bg-', 'bg-opacity-50 hover:bg-opacity-100 text-')} 
            ${color.replace('bg-', '').split('/')[0].replace('-100', '-600')} 
            ${color.includes('dark:') ? color.replace('dark:bg-', 'dark:hover:bg-').replace('/40', '') : ''}
            hover:shadow-md transform hover:-translate-y-1`}>
              Explore Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </AuthProtectedLink>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureDetails = () => {
  const features = [
    {
      title: "AI Doubt Solving",
      description:
        "Get instant answers to your academic questions with the help of our advanced AI.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-600 dark:text-cyan-400"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      benefits: [
        "24/7 instant help with complex concepts and problems",
        "Detailed explanations tailored to your learning style",
        "Support across all major subjects and topics",
      ],
      color: "bg-cyan-100 dark:bg-cyan-900/40",
      bgGradient: "bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20",
      learnMoreLink: "/tools/doubt-solving",
    },
    {
      title: "Personalized Learning Path",
      description:
        "Experience a tailored educational journey designed specifically for your goals and needs.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-600 dark:text-emerald-400"
        >
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
        </svg>
      ),
      benefits: [
        "Custom curriculum tailored to your learning style",
        "Adaptive learning paths that evolve with your progress",
        "Personalized recommendations based on your performance",
      ],
      color: "bg-emerald-100 dark:bg-emerald-900/40",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
      learnMoreLink: "/personal-learning",
    },
    {
      title: "Community Learning",
      description:
        "Connect with a global community of learners to enrich your educational experience.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-600 dark:text-purple-400"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      benefits: [
        "Create or join subject-specific study groups",
        "Schedule group study sessions with shared resources",
        "Engage in academic discussions and problem-solving",
      ],
      color: "bg-purple-100 dark:bg-purple-900/40",
      bgGradient: "bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20",
      learnMoreLink: "/community",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your learning progress with detailed analytics and personalized insights.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-600 dark:text-amber-400"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      benefits: [
        "Track progress across all subjects and topics",
        "Identify strengths and areas for improvement",
        "Set and monitor learning goals with detailed analytics",
      ],
      color: "bg-amber-100 dark:bg-amber-900/40",
      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",
      learnMoreLink: "/progress",
    },
  ];

  return (
    <section className="py-24 px-6 md:px-10 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-transparent dark:from-transparent dark:via-gray-900/30 dark:to-transparent"></div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Features Designed for Learning Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Manetho's AI-powered platform provides everything you need to enhance your learning experience and achieve academic excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureDetails;
