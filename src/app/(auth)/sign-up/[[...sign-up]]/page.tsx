"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/home";
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div className="relative z-10 w-full max-w-md">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#0891b2',
              colorBackground: theme === 'dark' ? '#1f2937' : '#ffffff',
              colorText: theme === 'dark' ? '#f3f4f6' : '#1f2937',
              colorTextSecondary: theme === 'dark' ? '#d1d5db' : '#4b5563',
              colorInputBackground: theme === 'dark' ? '#374151' : '#f9fafb',
              colorInputText: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            },
            elements: {
              card: "bg-white dark:bg-gray-800 shadow-xl rounded-xl",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
              headerSubtitle: "text-gray-600 dark:text-gray-300",
              formButtonPrimary: "bg-cyan-600 hover:bg-cyan-700 text-white",
              formFieldLabel: "text-gray-700 dark:text-gray-300",
              formFieldInput: "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100",
              footerActionText: "text-gray-600 dark:text-gray-400",
              footerActionLink: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300",
              identityPreviewText: "text-gray-700 dark:text-gray-300",
              identityPreviewEditButton: "text-cyan-600 dark:text-cyan-400",
            },
          }}
          afterSignUpUrl={redirectUrl}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return <SignUpContent />;
}