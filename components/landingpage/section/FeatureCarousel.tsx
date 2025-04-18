import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../ui/Button";

interface FeatureCardProps {
  title: string;
  color: string;
  children: React.ReactNode;
  isActive: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  color,
  children,
  isActive,
}) => {
  return (
    <div
      className={`flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-18px)] h-[400px] rounded-3xl overflow-hidden transition-all duration-500 ease-in-out ${
        isActive ? "scale-105 shadow-lg" : "scale-95 opacity-80"
      }`}
      style={{ backgroundColor: color }}
    >
      <div className="p-8 h-full flex flex-col">
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
          {title}
        </h3>
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

const FEATURES = [
  {
    id: 1,
    title: "Study Resources",
    color: "rgba(142, 209, 252, 0.8)",
    content: (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm h-full">
        <h4 className="text-sm md:text-lg mb-2">MCAT Study Materials</h4>
        <div className="bg-white rounded-lg p-2 md:p-3 mb-2">
          <div className="flex justify-between">
            <span className="text-xs md:text-sm">Biochemistry</span>
            <span className="text-xs md:text-sm text-cyan-600">89%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div
              className="bg-cyan-600 h-2 rounded-full"
              style={{ width: "89%" }}
            ></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 md:p-3">
          <div className="flex justify-between">
            <span className="text-xs md:text-sm">Anatomy</span>
            <span className="text-xs md:text-sm text-cyan-600">76%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div
              className="bg-cyan-600 h-2 rounded-full"
              style={{ width: "76%" }}
            ></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Study Guides",
    color: "rgba(241, 180, 255, 0.8)",
    content: (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm h-full">
        <h4 className="text-sm md:text-lg mb-2">Medical Terminology</h4>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
              <span className="text-xs md:text-sm">A</span>
            </div>
            <div className="h-[2px] w-10 md:w-16 bg-gray-300"></div>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs md:text-sm">B</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs md:text-sm text-gray-600">
          <span>Outline</span>
          <span className="text-purple-700 border-b-2 border-purple-700 font-medium">
            Quick reference
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Flashcards",
    color: "rgba(126, 143, 254, 0.8)",
    content: (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm h-full">
        <div className="relative h-32 md:h-40 w-full bg-white rounded-xl shadow-md p-3 md:p-4 flex items-center justify-center transform rotate-3">
          <div className="text-center">
            <h4 className="text-sm md:text-lg font-medium">superior</h4>
            <h4 className="text-sm md:text-lg font-medium">vena cava</h4>
          </div>
          <div className="absolute -right-3 -bottom-3 md:-right-4 md:-bottom-4">
            <img
              src="/lovable-uploads/2f36f0e3-9b06-410e-bdde-4c767ca2290b.png"
              alt="Heart anatomy illustration"
              className="w-20 h-20 md:w-28 md:h-28"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Practice Tests",
    color: "rgba(255, 198, 140, 0.8)",
    content: (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm h-full">
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3">
          <div>
            <p className="text-xs md:text-sm text-gray-600">Score</p>
            <p className="text-xs md:text-sm font-bold">84%</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-600">Results</p>
            <p className="text-xs md:text-sm font-bold">76/90</p>
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-600">Time</p>
            <p className="text-xs md:text-sm font-bold">70m</p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <span className="mr-2 text-sm md:text-base">1.</span>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-2 text-sm md:text-base">2.</span>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Progress Tracking",
    color: "rgba(144, 238, 144, 0.8)",
    content: (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-sm h-full">
        <h4 className="text-sm md:text-lg mb-2">Application Progress</h4>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs md:text-sm">Personal Statement</span>
            <span className="text-xs md:text-sm font-medium text-green-600">
              Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-green-500 h-2 rounded-full w-full"></div>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs md:text-sm">
              Letters of Recommendation
            </span>
            <span className="text-xs md:text-sm font-medium text-amber-500">
              In Progress
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-amber-500 h-2 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs md:text-sm">School Selection</span>
            <span className="text-xs md:text-sm font-medium text-cyan-600">
              8/12
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-cyan-600 h-2 rounded-full"
              style={{ width: "67%" }}
            ></div>
          </div>
        </div>
      </div>
    ),
  },
];

const FeatureCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState(1);
  const totalFeatures = FEATURES.length;

  // Determine visible cards based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      console.log("Width:", width); // Debugging line
      if (width >= 1024) {
        // large screens - 4 cards
        setVisibleCards(4);
      } else if (width >= 768 && width < 1024) {
        // medium-large screens - 3 cards
        setVisibleCards(3);
      } else if (width >= 640 && width < 768) {
        // medium-small screens - 2 cards{
        // medium screens - 2 cards
        setVisibleCards(2);
      } else {
        // small screens - 1 card
        setVisibleCards(1);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNext = () => {
    // Only increment if we haven't reached the end
    if (activeIndex + visibleCards < totalFeatures) {
      setActiveIndex((prevIndex) => prevIndex + 1);
    } else {
      // Loop back to the beginning
      setActiveIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prevIndex) => prevIndex - 1);
    } else {
      // Loop to the end
      setActiveIndex(totalFeatures - visibleCards);
    }
  };

  // Calculate which cards should be visible and active
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = 0; i < visibleCards; i++) {
      const idx = (activeIndex + i) % totalFeatures;
      if (idx < totalFeatures) {
        indices.push(idx);
      }
    }
    return indices;
  };

  const visibleIndices = getVisibleIndices();

  // Show slider buttons only if there are more features than visible cards
  const showSliderButtons = totalFeatures > visibleCards;

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth =
        carouselRef.current.querySelector("div")?.offsetWidth || 0;
      const gap = 24; // 6 rem in pixels

      carouselRef.current.scrollTo({
        left: activeIndex * (cardWidth + gap),
        behavior: "smooth",
      });
    }
  }, [activeIndex, visibleCards]);

  return (
    <section className="py-12 px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex flex-nowrap overflow-x-hidden gap-6 py-8 px-4"
          >
            {FEATURES.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                color={feature.color}
                isActive={visibleIndices.includes(index)}
              >
                {feature.content}
              </FeatureCard>
            ))}
          </div>

          {showSliderButtons && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md z-10 rounded-full"
                onClick={handlePrev}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md z-10 rounded-full"
                onClick={handleNext}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {FEATURES.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                visibleIndices.includes(index) ? "bg-cyan-600" : "bg-gray-300"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;
