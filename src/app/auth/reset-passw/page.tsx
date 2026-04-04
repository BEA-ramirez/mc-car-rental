"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// --- ANIMATION VARIANTS ---
const spotlightAnim: Variants = {
  animate: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: {
      duration: 25,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export default function ResetPassPage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-center items-center bg-[#050B10] text-white selection:bg-[#64c5c3] selection:text-black font-sans overflow-hidden px-4 sm:px-6">
      {/* Background Ambient Spotlight */}
      <motion.div
        variants={spotlightAnim}
        animate="animate"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] md:w-[600px] md:h-[900px] bg-gradient-to-br from-[#64c5c3]/10 via-blue-900/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full mix-blend-screen"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 py-8 sm:py-12"
      >
        <form className="flex flex-col w-full">
          <FieldGroup className="border border-white/5 bg-[#0a1118]/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 rounded-2xl sm:rounded-3xl w-full relative overflow-hidden">
            {/* Header Area */}
            <div className="relative z-10 flex flex-col items-center gap-2 text-center mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#64c5c3]/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#64c5c3]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                Reset <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                  Password.
                </span>
              </h1>
              <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-2">
                Enter your new secure password
              </p>
            </div>

            {/* Inputs Area */}
            <div className="relative z-10 space-y-4 sm:space-y-5">
              <Field className="space-y-2">
                <FieldLabel
                  htmlFor="password"
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500"
                >
                  New Password
                </FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-12 sm:h-14 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all"
                />
                <FieldDescription className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field className="space-y-2">
                <FieldLabel
                  htmlFor="confirm-password"
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2"
                >
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-12 sm:h-14 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all"
                />
              </Field>
            </div>

            {/* Submit Button */}
            <Field className="relative z-10 mt-6 sm:mt-8">
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)] group"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  Confirm Reset{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Field>
          </FieldGroup>
        </form>

        {/* Footer Text */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
            Remembered your password?{" "}
            <Link
              href="/auth/login"
              className="text-[#64c5c3] hover:text-white transition-colors font-black ml-1"
            >
              Return to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
