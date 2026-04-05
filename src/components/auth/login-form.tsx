"use client";

import { useActionState } from "react";
import { login, LoginState } from "@/actions/login";
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
import { ArrowRight, User } from "lucide-react";

const initialState: LoginState = {
  success: false,
  errors: {},
  message: null,
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className={cn("flex flex-col w-full", className)}
      {...props}
    >
      {/* Tightened padding to p-5 sm:p-6 for maximum compactness */}
      <FieldGroup className="border border-white/5 bg-[#0a1118]/80 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl w-full relative overflow-hidden">
        {/* Header Area */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 text-center mb-5">
          <div className="w-10 h-10 bg-[#64c5c3]/10 rounded-xl flex items-center justify-center mb-1">
            <User className="w-5 h-5 text-[#64c5c3]" />
          </div>
          {/* Friendly, single-line title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1">
            Log in to your account
          </p>
        </div>

        {state.message && (
          <div className="relative z-10 p-2.5 mb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm text-center">
            {state.message}
          </div>
        )}

        {/* Inputs Area (Tighter spacing) */}
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <Field className="space-y-1.5">
            <FieldLabel
              htmlFor="email"
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500"
            >
              Email
            </FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className={cn(
                "h-11 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all",
                state.errors?.email &&
                  "border-red-500/50 focus-visible:ring-red-500",
              )}
            />
            {state.errors?.email && (
              <p className="text-[8px] sm:text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                {state.errors.email[0]}
              </p>
            )}
          </Field>

          <Field className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
              <FieldLabel
                htmlFor="password"
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500"
              >
                Password
              </FieldLabel>
              <Link
                href="/auth/forgot"
                className="text-[8px] sm:text-[9px] text-gray-500 hover:text-[#64c5c3] transition-colors font-bold uppercase tracking-widest"
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
              className={cn(
                "h-11 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all",
                state.errors?.password &&
                  "border-red-500/50 focus-visible:ring-red-500",
              )}
            />
            {state.errors?.password && (
              <p className="text-[8px] sm:text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                {state.errors.password[0]}
              </p>
            )}
          </Field>
        </div>

        {/* Submit Button */}
        <Field className="relative z-10 mt-5">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 sm:h-12 bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)] group disabled:opacity-50 disabled:bg-[#64c5c3]"
          >
            {isPending ? (
              "Logging in..."
            ) : (
              <span className="flex items-center gap-2 sm:gap-3">
                Log In{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </Field>

        {/* Bottom Link Inside Card */}
        <Field className="relative z-10 text-center mt-4">
          <FieldDescription className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            Don't have an account?{" "}
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
