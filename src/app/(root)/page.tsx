"use client";

import { useAuth } from "@clerk/nextjs";
import Navbar from "../../../components/landingpage/layout/Navbar";
import CallToAction from "../../../components/landingpage/section/CallToAction";
import FeatureCarousel from "../../../components/landingpage/section/FeatureCarousel";
import FeatureDetails from "../../../components/landingpage/section/FeatureDetails";
import HeroSection from "../../../components/landingpage/section/HeroSection";

function Landingpage() {
  const { isSignedIn } = useAuth();
  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <Navbar />
      <main className="relative">
        <HeroSection />
        <FeatureCarousel />
        <FeatureDetails />
        <CallToAction />
      </main>

    </div>
  );
};

export default Landingpage;