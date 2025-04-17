import { SignInButton, useAuth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

function LoginButton() {
  
  return (
    <SignInButton mode="modal" forceRedirectUrl={"/home"}>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-800 hover:from-blue-400 hover:to-blue-700 text-white rounded-lg
             transition-all duration-200 font-medium font-semibold font-sans shadow-lg shadow-blue-500/20"
      >
        <LogIn className="w-3 h-3 transition-transform" />
        <span>Login</span>
      </button>
    </SignInButton>

  );
}
export default LoginButton;