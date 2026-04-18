"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Key,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDriverApplication } from "../../../../hooks/use-drivers";
import { useProfile } from "../../../../hooks/use-profile";
import { cn } from "@/lib/utils";

export default function ApplyDriverPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { applyForDriver, isApplying } = useDriverApplication();
  const { profile, isLoading: isProfileLoading } = useProfile();

  const handleSubmit = async () => {
    try {
      await applyForDriver();
      setIsSuccess(true);
    } catch {
      // Error handled by hook
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#050B10] flex items-center justify-center text-xs uppercase tracking-widest text-gray-500 font-bold">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#64c5c3] rounded-full animate-spin mr-4" />{" "}
        Authenticating...
      </div>
    );
  }

  const documents = profile?.documents || [];
  const latestLicense = documents.find((d: any) => d.category === "license_id");
  const hasVerifiedLicense = latestLicense?.status === "VERIFIED";

  // --- SUCCESS STATE UI ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050B10] flex flex-col items-center justify-center p-6 selection:bg-[#64c5c3] selection:text-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a1118]/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/5 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="w-20 h-20 bg-[#64c5c3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#64c5c3]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Application Received
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed mb-8">
            Our fleet managers will review your profile. We will contact you
            shortly for your interview and driving test.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#64c5c3]" />
              <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                Next Phase
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium">
              Once approved, you will gain access to the{" "}
              <strong className="text-white">Driver Dashboard</strong> to manage
              shifts, assigned vehicles, and daily earnings.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/profile")}
            className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl h-14 font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)]"
          >
            Return to Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- MAIN FORM UI ---
  return (
    <div className="min-h-screen bg-[#050B10] font-sans selection:bg-[#64c5c3] selection:text-black text-white pb-24">
      {/* Header */}
      <div className="relative pt-12 md:pt-20 pb-16 md:pb-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full text-gray-400 hover:text-white hover:bg-white/10 mb-6 md:mb-8 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="h-[2px] w-8 bg-[#64c5c3]" />
              <span className="text-[#64c5c3] text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Career Opportunity
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
              Drive With <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                MC Ormoc
              </span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-md font-medium leading-relaxed">
              Earn reliable income by driving our premium fleet. Set your own
              schedule, enjoy flexible shifts, and get paid daily.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-10">
        <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5 mb-8 md:mb-10 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8 md:mb-10 pb-6 border-b border-white/10">
            <div className="p-2.5 bg-[#64c5c3]/10 rounded-xl">
              <Key className="w-5 h-5 text-[#64c5c3]" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
              Requirements Checklist
            </h2>
          </div>

          <div className="space-y-4 md:space-y-6 mb-10 md:mb-12">
            {/* Dynamic License Check */}
            {hasVerifiedLicense ? (
              <div className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-[#64c5c3]/5 border border-[#64c5c3]/20 transition-all hover:border-[#64c5c3]/40">
                <CheckCircle2 className="w-6 h-6 text-[#64c5c3] shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                    Professional Driver&apos;s License
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#64c5c3] font-bold uppercase tracking-widest">
                    Verified on your profile
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6 rounded-2xl bg-red-500/5 border border-red-500/10 transition-all hover:border-red-500/20">
                <div className="flex items-start gap-4 flex-1">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                      License Missing or Unverified
                    </h3>
                    <p className="text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                      You must have a verified Professional Driver&apos;s
                      License on your profile before applying.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/customer/profile")}
                  className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-12 px-6 font-bold text-[10px] uppercase tracking-widest transition-all shrink-0"
                >
                  Go to Profile
                </Button>
              </div>
            )}

            <div className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-white/10">
              <Clock className="w-6 h-6 text-gray-500 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                  Background Check (NBI Clearance)
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Required during the physical interview phase.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8 md:pt-10 md:mt-10">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 md:mb-6">
              Driver Agreement
            </h2>
            <div className="flex items-start space-x-3 md:space-x-4 p-4 md:p-6 bg-black/40 rounded-xl md:rounded-2xl border border-white/5 group hover:border-[#64c5c3]/30 transition-colors">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c as boolean)}
                disabled={!hasVerifiedLicense}
                className="mt-1 border-white/20 data-[state=checked]:bg-[#64c5c3] data-[state=checked]:border-[#64c5c3] data-[state=checked]:text-black rounded disabled:opacity-30"
              />
              <Label
                htmlFor="terms"
                className={cn(
                  "text-[9px] md:text-[10px] leading-relaxed font-bold uppercase tracking-widest",
                  hasVerifiedLicense
                    ? "text-gray-400 cursor-pointer"
                    : "text-gray-600 cursor-not-allowed",
                )}
              >
                I confirm that I have a clean driving record and I agree to the
                MC Ormoc Driver Partner Terms of Service. I understand that my
                application is subject to admin approval before dashboard access
                is granted.
              </Label>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:gap-6 mt-8 md:mt-10">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!agreed || isApplying || !hasVerifiedLicense}
              className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl h-14 md:h-16 font-black text-[10px] md:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(100,197,195,0.2)] transition-all duration-500 group disabled:opacity-40 disabled:bg-[#64c5c3] disabled:shadow-none"
            >
              {isApplying ? (
                "Authenticating..."
              ) : (
                <span className="flex items-center gap-3">
                  Submit Driver Application{" "}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
