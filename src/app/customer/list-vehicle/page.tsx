"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Landmark,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFleetPartnerApplication } from "../../../../hooks/use-fleetPartners";

const PartnerSchema = z.object({
  businessName: z.string().min(2, "Business or Owner Name is required"),
  bankName: z.string().min(2, "Bank Name is required"),
  bankAccountName: z.string().min(2, "Account Name is required"),
  bankAccountNumber: z.string().min(5, "Valid Account Number is required"),
});

type PartnerFormValues = z.infer<typeof PartnerSchema>;

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

export default function ListVehiclePage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { applyForFleetPartner, isApplying } = useFleetPartnerApplication();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(PartnerSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
    },
  });

  const onSubmit = async (data: PartnerFormValues) => {
    const submitData = new FormData();
    submitData.append("businessName", data.businessName);
    submitData.append("bankName", data.bankName);
    submitData.append("bankAccountName", data.bankAccountName);
    submitData.append("bankAccountNumber", data.bankAccountNumber);

    try {
      await applyForFleetPartner(submitData);
      setIsSuccess(true);
    } catch (error) {
      // Handled by hook
    }
  };

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
            Your fleet partnership application is now pending review. An admin
            will contact you shortly to discuss the revenue-sharing contract.
          </p>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-sm p-5 mb-10 text-left">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
              Next Phase
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed tracking-wide">
              Upon approval, you will gain access to the{" "}
              <strong className="text-white">Fleet Partner Dashboard</strong>{" "}
              via email notification to manage your specific vehicles.
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
            className="rounded-full text-white/40 hover:text-white hover:bg-white/5 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-emerald-500/50" />
            <span className="text-emerald-400 text-[9px] font-medium uppercase tracking-[0.4em]">
              Asset Monetization
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tighter leading-none mb-6">
            Become a{" "}
            <span className="italic font-normal text-white/50">
              Fleet Partner.
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
            Partner with us to monetize your idle vehicles. Earn up to 70%
            revenue share with zero marketing effort.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 md:p-10 shadow-2xl border border-white/5 mb-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
              <Landmark className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-light text-white tracking-wide">
                Payout & Business Details
              </h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                  Business or Owner Name
                </Label>
                <Input
                  {...form.register("businessName")}
                  placeholder="E.G. JOHN DOE RENTALS"
                  className={cn(
                    "h-12 rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all",
                    form.formState.errors.businessName && "border-red-500/50",
                  )}
                />
                {form.formState.errors.businessName && (
                  <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                    {form.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Bank / Wallet Name
                  </Label>
                  <Input
                    {...form.register("bankName")}
                    placeholder="E.G. BDO, UNIONBANK, GCASH"
                    className={cn(
                      "h-12 rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all",
                      form.formState.errors.bankName && "border-red-500/50",
                    )}
                  />
                  {form.formState.errors.bankName && (
                    <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                      {form.formState.errors.bankName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Account Name
                  </Label>
                  <Input
                    {...form.register("bankAccountName")}
                    placeholder="REGISTERED NAME"
                    className={cn(
                      "h-12 rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all",
                      form.formState.errors.bankAccountName &&
                        "border-red-500/50",
                    )}
                  />
                  {form.formState.errors.bankAccountName && (
                    <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                      {form.formState.errors.bankAccountName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                  Account Number
                </Label>
                <Input
                  {...form.register("bankAccountNumber")}
                  placeholder="0000 0000 0000"
                  className={cn(
                    "h-12 rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 font-mono text-lg tracking-[0.2em]",
                    form.formState.errors.bankAccountNumber &&
                      "border-red-500/50",
                  )}
                />
                {form.formState.errors.bankAccountNumber && (
                  <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                    {form.formState.errors.bankAccountNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Partnership Agreement Section */}
            <div className="border-t border-white/5 pt-10 mt-10">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white mb-6">
                Partnership Agreement
              </h2>
              <div className="flex items-start space-x-4 p-6 bg-[#050608] rounded-sm border border-white/5 group hover:border-white/10 transition-colors">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(c) => setAgreed(c as boolean)}
                  className="mt-1 border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor="terms"
                  className="text-[10px] text-slate-400 leading-relaxed cursor-pointer font-light uppercase tracking-widest"
                >
                  I confirm that the information provided is accurate and I
                  agree to the MC Ormoc Fleet Partner Terms of Service. I
                  consent to the collection and processing of my business and
                  banking details solely for payout purposes.
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button
              type="submit"
              disabled={!form.formState.isValid || isApplying || !agreed}
              className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-16 font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 group disabled:opacity-30"
            >
              {isApplying ? (
                "Authenticating..."
              ) : (
                <span className="flex items-center gap-3">
                  Submit Partner Application{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="flex items-center gap-3 text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-500/50" />
              <p>Approval is required prior to asset listing.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
