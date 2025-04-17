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
      title: "Smart Study Resources",
      description:
        "AI-powered study materials tailored to medical school requirements.",
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
          className="text-blue-600"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
      benefits: [
        "Personalized study plans based on your strengths and weaknesses",
        "High-yield content focused on what matters most for admissions",
        "Progress tracking to optimize your study efficiency",
      ],
      color: "bg-blue-100",
    },
    {
      title: "Comprehensive Study Guides",
      description:
        "Detailed study guides covering all topics for medical school entrance exams.",
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" x2="8" y1="13" y2="13"></line>
          <line x1="16" x2="8" y1="17" y2="17"></line>
          <line x1="10" x2="8" y1="9" y2="9"></line>
        </svg>
      ),
      benefits: [
        "Concept maps and visual learning tools",
        "Quick reference guides for rapid review",
        "Annotated explanations from medical professionals",
      ],
      color: "bg-purple-100",
    },
    {
      title: "Interactive Flashcards",
      description:
        "Master medical terminology and concepts with our intelligent flashcard system.",
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
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <path d="M3 15h18"></path>
        </svg>
      ),
      benefits: [
        "Spaced repetition algorithm for optimal retention",
        "Rich media integration with anatomical diagrams",
        "Create your own custom flashcard decks",
      ],
      color: "bg-indigo-100",
    },
    {
      title: "Realistic Practice Tests",
      description:
        "Simulate the real exam experience with our adaptive practice tests.",
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
          <path d="M15 7v2a2 2 0 0 1-2 2H9v6"></path>
          <line x1="21" x2="3" y1="11" y2="11"></line>
          <path d="M18 16v2a2 2 0 0 1-2 2H6v-3"></path>
          <path d="M12 3v14"></path>
        </svg>
      ),
      benefits: [
        "MCAT, DAT, and other exam-style questions",
        "Detailed performance analytics to target weak areas",
        "Timed sections to build test-taking stamina",
      ],
      color: "bg-orange-100",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features Designed for Medical School Success
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides everything you need to prepare for
            medical school admissions in one place.
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