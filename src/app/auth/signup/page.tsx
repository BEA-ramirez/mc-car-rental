"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { SignupForm } from "@/components/auth/signup-form";
import Image from "next/image";

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

export default function SignupPage() {
  return (
    // Grid handles side-by-side layout on desktop, standard flow on mobile
    <div className="grid min-h-[100dvh] lg:h-screen lg:grid-cols-2 bg-[#050B10] text-white selection:bg-[#64c5c3] selection:text-black font-sans overflow-hidden">
      {/* --- LEFT SIDE: FORM CONTAINER --- */}
      <div className="relative flex flex-col w-full min-h-[100dvh] lg:h-full z-20 overflow-y-auto lg:overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Elegant Ambient Glow behind the form */}
        <motion.div
          variants={spotlightAnim}
          animate="animate"
          className="fixed top-1/2 left-1/2 md:left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] md:w-[600px] md:h-[900px] bg-gradient-to-br from-[#64c5c3]/10 via-blue-900/10 to-transparent blur-[120px] -z-10 pointer-events-none rounded-full mix-blend-screen"
        />

        {/* Top Header - Tightened padding to prevent vertical scroll */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-center w-full px-6 py-4 md:px-12 md:py-6 shrink-0 z-20"
        >
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
              MC ORMOC
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#64c5c3] transition-colors"
          >
            Log In
          </Link>
        </motion.header>

        {/* Center: The Form - Flex-1 ensures perfect vertical centering */}
        <main className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 z-10 py-6 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-[24rem] sm:max-w-md lg:max-w-lg"
          >
            <SignupForm />
          </motion.div>
        </main>

        {/* Bottom Footer - Tightened padding */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full px-6 py-4 md:px-12 shrink-0 z-20">
          <div className="text-[9px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center sm:text-left">
            Secure Encrypted Registration
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

      {/* --- RIGHT SIDE: ANIMATED SHOWCASE (Hidden on Mobile) --- */}
      <div className="relative hidden lg:flex flex-col items-center justify-center h-full bg-[#050B10] p-12 z-10 overflow-hidden">
        {/* Dynamic Background Glows for the Right Pane */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* The "Running" Car Animation */}
        <motion.div
          initial={{ x: "100vw", opacity: 0, skewX: -10 }}
          animate={{ x: 0, opacity: 1, skewX: 0 }}
          transition={{
            type: "spring",
            stiffness: 45,
            damping: 14,
            mass: 1.2,
            delay: 0.3, // Slightly delayed so it slides in after the form loads
          }}
          className="relative w-full max-w-lg mb-12"
        >
          {/* Wrapper to handle the floating spec tag positioning */}
          <div className="relative w-[110%] -right-[5%]">
            {/* Fading speed lines effect behind the car */}
            <motion.div
              initial={{ opacity: 1, scaleX: 1, x: 0 }}
              animate={{ opacity: 0, scaleX: 0, x: -100 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#64c5c3]/50 to-transparent -z-10 origin-left"
            />
            <motion.div
              initial={{ opacity: 1, scaleX: 1, x: 0 }}
              animate={{ opacity: 0, scaleX: 0, x: -100 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="absolute top-[60%] left-10 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent -z-10 origin-left"
            />

            {/* The Car Image */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black">
              <Image
                src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=1000"
                alt="Mazda 3 Hatchback"
                className="w-full h-[300px] object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Glassmorphic spec tag attached to the car */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 left-8 bg-[#0a1118]/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex gap-6 shadow-2xl"
            >
              <div>
                <p className="text-[9px] text-[#64c5c3] font-bold uppercase tracking-widest mb-1">
                  Top Tier
                </p>
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  Verified Fleet
                </p>
              </div>
              <div className="w-[1px] h-8 bg-white/10 self-center" />
              <div className="flex items-center gap-2 self-center">
                <div className="w-2 h-2 rounded-full bg-[#64c5c3] animate-pulse shadow-[0_0_8px_rgba(100,197,195,0.8)]" />
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Ready
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Editorial Overlay Text / Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-lg mt-8 pl-4"
        >
          <div className="w-12 h-[3px] bg-[#64c5c3] mb-6" />
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-4">
            Shift Into Gear. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
              Just Drive.
            </span>
          </h2>
          <p className="text-[11px] font-bold text-[#64c5c3] uppercase tracking-widest mt-6">
            The MC Ormoc Standard
          </p>
        </motion.div>
      </div>
    </div>
  );
}
