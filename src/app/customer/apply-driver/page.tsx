"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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

  // Fetch real profile data
  const { profile, isLoading: isProfileLoading } = useProfile();

  const handleSubmit = async () => {
    try {
      await applyForDriver();
      setIsSuccess(true);
    } catch (error) {
      // The error is handled by the hook's toast, but we catch it here to prevent
      // the success screen from showing if the mutation fails.
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <span className="text-slate-500 font-bold animate-pulse">
          Loading Application Data...
        </span>
      </div>
    );
  }

  // Check if the user has a verified license
  const documents = profile?.documents || [];
  const latestLicense = documents.find((d: any) => d.category === "license_id");
  const hasVerifiedLicense = latestLicense?.status === "verified";

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Application Submitted!
          </h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Our fleet managers will review your profile and documents. We will
            contact you shortly for your interview and driving test.
          </p>

          {/* What happens next box*/}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-bold text-blue-900 mb-1">
              What happens next?
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">
              Once your application is approved by an admin, you will receive an
              email notification granting you access to the{" "}
              <strong>Driver Dashboard</strong>. From there, you will be able to
              manage your shifts, view your assigned vehicles, and track your
              daily earnings.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/profile")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold shadow-md"
          >
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-sm">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full text-white/70 hover:text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-400" /> Drive with MC Ormoc
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg">
            Earn reliable income by driving our premium fleet. Set your own
            schedule and get paid daily.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Requirements Checklist
          </h2>

          <div className="space-y-4 mb-10">
            {/* Dynamic License Check */}
            {hasVerifiedLicense ? (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-emerald-900">
                    Professional Driver's License
                  </h3>
                  <p className="text-xs text-emerald-700 mt-1">
                    We found a verified Professional License attached to your
                    profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">
                    License Missing or Unverified
                  </h3>
                  <p className="text-xs text-red-700 mt-1 mb-3">
                    You must have a verified Professional Driver's License on
                    your profile before applying.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => router.push("/customer/profile")}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Go to Profile to Upload
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <Clock className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-900">
                  Background Check (NBI Clearance)
                </h3>
                <p className="text-xs text-amber-700 mt-1">
                  You will be required to submit this during your physical
                  interview.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Driver Agreement
            </h2>
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(c) => setAgreed(c as boolean)}
                disabled={!hasVerifiedLicense} // Disable if they don't meet requirements
                className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600 disabled:opacity-50"
              />
              <Label
                htmlFor="terms"
                className={cn(
                  "text-sm leading-relaxed font-medium",
                  hasVerifiedLicense
                    ? "text-slate-600 cursor-pointer"
                    : "text-slate-400 cursor-not-allowed",
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-bold text-base shadow-md disabled:opacity-50"
          >
            {isApplying ? "Submitting..." : "Submit Driver Application"}
          </Button>
        </div>
      </div>
    </div>
  );
}
