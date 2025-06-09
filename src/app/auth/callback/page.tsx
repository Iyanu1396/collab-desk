"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push(
            "/login/failed?error=AuthFailed&error_description=" +
              encodeURIComponent(error.message)
          );
          return;
        }

        if (session) {
          router.push("/dashboard");
        } else {
          router.push(
            "/login/failed?error=NoSession&error_description=No session found after authentication"
          );
        }
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        router.push(
          "/login/failed?error=UnexpectedError&error_description=An unexpected error occurred"
        );
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-300">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
}
