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
  redirectPath?: string; // 👇 Added this property
};

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

  let redirectPath = "/customer/fleet";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    const role = data.user?.user_metadata?.role;

    switch (role) {
      case "admin":
        redirectPath = "/admin/dashboard";
        break;
      case "customer":
        redirectPath = "/customer/fleet";
        break;
      case "driver":
        redirectPath = "/driver/home";
        break;
      case "car_owner":
        redirectPath = "/fleet-partner/home";
        break;
    }
  } catch (err) {
    console.error("UNEXPECTED ERROR CAUGHT:", err);
    return { success: false, message: "An unexpected error occurred." };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    redirectPath,
    message: "Login successful!",
  };
}

export async function logout() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Failed to log out:", error);
  }
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
