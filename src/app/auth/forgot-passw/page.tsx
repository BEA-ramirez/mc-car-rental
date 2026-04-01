"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

// --- ANIMATION VARIANTS ---
const fluidMask: Variants = {
  animate: {
    borderRadius: [
      "60% 40% 30% 70% / 60% 30% 70% 40%",
      "30% 70% 70% 30% / 30% 30% 70% 70%",
      "60% 40% 30% 70% / 60% 30% 70% 40%",
    ],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center group cursor-pointer mx-auto mb-6">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[10px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

// Notice: We removed the `...props` to prevent the searchParams error
export default function ForgotPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#0A0C10] text-slate-300 selection:bg-blue-900 selection:text-white font-sans overflow-hidden px-6">
      {/* Background Fluid Accent */}
      <motion.div
        variants={fluidMask}
        animate="animate"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 pointer-events-none mix-blend-screen"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <form className="flex flex-col w-full">
          <FieldGroup className="border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl p-8 md:p-10 rounded-2xl w-full relative overflow-hidden">
            {/* Subtle inner top glow for the glass effect */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-1 text-center mb-8">
              <PremiumLogo />
              <h1 className="text-3xl font-light text-white tracking-tight">
                Password{" "}
                <span className="italic font-normal text-white/50">
                  Recovery.
                </span>
              </h1>
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mt-1">
                Regain access to your account
              </p>
            </div>

            <div className="relative z-10 space-y-4">
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
                  placeholder="client@example.com"
                  required
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-300"
                />
              </Field>
            </div>

            <Field className="relative z-10 mt-6">
              <Button
                type="submit"
                className="w-full h-10 bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[9px] uppercase tracking-[0.3em] transition-all duration-500 group"
              >
                <span className="flex items-center gap-3">
                  Send Recovery Link{" "}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Field>

            <Field className="relative z-10 text-center">
              <FieldDescription className="text-[10px] text-white/40 font-light">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-white font-medium transition-colors ml-1 uppercase tracking-widest"
                >
                  Return to Login
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-[9px] text-white/30 uppercase tracking-[0.15em] font-light leading-relaxed">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="text-blue-400 hover:text-white transition-colors font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-400 hover:text-white transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
