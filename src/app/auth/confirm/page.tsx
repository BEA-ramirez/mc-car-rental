import { ResendButton } from "@/components/auth/resend-button";
import Link from "next/link";
import { MailCheck } from "lucide-react";

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center mx-auto mb-6">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45" />
    <span className="relative z-10 text-[10px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || "your provided address";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0C10] text-slate-300 selection:bg-blue-900 selection:text-white font-sans relative overflow-hidden px-6">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 pointer-events-none mix-blend-screen" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* The Premium Frosted Glass Card */}
        <div className="border border-white/5 bg-white/[0.02] backdrop-blur-2xl shadow-2xl p-10 md:p-12 rounded-2xl w-full text-center relative overflow-hidden">
          {/* Subtle inner top glow */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <PremiumLogo />

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MailCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Authentication{" "}
            <span className="italic font-normal text-white/50">Required.</span>
          </h1>

          <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.2em] mb-8">
            Check Your Inbox
          </p>

          <p className="text-slate-400 font-light leading-relaxed text-sm mb-10">
            To secure your credentials, a verification link has been dispatched
            to{" "}
            <span className="font-medium text-white tracking-wide">
              {email}
            </span>
            . Please follow the enclosed instructions to activate your access.
          </p>

          {/* Action Area */}
          <div className="space-y-6">
            <ResendButton email={email} />

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-light leading-relaxed">
                Didn't receive the email? Check your spam folder or{" "}
                <Link
                  href="/support"
                  className="text-blue-400 hover:text-white transition-colors font-medium ml-1"
                >
                  contact support
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Return to home link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[10px] font-medium text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
