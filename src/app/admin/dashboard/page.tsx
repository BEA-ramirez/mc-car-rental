import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardMain from "@/components/dashboard/dashboard-main";

export default async function Dashboard() {
  const supabase = await createClient();

  // 1. Check the secure cookie
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Kick them back to login if no active session
    redirect("/auth/login");
  }

  // 2. Fetch their actual profile from your users table (Optional but highly recommended)
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("user_id", user.id)
    .single();

  // 3. Render the Client UI shell
  // Note: Background color is now handled by the parent AdminLayout,
  // so we just pass the w-full h-full shell.
  return (
    <main className="w-full h-full">
      {/* You can pass the profile data if you want to say "Welcome back, [Name]" */}
      <DashboardMain />
    </main>
  );
}
