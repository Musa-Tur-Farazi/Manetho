import { Button } from "../../ui/Button";
import LoginButton from "../../ui/LoginButton";
import TryNowButton from "../../ui/GetStartedButton";
import { use, useEffect } from "react";
import GetStartedButton from "../../ui/GetStartedButton";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function HeroSection() {
  const { isSignedIn } = useAuth();
  // const { isSigneIn } = useAuth();

  return (
    <section className="pt-32 pb-16 px-6 md:px-10 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          How do you want to prepare for{" "}
          <span className="text-cyan-600">med school?</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
          Master everything you need for medical college admissions with our
          AI-powered flashcards, practice tests, and study activities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg"
          >
            Sign up for free
          </Button> */}
          <GetStartedButton />

          <Button variant="link" className="text-cyan-600 text-lg">
            I'm already a student
          </Button>
        </div>
      </div>
    </section>
  );
}
