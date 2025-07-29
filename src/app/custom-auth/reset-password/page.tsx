"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, ArrowLeft, Check, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSuccessMessage(`We've sent a recovery code to ${email}`);
      setStep("verify");
    } catch (err: any) {
      console.error("Error requesting password reset:", err);
      setError(err.errors?.[0]?.message || "An error occurred during password reset request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode,
      });

      setSuccessMessage("Code verified successfully");
      setStep("reset");
    } catch (err: any) {
      console.error("Error verifying code:", err);
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      await signIn.resetPassword({
        password,
      });

      setSuccessMessage("Password reset successfully");
      setTimeout(() => {
        router.push("/custom-auth/sign-in");
      }, 2000);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err.errors?.[0]?.message || "An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestResetForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="block w-full pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-200 shadow-sm p-2.5"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isLoaded}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 py-2.5 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : null}
        Send Recovery Code
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </form>
  );

  const renderVerifyCodeForm = () => (
    <form onSubmit={handleVerifyCode} className="space-y-6">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 rounded-lg flex items-start mb-6">
        <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Recovery code sent</p>
          <p className="text-sm">We've sent a code to {email}</p>
        </div>
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Recovery code
        </label>
        <input
          id="code"
          type="text"
          required
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the 6-digit code"
          className="block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-200 shadow-sm p-2.5 text-center tracking-widest text-lg"
          maxLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !isLoaded || !verificationCode}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 py-2.5 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : null}
        Verify Code
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setStep("request")}
        className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 flex items-center justify-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to reset request
      </button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 rounded-lg flex items-start mb-6">
        <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Code verified successfully</p>
          <p className="text-sm">Please set your new password</p>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          New password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a new password"
            className="block w-full pl-10 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-200 shadow-sm p-2.5"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Password must be at least 8 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isLoaded || password.length < 8}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 py-2.5 rounded-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
        ) : null}
        Reset Password
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a3a_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-800 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {step === "request" ? "Reset your password" :
                step === "verify" ? "Verify your identity" :
                  "Set new password"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {step === "request" ? "Enter your email to receive a recovery code" :
                step === "verify" ? "Enter the code we sent to your email" :
                  "Create a new secure password"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {successMessage && step === "reset" && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300 rounded-lg flex items-start">
              <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {step === "request" && renderRequestResetForm()}
          {step === "verify" && renderVerifyCodeForm()}
          {step === "reset" && renderResetPasswordForm()}

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/custom-auth/sign-in"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 