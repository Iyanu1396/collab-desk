import { createClient } from "@/lib/supabase/client";

export async function signInWithOtp(email: string) {
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: "http://localhost:3000/auth/callback" },
  });

  return error ? { error: error.message } : { success: true };
}
