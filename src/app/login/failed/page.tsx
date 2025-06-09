"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoginFailedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const description = searchParams.get("error_description");

  useEffect(() => {
    // Log the error for debugging
    console.error("Login failed:", {
      error,
      description,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, [error, description]);

  const getErrorMessage = () => {
    switch (error) {
      case "access_denied":
        return "Access was denied. This could be due to an expired or invalid link.";
      case "server_error":
        return "A server error occurred. Please try again later.";
      case "temporarily_unavailable":
        return "The service is temporarily unavailable. Please try again in a few moments.";
      case "invalid_request":
        return "The login request was invalid. Please try signing in again.";
      default:
        return description || "An unexpected error occurred during sign-in.";
    }
  };

  const getErrorTitle = () => {
    switch (error) {
      case "access_denied":
        return "Access Denied";
      case "server_error":
        return "Server Error";
      case "temporarily_unavailable":
        return "Service Unavailable";
      case "invalid_request":
        return "Invalid Request";
      default:
        return "Sign-in Failed";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {getErrorTitle()}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {getErrorMessage()}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="text-xs text-red-600 dark:text-red-400">
                <strong>Error Code:</strong> {error}
              </div>
              {description && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  <strong>Details:</strong> {description}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Link href="/login">
              <button className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Signing In Again
              </button>
            </Link>

            <Link href="/">
              <button className="w-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                Go Back to Home
              </button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If this problem persists, please contact support with the error
              code above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginFailedContent />
    </Suspense>
  );
}
