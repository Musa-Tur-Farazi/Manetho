import { Check } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  benefits,
  color,
}) => {
  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${color}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 mb-5">{description}</p>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FeatureDetails = () => {
  const features = [
    {
      title: "AI Doubt Solving",
      description:
        "Get instant answers to your academic questions with our advanced AI technology.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-600"
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
      color: "bg-blue-100",
    },
    {
      title: "Comprehensive Study Materials",
      description:
        "Access a vast library of high-quality study resources for all subjects and levels.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-600"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      benefits: [
        "Well-structured notes, summaries, and guides",
        "Visual learning aids like diagrams and charts",
        "Practice problems with step-by-step solutions",
      ],
      color: "bg-purple-100",
    },
    {
      title: "Collaborative Learning",
      description:
        "Connect with peers in virtual study groups to learn together and share knowledge.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-indigo-600"
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
      color: "bg-indigo-100",
    },
    {
      title: "Smart Learning Tools",
      description:
        "Leverage AI-powered learning tools designed to make studying more effective and efficient.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-600"
        >
          <path d="M12 2v8"></path>
          <path d="m16 6-4-4-4 4"></path>
          <rect x="2" y="14" width="20" height="8" rx="2"></rect>
          <path d="M6 18h.01"></path>
          <path d="M10 18h.01"></path>
        </svg>
      ),
      benefits: [
        "Flashcards with spaced repetition for better retention",
        "Personalized study schedules based on your goals",
        "Progress tracking across subjects and topics",
      ],
      color: "bg-orange-100",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features Designed for Learning Success
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Manetho's AI-powered platform provides everything you need to enhance your learning experience and achieve academic excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureDetails;
