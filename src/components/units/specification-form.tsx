"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  carSpecificationSchema,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  BODY_TYPES,
} from "@/lib/schemas/car";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpecificationFormValues = z.infer<typeof carSpecificationSchema>;

interface Props {
  initialData?: SpecificationFormValues | null;
  onClose: () => void;
  onSuccess?: (newSpecId: string) => void;
}

export function SpecificationForm({ initialData, onClose, onSuccess }: Props) {
  const { saveSpecification } = useFleetSettings();

  const form = useForm({
    resolver: zodResolver(carSpecificationSchema),
    defaultValues: {
      spec_id: initialData?.spec_id,
      name: initialData?.name || "",
      engine_type: initialData?.engine_type || "",
      transmission: initialData?.transmission || "",
      fuel_type: initialData?.fuel_type || "",
      body_type: initialData?.body_type || "",
      passenger_capacity: initialData?.passenger_capacity ?? 5,
      luggage_capacity: initialData?.luggage_capacity ?? 2,
      buffer_hours: initialData?.buffer_hours ?? 12,
      is_archived: false,
    },
  });

  const onSubmit = async (data: SpecificationFormValues) => {
    try {
      const result = await saveSpecification(data);
      if (result.success && result.spec_id) {
        if (onSuccess) onSuccess(result.spec_id);
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-md">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <div className="flex flex-col">
          <h3 className="font-bold text-sm text-slate-800 leading-tight">
            {initialData ? "Edit Configuration" : "New Configuration"}
          </h3>
          <p className="text-[10px] text-slate-500">
            Define specifications to easily apply to future units.
          </p>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Configuration Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Toyota Vios 2023 - Base"
                      className="h-8 text-xs bg-white border-slate-200"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* TYPE & TRANSMISSION */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="body_type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Body Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-md border-slate-200">
                        {BODY_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Transmission
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Select trans" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-md border-slate-200">
                        {TRANSMISSION_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* FUEL & ENGINE */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuel_type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Fuel Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Select fuel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-md border-slate-200">
                        {FUEL_TYPES.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engine_type"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Engine Details
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 1.3L 4-Cylinder"
                        className="h-8 text-xs bg-white border-slate-200"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* NUMBERS ROW */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <FormField
                control={form.control}
                name="passenger_capacity"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Seats
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-8 text-xs bg-white border-slate-200"
                        {...field}
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="luggage_capacity"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Bags
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-8 text-xs bg-white border-slate-200"
                        {...field}
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buffer_hours"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Buffer (Hrs)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-8 text-xs bg-white border-slate-200"
                        {...field}
                        value={(field.value as string) ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white border-slate-200 text-slate-700"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
