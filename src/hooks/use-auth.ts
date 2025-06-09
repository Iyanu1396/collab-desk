"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import toast from "react-hot-toast";

interface Profile {
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const checkProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking profile:", error);
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setNeedsProfile(false);
      } else {
        setProfile(null);
        setNeedsProfile(true);
      }
    } catch (error) {
      console.error("Error in checkProfile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Check profile if user exists
        if (session?.user) {
          await checkProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error in getSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_OUT" || !session) {
        setProfile(null);
        setNeedsProfile(false);
        router.push("/login");
      } else if (session?.user) {
        await checkProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        toast.error("Error signing out. Please try again.");
        return false;
      }

      toast.success("Signed out successfully");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("Error in signOut:", error);
      toast.error("Error signing out. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkSession = () => {
    if (!session && !loading) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const refreshProfile = async () => {
    if (user) {
      await checkProfile(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    profileLoading,
    needsProfile,
    signOut,
    checkSession,
    refreshProfile,
    isAuthenticated: !!session,
  };
}
