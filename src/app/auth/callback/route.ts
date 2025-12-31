import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success!
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      // LOG THE ERROR HERE
      console.error("🔴 Auth Code Exchange Error:", error.message);
    }
  }

  // Instead of a 404 page, let's send them to login with an error message
  return NextResponse.redirect(
    `${origin}/auth/login?message=Could not verify email code`
  );
}
