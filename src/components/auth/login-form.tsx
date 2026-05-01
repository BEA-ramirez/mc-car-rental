"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useTransition,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, LoginState } from "@/actions/login";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, User, Loader2 } from "lucide-react";

const initialState: LoginState = {
  success: false,
  errors: {},
  message: null,
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, initialState);

  // Track the toast ID so we can update/dismiss the loading state
  const toastId = useRef<string | number | null>(null);

  // This keeps the UI in a loading state while Next.js fetches the target page
  const [isNavigating, startTransition] = useTransition();

  // Track Google OAuth loading state separately
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 1. Show loading toast when the server action is running
  useEffect(() => {
    if (isPending) {
      toastId.current = toast.loading("Logging in...");
    }
  }, [isPending]);

  // 2. Handle success or error states for standard login
  useEffect(() => {
    if (!isPending) {
      if (state.success && state.redirectPath) {
        if (toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = null;
        }

        startTransition(() => {
          router.push(state.redirectPath!);
        });

        setTimeout(() => {
          toast.success("Welcome back!");
        }, 600);
      } else if (state.message && !state.success) {
        if (toastId.current) {
          toast.error(state.message, { id: toastId.current });
          toastId.current = null;
        } else {
          toast.error(state.message);
        }
      }
    }
  }, [state, isPending, router]);

  // --- GOOGLE OAUTH HANDLER ---
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();

    // 1. Get the base URL reliably
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");

    // 2. Construct the exact callback URL
    const callbackUrl = new URL("/auth/callback", baseUrl);
    callbackUrl.searchParams.set("next", "/customer/fleet");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(), // Passes the perfectly constructed URL
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setIsGoogleLoading(false);
      toast.error("Failed to connect to Google.");
    }
  };

  // Combined loading state to disable fields if ANY action is processing
  const isLoading = isPending || isNavigating || isGoogleLoading;

  return (
    <form
      action={formAction}
      className={cn("flex flex-col w-full", className)}
      {...props}
    >
      <FieldGroup className="border border-white/5 bg-[#0a1118]/80 backdrop-blur-sm md:backdrop-blur-2xl shadow-2xl p-4 sm:p-5 rounded-xl sm:rounded-2xl w-full relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-1 text-center mb-4">
          <div className="w-8 h-8 bg-[#64c5c3]/10 rounded-lg flex items-center justify-center mb-1">
            <User className="w-4 h-4 text-[#64c5c3]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase leading-none">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">
            Log in to your account
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          <Field className="space-y-1">
            <FieldLabel
              htmlFor="email"
              className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
            >
              Email
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className={cn(
                "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                state.errors?.email &&
                  "border-red-500/50 focus-visible:ring-red-500",
              )}
            />
            {state.errors?.email && (
              <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                {state.errors.email[0]}
              </p>
            )}
          </Field>

          <Field className="space-y-1">
            <div className="flex justify-between items-end mb-1">
              <FieldLabel
                htmlFor="password"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
              >
                Password
              </FieldLabel>
              <Link
                href="/auth/forgot"
                className="text-[8px] text-gray-500 hover:text-[#64c5c3] transition-colors font-bold uppercase tracking-widest"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={cn(
                "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                state.errors?.password &&
                  "border-red-500/50 focus-visible:ring-red-500",
              )}
            />
            {state.errors?.password && (
              <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                {state.errors.password[0]}
              </p>
            )}
          </Field>
        </div>

        <Field className="relative z-10 mt-4 space-y-2">
          {/* STANDARD LOGIN BUTTON */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)] group disabled:opacity-50 disabled:bg-[#64c5c3]"
          >
            {isPending || isNavigating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Log In{" "}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-1.5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
              Or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GOOGLE OAUTH BUTTON */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-10 bg-transparent border border-white/10 text-white hover:bg-white/5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {/* Google SVG Icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </span>
            )}
          </Button>
        </Field>

        <Field className="relative z-10 text-center mt-3">
          <FieldDescription className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#64c5c3] hover:text-white transition-colors font-black ml-1"
            >
              Sign Up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
