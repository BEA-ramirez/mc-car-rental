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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const initialState: LoginState = {
  success: false,
  errors: {},
  message: null,
};

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-7 h-7 flex items-center justify-center group cursor-pointer mx-auto mb-2">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[9px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

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
      {/* Reduced internal padding to p-6 to keep it compact vertically */}
      <FieldGroup className="border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl p-6 rounded-2xl w-full relative overflow-hidden">
        {/* Subtle inner top glow for the glass effect */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Tighter margins (mb-4 instead of mb-6) */}
        <div className="relative z-10 flex flex-col gap-1 text-center mb-4">
          <PremiumLogo />
          <h1 className="text-2xl font-light text-white tracking-tight">
            Client{" "}
            <span className="italic font-normal text-white/50">Access.</span>
          </h1>
          <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.2em] mt-0.5">
            Authenticate to continue
          </p>
        </div>

        {state.message && (
          <div className="relative z-10 p-2 mb-3 text-[10px] font-medium uppercase tracking-wider text-red-400 bg-red-950/20 border border-red-900/50 rounded-sm backdrop-blur-sm text-center">
            {state.message}
          </div>
        )}

        {/* Tighter spacing between fields (space-y-3 instead of space-y-4) */}
        <div className="relative z-10 space-y-3">
          <Field className="space-y-1">
            <FieldLabel
              htmlFor="email"
              className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
            >
              Email Address
            </FieldLabel>
            {/* Reduced height (h-10 instead of h-11) */}
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@example.com"
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

          <Field className="space-y-1">
            <div className="flex justify-between items-end mb-1">
              <FieldLabel
                htmlFor="password"
                className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500"
              >
                Secure Password
              </FieldLabel>
              <a
                href="#"
                className="text-[8px] text-white/30 hover:text-white transition-colors uppercase tracking-widest"
              >
                Reset Password
              </a>
            </div>
            {/* Reduced height (h-10 instead of h-11) */}
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
            {state.errors?.password && (
              <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                {state.errors.password[0]}
              </p>
            )}
          </Field>
        </div>

        {/* Tighter margin-top (mt-4 instead of mt-6) */}
        <Field className="relative z-10 mt-4">
          {/* Reduced height (h-10 instead of h-12) */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[9px] uppercase tracking-[0.3em] transition-all duration-500 group"
          >
            {isPending ? (
              "Authenticating..."
            ) : (
              <span className="flex items-center gap-3">
                Authenticate{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </Field>

        <Field className="relative z-10 text-center">
          <FieldDescription className="text-[9px] text-white/40 font-light">
            Require credentials?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-white font-medium transition-colors ml-1 uppercase tracking-widest"
            >
              Register Here
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
