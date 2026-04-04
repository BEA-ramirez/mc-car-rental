"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";

// --- ANIMATION VARIANTS ---
// Elegant, slow-rotating gradient spotlight to match the Signup page
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

export default function LoginPage() {
  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-[#050B10] text-white selection:bg-[#64c5c3] selection:text-black font-sans overflow-hidden">
      {/* Background Ambient Spotlight */}
      <motion.div
        variants={spotlightAnim}
        animate="animate"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] md:w-[600px] md:h-[900px] bg-gradient-to-br from-[#64c5c3]/10 via-blue-900/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full mix-blend-screen"
      />

      {/* Top Header (Static flow, shrinks on mobile) */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-between items-center w-full px-6 py-6 md:px-12 md:py-8 shrink-0 z-20"
      >
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
            MC ORMOC
          </span>
        </Link>
        <Link
          href="/auth/signup"
          className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#64c5c3] transition-colors"
        >
          Create Account
        </Link>
      </motion.header>

      {/* Center: The Form (Expands to push footer down, handles scrolling) */}
      <main className="flex-1 flex items-center justify-center w-full px-4 sm:px-6 py-8 z-10 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-[22rem] sm:max-w-md"
        >
          <LoginForm />
        </motion.div>
      </main>

      {/* Bottom Footer (Pushed to bottom naturally, stacks on tiny screens) */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full px-6 py-6 md:px-12 shrink-0 z-20">
        <div className="text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center sm:text-left">
          Secure Authentication Portal
        </div>
        <div className="flex gap-4 md:gap-6 text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <Link href="#" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
