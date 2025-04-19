"use client";

import { ThemeProvider } from "../../../components/theme/ThemeProvider";
import Navbar from "../../../components/landingpage/layout/Navbar";
import Footer from "../../../components/landingpage/section/Footer";
import ThemeToggle from "../../../components/theme/ThemeToggle";
import { useState, useEffect } from "react";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <Navbar isScrolled={isScrolled} />
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <main className="relative pt-24">
          {children}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
} 