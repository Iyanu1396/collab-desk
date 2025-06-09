"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Profile {
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface SessionData {
  session: Session | null;
}

const supabase = createClient();

export function useAuthQuery() {
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for session data
  const {
    data: sessionData,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery<SessionData>({
    queryKey: ["auth", "session"],
    queryFn: async (): Promise<SessionData> => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });

  // Query for profile data
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<Profile | null>({
    queryKey: ["auth", "profile", sessionData?.session?.user?.id || ""],
    queryFn: async (): Promise<Profile | null> => {
      if (!sessionData?.session?.user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as Profile | null;
    },
    enabled: !!sessionData?.session?.user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Set up auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update session data in cache
      queryClient.setQueryData(["auth", "session"], { session });

      if (event === "SIGNED_OUT" || !session) {
        queryClient.setQueryData(["auth", "profile", ""], null);
        router.push("/login");
      } else if (session?.user) {
        // Refetch profile for new user
        queryClient.invalidateQueries({
          queryKey: ["auth", "profile", session.user.id],
        });
      }
    });

    // Set initializing to false after setting up listener
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [queryClient, router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Error signing out. Please try again.");
        return false;
      }

      // Clear all auth-related queries
      queryClient.removeQueries({
        queryKey: ["auth"],
      });
      toast.success("Signed out successfully");
      router.push("/login");
      return true;
    } catch {
      toast.error("Error signing out. Please try again.");
      return false;
    }
  };

  const checkSession = () => {
    if (!sessionData?.session && !sessionLoading && !initializing) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const refreshProfile = async () => {
    if (sessionData?.session?.user?.id) {
      queryClient.invalidateQueries({
        queryKey: ["auth", "profile", sessionData.session.user.id],
      });
    }
  };

  return {
    user: sessionData?.session?.user ?? null,
    session: sessionData?.session ?? null,
    profile: profile ?? null,
    loading: sessionLoading || initializing,
    profileLoading,
    needsProfile: sessionData?.session?.user && !profile && !profileLoading,
    signOut,
    checkSession,
    refreshProfile,
    isAuthenticated: !!sessionData?.session,
    error: sessionError || profileError,
  };
}
