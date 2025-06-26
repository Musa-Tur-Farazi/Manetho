import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/landingpage/section/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manetho",
  description: "AI-powered learning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#0891b2', // cyan-600
          colorTextOnPrimaryBackground: '#ffffff',
          colorBackground: '#ffffff',
          colorText: '#1f2937', // gray-800
          colorTextSecondary: '#4b5563', // gray-600
          colorInputBackground: '#f9fafb', // gray-50
          colorInputText: '#1f2937', // gray-800
          colorDanger: '#ef4444', // red-500
          fontFamily: 'var(--font-geist-sans)',
          borderRadius: '0.5rem',
          colorSuccess: '#10b981', // emerald-500
          colorWarning: '#f59e0b', // amber-500
        },
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "bottom",
          showOptionalFields: true,
          logoPlacement: "inside",
          logoImageUrl: "/logo.png", // Add your logo path here if you have one
          helpPageUrl: "",
          privacyPageUrl: "",
          termsPageUrl: "",
        },
        elements: {
          // Card and containers
          card: "bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-800",
          rootBox: "bg-gray-50 dark:bg-gray-900",

          // Text elements - headers
          headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
          headerSubtitle: "text-gray-600 dark:text-gray-300",

          // Form and input styling
          form: "space-y-6",
          formButtonPrimary: "w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 py-2.5 rounded-lg",
          formFieldLabel: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1",
          formFieldInput: "block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-200 shadow-sm",
          formFieldAction: "text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium",
          formFieldHintText: "mt-1 text-sm text-gray-500 dark:text-gray-400",

          // Social media buttons
          socialButtonsProviderIcon: "w-5 h-5",
          socialButtonsBlockButton: "w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 py-2.5 rounded-lg",
          socialButtonsIconButton: "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-medium shadow-sm hover:shadow transition-all duration-200 rounded-lg p-2",
          socialButtons: "!text-gray-800 dark:!text-white font-medium",

          // Separator
          dividerLine: "bg-gray-300 dark:bg-gray-700 h-px",
          dividerText: "mx-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 text-sm",

          // Footer
          footerActionText: "text-gray-600 dark:text-gray-400 text-center mt-4",
          footerActionLink: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium",

          // Alert boxes
          alert: "border rounded-lg p-4 mb-4",
          alertText: "text-sm",

          // Success states
          alertSuccess: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300",

          // Error states
          alertError: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300",
          formFieldError: "text-sm text-red-600 dark:text-red-400 mt-1",
          formFieldErrorText: "text-red-600 dark:text-red-400",

          // Misc elements
          identityPreviewText: "text-gray-700 dark:text-gray-300",
          identityPreviewEditButton: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300",
          otherMethods: "dark:text-white",

          // Internal link highlighting
          internal: "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300",

          // Overflow scrolling
          scrollBox: "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent",
        }
      }}
      // Configure redirect URLs for custom auth pages
      signInUrl="/custom-auth/sign-in"
      signUpUrl="/custom-auth/sign-up"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <html lang="en" className="h-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        >
          {/* Global CAPTCHA element for Clerk */}
          <div id="clerk-captcha" style={{ display: 'none' }}></div>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
