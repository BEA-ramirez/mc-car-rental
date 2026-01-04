"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signupSchema } from "@/lib/schemas/auth";

export type SignupState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  // 1. Log that the function started
  console.log("--- Signup Action Started ---");

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirm-password"),
  };

  const validateFields = signupSchema.safeParse(rawData);

  if (!validateFields.success) {
    console.log("Validation Failed");
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Missing fields, failed to create account.",
    };
  }

  const { email, password, name } = validateFields.data;
  const supabase = await createClient();

  try {
    console.log("Attempting Supabase SignUp...");

    const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${origin}/auth/callback?next=/auth/login`,
      },
    });

    if (error) {
      console.error("Supabase Error:", error.message);
      return { message: error.message };
    }

    console.log("Supabase SignUp Successful");
  } catch (err) {
    // If we catch an error, we log it to see what it really is
    console.error("UNEXPECTED ERROR CAUGHT:", err);
    return {
      message:
        "Database error: " + (err instanceof Error ? err.message : String(err)),
    };
  }

  // 3. Redirect is OUTSIDE the try/catch
  console.log("Redirecting...");
  redirect(
    `/auth/confirm?email=${encodeURIComponent(
      email
    )}&message=Account created successfully.`
  );
}
