"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { loginSchema } from "@/lib/schemas/auth";

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validateFields = loginSchema.safeParse(rawData);

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Please check your inputs",
    };
  }

  const { email, password } = validateFields.data;
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { message: error.message };
    }
  } catch (err) {
    console.error("UNEXPECTED ERROR CAUGHT:", err);
  }

  redirect("/admin/dashboard");
}
