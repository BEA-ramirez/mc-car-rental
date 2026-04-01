"use client";

import { useActionState } from "react";
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
import { ArrowRight } from "lucide-react";

const initialState: SignupState = {
  message: null,
  errors: {},
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <form
      action={formAction}
      className={cn("flex flex-col w-full", className)}
      {...props}
    >
      {/* Reduced padding (p-6 md:p-8) to save vertical space */}
      <FieldGroup className="border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl p-6 md:p-8 rounded-2xl w-full">
        {/* Tighter margins (mb-6) and simplified clear text */}
        <div className="flex flex-col gap-1 text-left mb-6">
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
            Create{" "}
            <span className="italic font-normal text-white/50">Account.</span>
          </h1>
          <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.2em] mt-1">
            Enter your details below
          </p>
        </div>

        {state.message && (
          <div className="p-2 mb-4 text-[9px] font-medium uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-900/50 rounded-sm backdrop-blur-sm text-center">
            {state.message}
          </div>
        )}

        {/* Tighter spacing between input rows (space-y-4 instead of 5) */}
        <div className="space-y-4">
          {/* Row 1: Name and Email side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="space-y-1.5">
              <FieldLabel
                htmlFor="name"
                className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
              >
                Full Name
              </FieldLabel>
              {/* Shorter inputs (h-10 instead of h-11) */}
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                required
                className={cn(
                  "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-300",
                  state.errors?.name &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.name && (
                <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                  {state.errors.name[0]}
                </p>
              )}
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel
                htmlFor="email"
                className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
              >
                Email Address
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className={cn(
                  "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-300",
                  state.errors?.email &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.email && (
                <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                  {state.errors.email[0]}
                </p>
              )}
            </Field>
          </div>

          {/* Row 2: Passwords side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field className="space-y-1.5">
              <FieldLabel
                htmlFor="password"
                className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
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
                  "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-300",
                  state.errors?.password &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.password ? (
                <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                  {state.errors.password[0]}
                </p>
              ) : (
                <FieldDescription className="text-[9px] text-white/30 font-light mt-1">
                  At least 8 characters.
                </FieldDescription>
              )}
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel
                htmlFor="confirm-password"
                className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
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
                  "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-300",
                  state.errors?.confirmPassword &&
                    "border-red-500/50 focus-visible:ring-red-500",
                )}
              />
              {state.errors?.confirmPassword && (
                <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </Field>
          </div>
        </div>

        {/* Tighter top margin for the button (mt-6) and shorter button height (h-10) */}
        <Field className="mt-6">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 group"
          >
            {isPending ? (
              "Creating..."
            ) : (
              <span className="flex items-center gap-3">
                Create Account{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </Field>

        {/* Tighter bottom text section */}
        <div className="mt-6 text-center">
          <FieldDescription className="text-[10px] text-white/40 font-light">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-white transition-colors font-medium ml-1 uppercase tracking-widest"
            >
              Log In
            </Link>
          </FieldDescription>
        </div>
      </FieldGroup>
    </form>
  );
}
