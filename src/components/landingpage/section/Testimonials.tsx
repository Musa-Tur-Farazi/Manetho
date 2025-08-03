"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "../../ui/Button";
// Removed Framer Motion imports to fix React 19 compatibility

type Testimonial = {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sophia Chen",
    role: "Computer Science Student",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    content:
      "Manetho has been a game-changer for my studies. The AI doubt solving feature is like having a personal tutor available 24/7. I can get instant help whenever I'm stuck on a problem.",
    rating: 5,
  },
  {
    id: 2,
    name: "Raj Patel",
    role: "Physics Major",
    image: "https://randomuser.me/api/portraits/men/42.jpg",
    content:
      "The group study feature in Manetho has made remote collaboration actually enjoyable. My study group connects regularly to solve problems together, and it feels like we're in the same room.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Biology Student",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    content:
      "I love how Manetho's flashcard system adapts to my learning pace. It focuses more on the concepts I struggle with and less on what I already know well. My test scores have improved dramatically.",
    rating: 4,
  },
  {
    id: 4,
    name: "Marcus Johnson",
    role: "Mathematics Student",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    content:
      "The quality of study materials on Manetho is exceptional. Everything is well-organized and clearly explained. The interactive elements make even complex topics easier to understand.",
    rating: 5,
  },
  {
    id: 5,
    name: "Aisha Rahman",
    role: "Chemistry Major",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    content:
      "As someone who struggles with focus, Manetho's progress tracking has been incredibly motivating. Seeing my improvement over time keeps me going, and the personalized study schedule fits perfectly with my other commitments.",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="relative h-full bg-gradient-to-br from-white via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 rounded-2xl shadow-xl overflow-hidden border border-purple-100 dark:border-purple-900/30 transition-all duration-300"
    >
      {/* Animated background effects */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 dark:from-purple-700/20 dark:to-indigo-700/20 rounded-2xl z-0 group-hover:opacity-100 blur animate-tilt"></div>
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full filter blur-xl z-0 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 -ml-6 -mb-6 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full filter blur-xl z-0 animate-pulse delay-700"></div>

      {/* Quote icon */}
      <div className="absolute top-6 right-6 text-purple-200 dark:text-purple-800 opacity-50 z-10">
        <Quote size={40} />
      </div>

      <div className="p-2 relative z-10" style={{ transform: "translateZ(20px)" }}>
        <div className="rounded-xl p-6">
          {/* Content first for better readability */}
          <p className="text-gray-700 dark:text-gray-200 italic mb-6 relative text-lg" style={{ transform: "translateZ(30px)" }}>
            "{testimonial.content}"
          </p>

          <div className="mt-8 pt-6 border-t border-purple-100 dark:border-purple-900/30">
            <div className="flex justify-between items-center" style={{ transform: "translateZ(40px)" }}>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-sm opacity-40 animate-pulse"></div>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="relative w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white hover:translate-x-1 transition-transform duration-300">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="opacity-0 animate-fadeIn"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <Star
                      className={`h-4 w-4 ${i < testimonial.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState(3);
  const [isHoverPrev, setIsHoverPrev] = useState(false);
  const [isHoverNext, setIsHoverNext] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleTestimonials(3);
      } else if (window.innerWidth >= 768) {
        setVisibleTestimonials(2);
      } else {
        setVisibleTestimonials(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (autoplay) {
      intervalRef.current = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, activeIndex]);

  const nextTestimonial = () => {
    setActiveIndex((prev) =>
      prev + visibleTestimonials >= testimonials.length
        ? 0
        : prev + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) =>
      prev === 0 ? testimonials.length - visibleTestimonials : prev - 1
    );
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = activeIndex; i < activeIndex + visibleTestimonials; i++) {
      const index = i % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  return (
    <section className="py-16 px-6 md:px-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-[5%] w-64 h-64 bg-gradient-to-br from-purple-300/10 to-indigo-300/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-[5%] w-72 h-72 bg-gradient-to-tr from-indigo-300/10 to-purple-300/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
            What Our Students Say
          </h2>

          <div className="relative">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Don&apos;t just take our word for it. Hear from our students who have transformed their learning experience with Manetho.
            </p>

            {/* Decorative underline */}
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mt-8 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="relative"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div className="flex gap-8 overflow-hidden">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 opacity-0 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          <div
            onMouseEnter={() => setIsHoverPrev(true)}
            onMouseLeave={() => setIsHoverPrev(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 hover:scale-110 transition-transform duration-300"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-full w-12 h-12 transition-all duration-300 ${isHoverPrev ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-indigo-900/40 dark:border-purple-800" : ""
                }`}
            >
              <ChevronLeft className={`h-5 w-5 ${isHoverPrev ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`} />
            </Button>
          </div>

          <div
            onMouseEnter={() => setIsHoverNext(true)}
            onMouseLeave={() => setIsHoverNext(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 hover:scale-110 transition-transform duration-300"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-full w-12 h-12 transition-all duration-300 ${isHoverNext ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-indigo-900/40 dark:border-purple-800" : ""
                }`}
            >
              <ChevronRight className={`h-5 w-5 ${isHoverNext ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`} />
            </Button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.slice(0, testimonials.length - visibleTestimonials + 1).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-150 ${index === activeIndex
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md scale-125"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-300 dark:hover:bg-purple-700"
                }`}
              onClick={() => {
                setActiveIndex(index);
                setAutoplay(false);
                setTimeout(() => setAutoplay(true), 8000);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 