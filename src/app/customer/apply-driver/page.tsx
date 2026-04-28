"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
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
      <div className="min-h-[80vh] bg-[#050B10] flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#64c5c3] rounded-full animate-spin mr-3" />{" "}
        Authenticating...
      </div>
    );
  }

  const documents = profile?.documents || [];
  const latestLicense = documents.find((d: any) => d.category === "license_id");
  const hasLicenseUploaded = !!latestLicense;

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] bg-[#050B10] flex flex-col items-center justify-center p-4 selection:bg-[#64c5c3] selection:text-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a1118]/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#64c5c3]/10 rounded-full blur-[60px] pointer-events-none -z-10" />

          <div className="w-16 h-16 bg-[#64c5c3]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#64c5c3]/20">
            <CheckCircle2 className="w-8 h-8 text-[#64c5c3]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
            Application Received
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest leading-relaxed mb-6 font-medium">
            Our fleet managers will review your profile. We will contact you
            shortly for your interview and driving test.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-[#64c5c3]" />
              <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                Next Phase
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-medium">
              Once approved, you will gain access to the{" "}
              <strong className="text-white">Driver Dashboard</strong> to manage
              shifts, assigned vehicles, and daily earnings.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/profile")}
            className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg h-10 font-bold text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)]"
          >
            Return to Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- MAIN FORM UI ---
  return (
    <div className="min-h-screen bg-[#050B10] font-sans selection:bg-[#64c5c3] selection:text-black text-white pb-16">
      {/* Header */}
      <div className="relative pt-8 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#64c5c3]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto relative z-10 pt-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2 pt-6 sm:mb-3">
              <div className="h-[2px] w-6 bg-[#64c5c3]" />
              <span className="text-[#64c5c3] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                Career Opportunity
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[1] mb-3 sm:mb-4">
              Drive With <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                MC Ormoc
              </span>
            </h1>
            <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm font-medium leading-relaxed">
              Earn reliable income by driving our premium fleet. Set your own
              schedule, enjoy flexible shifts, and get paid daily.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-6 sm:-mt-10 relative z-10">
        <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/5 mb-8 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
            <div className="p-2 bg-[#64c5c3]/10 rounded-lg">
              <Key className="w-4 h-4 text-[#64c5c3]" />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Requirements Checklist
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {/* Dynamic License Check */}
            {hasLicenseUploaded ? (
              <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-[#64c5c3]/5 border border-[#64c5c3]/20 transition-all hover:border-[#64c5c3]/40">
                <CheckCircle2 className="w-5 h-5 text-[#64c5c3] shrink-0" />
                <div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-0.5">
                    Professional Driver&apos;s License
                  </h3>
                  <p className="text-[9px] text-[#64c5c3] font-bold uppercase tracking-widest">
                    {latestLicense.status === "VERIFIED"
                      ? "Verified on your profile"
                      : "Uploaded and pending review"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/10 transition-all hover:border-red-500/20">
                <div className="flex items-start gap-3 flex-1">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-0.5">
                      License Document Missing
                    </h3>
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest leading-relaxed">
                      Upload your Professional Driver&apos;s License to your
                      profile.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/customer/profile")}
                  className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg h-9 px-5 font-bold text-[10px] uppercase tracking-widest transition-all shrink-0"
                >
                  Go to Profile
                </Button>
              </div>
            )}

            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-black/40 border border-white/5 transition-all hover:border-white/10">
              <Clock className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-0.5">
                  Background Check (NBI Clearance)
                </h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                  Required during the physical interview phase.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 mt-5">
            <h2 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Driver Agreement
            </h2>
            <div className="flex items-start space-x-3 p-3.5 sm:p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#64c5c3]/30 transition-colors">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c as boolean)}
                disabled={!hasLicenseUploaded}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-[#64c5c3] data-[state=checked]:border-[#64c5c3] data-[state=checked]:text-black rounded disabled:opacity-30"
              />
              <Label
                htmlFor="terms"
                className={cn(
                  "text-[9px] leading-relaxed font-bold uppercase tracking-widest",
                  hasLicenseUploaded
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

          <div className="mt-6">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!agreed || isApplying || !hasLicenseUploaded}
              className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg h-10 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(100,197,195,0.2)] transition-all duration-500 group disabled:opacity-40 disabled:bg-[#64c5c3] disabled:shadow-none"
            >
              {isApplying ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Application{" "}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
