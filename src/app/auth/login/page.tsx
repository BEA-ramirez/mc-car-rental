"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-6 h-6 flex items-center justify-center group cursor-pointer">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[8px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

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

export default function LoginPage() {
  return (
    <div className="relative h-screen flex flex-col justify-between bg-[#050608] text-slate-300 selection:bg-blue-900 selection:text-white font-sans overflow-hidden">
      {/* Background Fluid Accent */}
      <motion.div
        variants={fluidMask}
        animate="animate"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] -z-10 pointer-events-none mix-blend-screen"
      />

      {/* Top Header - Tightened padding (py-4) */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full px-8 py-4 md:px-12 flex justify-between items-center"
      >
        <Link href="/" className="flex items-center gap-4 group">
          <PremiumLogo />
          <span className="text-[10px] font-medium text-white tracking-[0.3em] uppercase mt-0.5 group-hover:text-blue-400 transition-colors duration-500">
            MC Ormoc
          </span>
        </Link>
        <Link
          href="/auth/signup"
          className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
        >
          Create Account
        </Link>
      </motion.header>

      {/* Center: The Form */}
      <main className="flex-1 flex items-center justify-center w-full px-6 z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-md"
        >
          <LoginForm />
        </motion.div>
      </main>

      {/* Bottom Footer - Tightened padding (py-4) */}
      <footer className="relative z-20 w-full px-8 py-4 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
          Secure Authentication Portal
        </div>
        <div className="flex gap-6 text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
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
