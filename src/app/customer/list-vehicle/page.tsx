"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

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
    } catch {
      // Handled by hook
    }
  };

  // --- SUCCESS STATE UI ---
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
            Your fleet partnership application is now pending review. Our team
            will contact you shortly to discuss the contract.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-[#64c5c3]" />
              <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                Next Steps
              </p>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed font-medium">
              Upon approval, you will gain access to the{" "}
              <strong className="text-white">Fleet Partner Dashboard</strong>{" "}
              via email notification to manage and list your vehicles.
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

        <div className="max-w-3xl mx-auto relative z-10 pt-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="h-[2px] w-6 bg-[#64c5c3]" />
              <span className="text-[#64c5c3] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                Asset Monetization
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[1] mb-3 sm:mb-4">
              Monetize Your <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                Drive
              </span>
            </h1>
            <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm font-medium leading-relaxed">
              Partner with us to turn your idle vehicles into active income.
              Earn up to 70% revenue share with zero marketing effort.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-6 sm:-mt-10 relative z-10">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/5 mb-8 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
              <div className="p-2 bg-[#64c5c3]/10 rounded-lg">
                <Landmark className="w-4 h-4 text-[#64c5c3]" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Payout & Business Details
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  Business or Owner Name
                </Label>
                <Input
                  {...form.register("businessName")}
                  placeholder="e.g. John Doe Rentals"
                  className={cn(
                    "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                    form.formState.errors.businessName &&
                      "border-red-500/50 focus-visible:ring-red-500",
                  )}
                />
                {form.formState.errors.businessName && (
                  <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                    {form.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Bank / Wallet Name
                  </Label>
                  <Input
                    {...form.register("bankName")}
                    placeholder="e.g. BDO, UnionBank, GCash"
                    className={cn(
                      "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                      form.formState.errors.bankName &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.bankName && (
                    <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                      {form.formState.errors.bankName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Account Name
                  </Label>
                  <Input
                    {...form.register("bankAccountName")}
                    placeholder="Registered Name"
                    className={cn(
                      "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent transition-all text-xs font-medium",
                      form.formState.errors.bankAccountName &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.bankAccountName && (
                    <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                      {form.formState.errors.bankAccountName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  Account Number
                </Label>
                <Input
                  {...form.register("bankAccountNumber")}
                  placeholder="0000 0000 0000"
                  className={cn(
                    "h-10 rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] focus-visible:border-transparent font-mono text-sm tracking-widest transition-all",
                    form.formState.errors.bankAccountNumber &&
                      "border-red-500/50 focus-visible:ring-red-500",
                  )}
                />
                {form.formState.errors.bankAccountNumber && (
                  <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest leading-tight">
                    {form.formState.errors.bankAccountNumber.message}
                  </p>
                )}
              </div>

              {/* Partnership Agreement Section */}
              <div className="border-t border-white/10 pt-5 mt-5">
                <h2 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Partnership Agreement
                </h2>
                <div className="flex items-start space-x-3 p-3.5 sm:p-4 bg-black/40 rounded-xl border border-white/5 group hover:border-[#64c5c3]/30 transition-colors">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={(c) => setAgreed(c as boolean)}
                    className="mt-0.5 border-white/20 data-[state=checked]:bg-[#64c5c3] data-[state=checked]:border-[#64c5c3] data-[state=checked]:text-black rounded"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-[9px] text-gray-400 leading-relaxed cursor-pointer font-bold uppercase tracking-widest"
                  >
                    I confirm that the information provided is accurate and I
                    agree to the Seffne Transport Services Inc. Fleet Partner
                    Terms of Service. I consent to the collection and processing
                    of my business and banking details solely for payout
                    purposes.
                  </Label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <Button
                type="submit"
                disabled={!form.formState.isValid || isApplying || !agreed}
                className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg h-10 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(100,197,195,0.2)] transition-all duration-500 group disabled:opacity-40 disabled:bg-[#64c5c3] disabled:shadow-none"
              >
                {isApplying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit Application{" "}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-2 text-[8px] text-gray-500 uppercase tracking-widest font-bold text-center">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#64c5c3]" />
                <p>Approval is required prior to asset listing.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
