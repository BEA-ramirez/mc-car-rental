"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { SignupForm } from "@/components/auth/signup-form";

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

export default function SignupPage() {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-2 bg-[#0A0C10] text-slate-300 selection:bg-blue-900 selection:text-white font-sans">
      {/* Left Side: Form Container */}
      <div className="relative flex flex-col h-full z-10 w-full">
        {/* Subtle Fluid Accent behind the form */}
        <motion.div
          variants={fluidMask}
          animate="animate"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] -z-10 pointer-events-none mix-blend-screen"
        />

        {/* Top Header Logo (Absolute) */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 w-full px-8 py-8 md:px-12 z-20 flex justify-between items-center"
        >
          <Link href="/" className="flex items-center gap-4 group">
            <PremiumLogo />
            <span className="text-[10px] font-medium text-white tracking-[0.3em] uppercase mt-0.5 group-hover:text-blue-400 transition-colors duration-500">
              MC Ormoc
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
          >
            Return to Login
          </Link>
        </motion.header>

        {/* Center: The Form (Flex-1 ensures it sits perfectly between header and footer without overlapping) */}
        <main className="flex-1 flex items-center justify-center w-full px-6 z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-lg"
          >
            <SignupForm />
          </motion.div>
        </main>

        {/* Bottom Footer (Absolute) */}
        <footer className="absolute bottom-0 left-0 w-full px-8 py-6 md:px-12 z-20 flex justify-between items-center">
          <div className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
            Secure Encrypted Registration
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

      {/* Right Side: Cinematic Detail Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative hidden lg:block bg-[#050608] overflow-hidden"
      >
        {/* Abstract/Macro Luxury Interior Shot */}
        <img
          src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury vehicle interior detail"
          className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity opacity-50 hover:opacity-70 transition-all duration-[3000ms] ease-out hover:scale-105 transform"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-transparent to-[#0A0C10]/50 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-[#0A0C10]/30 opacity-80" />

        {/* Editorial Overlay Text */}
        <div className="absolute bottom-24 left-16 max-w-md">
          <div className="w-12 h-[1px] bg-blue-500/50 mb-6" />
          <p className="text-3xl font-light text-white leading-tight tracking-tight mb-4">
            "The journey should be as remarkable as the destination itself."
          </p>
          <p className="text-[9px] font-medium text-blue-400 uppercase tracking-[0.4em]">
            The MC Ormoc Standard
          </p>
        </div>
      </motion.div>
    </div>
  );
}
