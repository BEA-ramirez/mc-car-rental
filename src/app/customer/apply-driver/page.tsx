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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDriverApplication } from "../../../../hooks/use-drivers";
import { useProfile } from "../../../../hooks/use-profile";
import { cn } from "@/lib/utils";

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
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-medium animate-pulse">
          Authenticating Application Data...
        </span>
      </div>
    );
  }

  const documents = profile?.documents || [];
  const latestLicense = documents.find((d: any) => d.category === "license_id");
  const hasVerifiedLicense = latestLicense?.status === "verified";

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-6 selection:bg-blue-900">
        <div className="max-w-md w-full bg-white/[0.02] backdrop-blur-2xl p-10 rounded-sm border border-white/5 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <PremiumLogo />
          <h1 className="text-3xl font-light text-white tracking-tighter mb-4">
            Application{" "}
            <span className="italic font-normal text-white/50">Submitted.</span>
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest leading-relaxed mb-8">
            Our fleet managers will review your profile. We will contact you
            shortly for your interview and driving test.
          </p>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-sm p-5 mb-10 text-left">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
              Next Phase
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed tracking-wide">
              Once approved, you will gain access to the{" "}
              <strong className="text-white">Driver Dashboard</strong> to manage
              shifts, vehicles, and earnings.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/profile")}
            className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-12 font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500"
          >
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans selection:bg-blue-900 text-slate-300 pb-24">
      {/* Header */}
      <div className="relative pt-12 pb-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0C10] to-[#0A0C10] -z-10" />
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full text-white/40 hover:text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-blue-500/50" />
            <span className="text-blue-400 text-[9px] font-medium uppercase tracking-[0.4em]">
              Career Opportunity
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tighter leading-none mb-6">
            Drive with{" "}
            <span className="italic font-normal text-white/50">MC Ormoc.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
            Earn reliable income by driving our premium fleet. Set your own
            schedule and get paid daily.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 md:p-10 shadow-2xl border border-white/5 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white mb-8 border-b border-white/5 pb-4">
            Requirements Checklist
          </h2>

          <div className="space-y-4 mb-12">
            {/* Dynamic License Check */}
            {hasVerifiedLicense ? (
              <div className="flex items-start gap-4 p-5 rounded-sm bg-emerald-500/5 border border-emerald-500/10 transition-all hover:border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    Professional Driver's License
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                    We found a verified Professional License attached to your
                    profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-5 rounded-sm bg-red-500/5 border border-red-500/10 transition-all hover:border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">
                    License Missing or Unverified
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-2 mb-4 uppercase tracking-wide leading-relaxed">
                    You must have a verified Professional Driver's License on
                    your profile before applying.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => router.push("/customer/profile")}
                    className="bg-red-500 text-white hover:bg-red-400 text-[8px] font-bold rounded-none px-4 uppercase tracking-widest"
                  >
                    Go to Profile
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-5 rounded-sm bg-[#050608] border border-white/5 transition-all hover:border-white/10">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
                  Background Check (NBI Clearance)
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
                  Required during the physical interview phase.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 mb-10">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white mb-6">
              Driver Agreement
            </h2>
            <div className="flex items-start space-x-4 p-6 bg-[#050608] rounded-sm border border-white/5 group hover:border-white/10 transition-colors">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c as boolean)}
                disabled={!hasVerifiedLicense}
                className="mt-1 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 disabled:opacity-30"
              />
              <Label
                htmlFor="terms"
                className={cn(
                  "text-[10px] leading-relaxed font-light uppercase tracking-widest",
                  hasVerifiedLicense
                    ? "text-slate-400 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed",
                )}
              >
                I confirm that I have a clean driving record and I agree to the
                MC Ormoc Driver Partner Terms of Service. I understand that my
                application is subject to admin approval before dashboard access
                is granted.
              </Label>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!agreed || isApplying || !hasVerifiedLicense}
            className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-16 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 group disabled:opacity-30"
          >
            {isApplying ? (
              "Authenticating..."
            ) : (
              <span className="flex items-center gap-3">
                Submit Driver Application{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
