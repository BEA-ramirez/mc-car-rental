"use server";

import { createClient } from "@/utils/supabase/server";

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Confirmation email resent successfully." };
}
