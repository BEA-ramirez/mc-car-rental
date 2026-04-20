import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. KICK UNAUTHENTICATED USERS: If no user, send to login
  if (
    !user &&
    (path.startsWith("/admin") ||
      path.startsWith("/customer") ||
      path.startsWith("/driver") ||
      path.startsWith("/fleet-partner"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If a user exists, we need to enforce Role Boundaries
  if (user) {
    // Safety net: default to 'customer' if metadata is missing
    const role = user.user_metadata?.role || "customer";

    // 2. PREVENT UNAUTHORIZED ACCESS (The Bouncer)
    // If a non-admin tries to access /admin
    if (path.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/customer/fleet";
      return NextResponse.redirect(url);
    }

    // If a non-driver tries to access /driver
    if (path.startsWith("/driver") && role !== "driver") {
      const url = request.nextUrl.clone();
      url.pathname = "/customer/fleet";
      return NextResponse.redirect(url);
    }

    // If a non-owner tries to access /fleet-partner
    if (path.startsWith("/fleet-partner") && role !== "car_owner") {
      const url = request.nextUrl.clone();
      url.pathname = "/customer/fleet";
      return NextResponse.redirect(url);
    }

    // 3. KEEP THEM OFF AUTH PAGES: If logged in and trying to view login/signup
    if (path.startsWith("/auth/login") || path.startsWith("/auth/signup")) {
      const url = request.nextUrl.clone();

      if (role === "admin") {
        url.pathname = "/admin/dashboard";
      } else if (role === "driver") {
        url.pathname = "/driver/home";
      } else if (role === "car_owner") {
        url.pathname = "/fleet-partner/home";
      } else {
        url.pathname = "/customer/fleet";
      }

      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
