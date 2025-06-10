import { createClient } from "@/lib/supabase/client";

export async function signInWithOtp(email: string) {
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: "https://collab-desk-three.vercel.app/auth/callback" },
  });

  return error ? { error: error.message } : { success: true };
}
