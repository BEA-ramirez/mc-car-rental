"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Receipt, FileText, Banknote, Loader2 } from "lucide-react";
import { useIncomes } from "../../../hooks/use-incomes";

// 1. Define the Zod Schema
const logIncomeSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be greater than 0",
    ),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

type LogIncomeFormValues = z.infer<typeof logIncomeSchema>;

type LogIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LogIncomeModal({
  isOpen,
  onClose,
}: LogIncomeModalProps) {
  const { logMisc, isLoggingMisc } = useIncomes();

  // 2. Initialize useForm
  const form = useForm<LogIncomeFormValues>({
    resolver: zodResolver(logIncomeSchema),
    defaultValues: {
      amount: "",
      category: "",
      notes: "",
    },
  });

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  // 3. Handle the submission
  const onSubmit = async (data: LogIncomeFormValues) => {
    await logMisc({
      amount: Number(data.amount),
      category: data.category,
      notes: data.notes || "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col transition-colors duration-300 [&>button.absolute]:hidden">
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Log Misc Income
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Master Ledger Entry
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-4 space-y-4 bg-background transition-colors">
              <div className="grid grid-cols-2 gap-3">
                {/* AMOUNT FIELD */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Banknote className="w-3 h-3" />
                        <span>
                          Amount (₱) <span className="text-destructive">*</span>
                        </span>
                      </label>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                            ₱
                          </span>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-8 text-[11px] pl-7 font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-emerald-500 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />

                {/* CATEGORY FIELD */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Receipt className="w-3 h-3" />
                        <span>
                          Category <span className="text-destructive">*</span>
                        </span>
                      </label>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Asset Sale"
                          className="h-8 text-[11px] font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-emerald-500 transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* NOTES FIELD */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Description & Reference
                      </label>
                      <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                        (Optional)
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="e.g., Sold old dashcam to external buyer"
                        className="min-h-[70px] text-[11px] font-medium text-foreground bg-secondary border-border shadow-none rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-4 text-[10px] font-semibold text-foreground hover:bg-secondary border-border shadow-none rounded-lg transition-colors"
                onClick={onClose}
                disabled={isLoggingMisc}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoggingMisc || !form.formState.isValid}
                className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
              >
                {isLoggingMisc ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : null}
                {isLoggingMisc ? "Logging..." : "Log Income"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
