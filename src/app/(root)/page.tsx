"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/landingpage/layout/Navbar";
import CallToAction from "../../../components/landingpage/section/CallToAction";
import FeatureCarousel from "../../../components/landingpage/section/FeatureCarousel";
import FeatureDetails from "../../../components/landingpage/section/FeatureDetails";
import HeroSection from "../../../components/landingpage/section/HeroSection";
import Footer from "../../../components/landingpage/section/Footer";
import Testimonials from "../../../components/landingpage/section/Testimonials";
import FAQ from "../../../components/landingpage/section/FAQ";
import StatisticsSection from "../../../components/landingpage/section/StatisticsSection";
import { ThemeProvider } from "../../../components/theme/ThemeProvider";
import ThemeToggle from "../../../components/theme/ThemeToggle";

function Landingpage() {
  const { isSignedIn } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/home");
    }
  }, [isSignedIn, router]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <Navbar isScrolled={isScrolled} />
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <main className="relative">
          <HeroSection />
          <StatisticsSection />
          <FeatureCarousel />
          <FeatureDetails />
          <Testimonials />
          <FAQ />
          <CallToAction />
          <Footer />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Landingpage;
