"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "../../ui/Button";

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
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-md flex flex-col h-full transform transition-all duration-300 hover:scale-105">
      <div className="flex items-center mb-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {testimonial.role}
          </p>
        </div>
      </div>
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating
                ? "text-amber-500 fill-amber-500"
                : "text-gray-300 dark:text-gray-600"
              }`}
          />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 flex-1 italic">
        "{testimonial.content}"
      </p>
    </div>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState(3);

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
    <section className="py-16 px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Don't just take our word for it. Hear from some of our students who have transformed their learning with Manetho.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 overflow-hidden">
            {getVisibleTestimonials().map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0"
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md z-10 rounded-full"
          >
            <ChevronLeft className="h-5 w-5 dark:text-gray-300" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md z-10 rounded-full"
          >
            <ChevronRight className="h-5 w-5 dark:text-gray-300" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === activeIndex
                  ? "bg-cyan-600 dark:bg-cyan-500"
                  : "bg-gray-300 dark:bg-gray-600"
                }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 