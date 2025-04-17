import { SignInButton, useAuth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

function LoginButton() {
  return (
    <SignInButton forceRedirectUrl={"/home"}>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white rounded-lg
             transition-all duration-200 font-semibold font-sans shadow-lg shadow-blue-500/20"
      >
        <LogIn className="w-3 h-3 transition-transform" />
        <span>Login</span>
      </button>
    </SignInButton>
  );
}
export default LoginButton;
