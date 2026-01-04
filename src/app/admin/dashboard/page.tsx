import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

async function Dashboard() {
  const supabase = await createClient();
  // checks the cookie
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // kick them back to login
    redirect("/auth/login");
  }
  return (
    <div>
      <div>Dashboard</div>
    </div>
  );
}

export default Dashboard;
