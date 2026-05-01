"use client";

import { useActionState, useState } from "react";
import { signup, SignupState } from "@/actions/signup";
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
import { createClient } from "@/utils/supabase/client";

const initialState: SignupState = {
  success: false,
  message: null,
  errors: {},
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- GOOGLE OAUTH HANDLER ---
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const supabase = createClient();

    // Get the current domain dynamically
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Automatically redirects them to the fleet page after successful login
        redirectTo: `${origin}/auth/callback?next=/customer/fleet`,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <form
      action={formAction}
      className={cn("flex flex-col w-full", className)}
      {...props}
    >
      <FieldGroup className="gap-2 border border-white/5 bg-[#0a1118]/80 backdrop-blur-2xl shadow-2xl p-5 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl w-full relative overflow-hidden">
        {/* Header Area */}
        <div className="relative z-10 flex flex-col items-center gap-1 text-center mb-4">
          <div className="w-8 h-8 bg-[#64c5c3]/10 rounded-lg flex items-center justify-center mb-0.5">
            <User className="w-4 h-4 text-[#64c5c3]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase leading-none">
            Create Account
          </h1>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
            Enter your details below
          </p>
        </div>

        {state.message && (
          <div className="relative z-10 p-2 mb-3 text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm text-center">
            {state.message}
          </div>
        )}

        {/* Inputs Area */}
        <div className="relative z-10 space-y-2.5 sm:space-y-3">
          {/* Row 1: Name and Email side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Field className="space-y-1">
              <FieldLabel
                htmlFor="name"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
              >
                Full Name
              </FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className={cn(
                  "h-9 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                  state.errors?.name &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.name && (
                <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                  {state.errors.name[0]}
                </p>
              )}
            </Field>

            <Field className="space-y-1">
              <FieldLabel
                htmlFor="email"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
              >
                Email Address
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className={cn(
                  "h-9 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                  state.errors?.email &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.email && (
                <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                  {state.errors.email[0]}
                </p>
              )}
            </Field>
          </div>

          {/* Row 2: Passwords side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Field className="space-y-1">
              <FieldLabel
                htmlFor="password"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
              >
                Password
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className={cn(
                  "h-9 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                  state.errors?.password &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.password ? (
                <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                  {state.errors.password[0]}
                </p>
              ) : (
                <FieldDescription className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  At least 8 characters.
                </FieldDescription>
              )}
            </Field>

            <Field className="space-y-1">
              <FieldLabel
                htmlFor="confirm-password"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500"
              >
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                className={cn(
                  "h-9 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                  state.errors?.confirmPassword &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.confirmPassword && (
                <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </Field>
          </div>
        </div>

        {/* Submit Button */}
        <Field className="relative z-10 mt-4">
          <Button
            type="submit"
            disabled={isPending || isGoogleLoading}
            className="w-full h-9 bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.15)] group disabled:opacity-50 disabled:bg-[#64c5c3]"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account{" "}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </Field>

        {/* --- OR DIVIDER --- */}
        <div className="relative z-10 flex items-center py-2.5">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-3 text-[8px] font-bold uppercase tracking-widest text-gray-500">
            Or continue with
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* --- GOOGLE BUTTON --- */}
        <div className="relative z-10">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={isPending || isGoogleLoading}
            className="w-full h-9 bg-white text-black hover:bg-gray-100 hover:text-black border-transparent rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
            ) : (
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24">
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
            )}
            Google
          </Button>
        </div>

        {/* Bottom Link Inside Card */}
        <Field className="relative z-10 text-center mt-3">
          <FieldDescription className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#64c5c3] hover:text-white transition-colors font-black ml-1"
            >
              Log In
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
