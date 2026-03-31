"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Landmark,
  CheckCircle2,
  ShieldAlert,
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

export default function ListVehiclePage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false); // <-- Added agreement state

  const { applyForFleetPartner, isApplying } = useFleetPartnerApplication();

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      businessName: "",
      bankName: "",
      bankAccountName: "",
      bankAccountNumber: "",
    },
  });

  console.log("Form Errors:", form.formState.errors);

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
      // The hook's toast will handle the error message display
    }
  };

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
            Your fleet partnership application is now pending review. An admin
            will contact you shortly to discuss the revenue-sharing contract.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-bold text-blue-900 mb-1">
              What happens next?
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">
              Once approved, you will receive an email notification granting you
              access to the <strong>Fleet Partner Dashboard</strong>. From
              there, you will be able to add and manage your specific vehicles.
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
      <div className="bg-slate-900 text-white pt-10 pb-24 px-6 rounded-b-[3rem] shadow-sm">
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
            <Car className="w-8 h-8 text-emerald-400" /> Become a Fleet Partner
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mb-4">
            Partner with us to monetize your idle vehicles. Earn up to 70%
            revenue share with zero marketing effort. Apply below to set up your
            partner account.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-14">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Landmark className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Payout & Business Details
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Business or Owner Name
                </Label>
                <Input
                  {...form.register("businessName")}
                  placeholder="e.g. John Doe Rentals"
                  className={cn(
                    "h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500 font-medium",
                    form.formState.errors.businessName &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {form.formState.errors.businessName && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Bank / Wallet Name
                  </Label>
                  <Input
                    {...form.register("bankName")}
                    placeholder="e.g. BDO, UnionBank, GCash"
                    className={cn(
                      "h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500 font-medium",
                      form.formState.errors.bankName &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.bankName && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.bankName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Account Name
                  </Label>
                  <Input
                    {...form.register("bankAccountName")}
                    placeholder="Registered Name"
                    className={cn(
                      "h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500 font-medium",
                      form.formState.errors.bankAccountName &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.bankAccountName && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.bankAccountName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Account Number
                </Label>
                <Input
                  {...form.register("bankAccountNumber")}
                  placeholder="1234 5678 9000"
                  className={cn(
                    "h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500 font-medium font-mono text-lg tracking-wider",
                    form.formState.errors.bankAccountNumber &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                {form.formState.errors.bankAccountNumber && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.bankAccountNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Partnership Agreement Section --- */}
            <div className="border-t border-slate-100 pt-8 mt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Partnership Agreement
              </h2>
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(c) => setAgreed(c as boolean)}
                  className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-slate-600 leading-relaxed cursor-pointer font-medium"
                >
                  I confirm that the information provided is accurate and I
                  agree to the MC Ormoc Fleet Partner Terms of Service. I
                  consent to the collection and processing of my business and
                  banking details solely for payout purposes.
                </Label>
              </div>
            </div>
            {/* ---------------------------------------- */}
          </div>

          <div className="flex flex-col items-center">
            {/* Added '!agreed' to the disabled prop */}
            <Button
              type="submit"
              size="lg"
              disabled={!form.formState.isValid || isApplying || !agreed}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 font-bold text-base shadow-lg disabled:opacity-50 mb-4"
            >
              {isApplying ? "Processing..." : "Submit Partner Application"}
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <p>
                Your account must be approved before you can add vehicles to the
                fleet.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
