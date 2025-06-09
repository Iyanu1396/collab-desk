"use client";

import { signInWithOtp } from "./actions";
import { useState, useEffect } from "react";
import { Mail, Loader2, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const result = await signInWithOtp(email);

      if (result?.success) {
        setSentEmail(email);
        setResendTimer(60); // 60 second timer
        toast.success(`Magic link sent to ${email}! Check your inbox.`);
      } else if (result?.error) {
        console.error("Login error:", result.error);
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleResendLink = async () => {
    if (sentEmail && resendTimer === 0) {
      setIsPending(true);
      try {
        const result = await signInWithOtp(sentEmail);
        if (result?.success) {
          setResendTimer(60); // Reset timer
          toast.success("Magic link resent!");
        } else if (result?.error) {
          toast.error(result.error);
        }
      } catch {
        toast.error("Failed to resend link. Please try again.");
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleNewEmail = () => {
    setSentEmail(null);
    setEmail("");
    setResendTimer(0);
  };

  // Email Sent Screen
  if (sentEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                We&apos;ve sent a magic link to{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400 break-all">
                  {sentEmail}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleResendLink}
                disabled={isPending || resendTimer > 0}
                className="w-full group relative overflow-hidden bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : resendTimer > 0 ? (
                    <Clock className="h-4 w-4 mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180" />
                  )}
                  {isPending
                    ? "Sending..."
                    : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Magic Link"}
                </div>
              </button>

              <button
                onClick={handleNewEmail}
                className="w-full group relative overflow-hidden bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">Try Different Email</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Form Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Welcome to CollabDeck
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Sign in to start collaborating with your team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-4 pr-12 py-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-700/70"
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                    Send Magic Link
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We&apos;ll send you a secure link to sign in without a password.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/30 px-3 py-2 rounded-lg">
              <strong>New to CollabDeck?</strong> After signing in, you&apos;ll
              be prompted to set up your username and profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
