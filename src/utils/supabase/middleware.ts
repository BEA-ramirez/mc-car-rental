import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create the client and set up cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  //Calling getUser() refreshes the session token if it is expired.
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // // If no user exists and they try to go to /admin, kick them to /login
  // if (!user && request.nextUrl.pathname.startsWith("/admin")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/auth/login";
  //   return NextResponse.redirect(url);
  // }

  // // If they are logged in, don't let them sit on the login page. Send them to the dashboard.
  // if (user && request.nextUrl.pathname.startsWith("/auth/login")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/admin/dashboard";
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
