"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { loginSchema } from "@/lib/schemas/auth";
import { revalidatePath } from "next/cache";

export type LoginState = {
  success: boolean;
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

// needs the prevstate prop because of useFormState
export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validateFields = loginSchema.safeParse(rawData);

  if (!validateFields.success) {
    return {
      success: false,
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
      return { success: false, message: error.message };
    }
  } catch (err) {
    console.error("UNEXPECTED ERROR CAUGHT:", err);
    return { success: false, message: "An unexpected error occurred." };
  }

  revalidatePath("/", "layout"); // forces nextjs to cache
  redirect("/admin/dashboard");
}

export async function logout() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Failed to log out:", error);
  }
  revalidatePath("/", "layout"); // forces nextjs to cache
  redirect("/login");
}
