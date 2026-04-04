"use client";

import { use } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { MailCheck } from "lucide-react";
import { ResendButton } from "@/components/auth/resend-button";

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

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; email?: string }>;
}) {
  // Properly unwrap the promise in a Client Component
  const params = use(searchParams);
  const email = params.email || "your provided address";

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
        className="w-full max-w-md relative z-10 py-8 sm:py-12 flex flex-col items-center"
      >
        {/* The Premium Glass Card */}
        <div className="border border-white/5 bg-[#0a1118]/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 rounded-2xl sm:rounded-3xl w-full text-center relative overflow-hidden">
          {/* Header Area */}
          <div className="relative z-10 flex flex-col items-center gap-2 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#64c5c3]/10 rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
              <MailCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#64c5c3]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Check Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                Inbox.
              </span>
            </h1>

            <p className="text-[#64c5c3] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-2">
              Authentication Required
            </p>
          </div>

          {/* Body Text */}
          <p className="text-gray-400 font-bold text-[10px] sm:text-xs leading-relaxed mb-8 sm:mb-10 max-w-[280px] sm:max-w-sm mx-auto">
            To secure your credentials, a verification link has been dispatched
            to{" "}
            <span className="text-white bg-white/5 px-2 py-0.5 rounded-md inline-block mt-1">
              {email}
            </span>
            <br className="hidden sm:block" />
            <span className="mt-2 block">
              Please follow the enclosed instructions to activate your access.
            </span>
          </p>

          {/* Action Area */}
          <div className="space-y-6 relative z-10">
            {/* Note: Ensure your ResendButton matches the new teal/dark aesthetic internally! */}
            <ResendButton email={email} />

            <div className="pt-6 border-t border-white/10">
              <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
                Didn't receive the email? Check your spam folder or{" "}
                <Link
                  href="/support"
                  className="text-[#64c5c3] hover:text-white transition-colors font-black ml-1"
                >
                  Contact Support
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Return to home link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/"
            className="text-[9px] sm:text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
