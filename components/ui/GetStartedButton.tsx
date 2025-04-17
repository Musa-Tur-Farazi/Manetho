import { SignInButton, useAuth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

function GetStartedButton() {
  return (
    <SignInButton forceRedirectUrl={"/home"}>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white rounded-lg
             transition-all duration-200 font-semibold font-sans shadow-lg shadow-blue-500/20"
      >
        <LogIn className="w-4 h-4 transition-transform" />
        <span>Get started </span>
      </button>
    </SignInButton>
  );
}
export default GetStartedButton;
