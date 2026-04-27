"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  carSpecificationSchema,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
} from "@/lib/schemas/car";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { useBookingSettings } from "../../../hooks/use-settings";
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
import {
  ArrowLeft,
  Save,
  Loader2,
  Tag,
  Wrench,
  PackageOpen,
} from "lucide-react";

type SpecificationFormValues = z.infer<typeof carSpecificationSchema>;

interface Props {
  initialData?: SpecificationFormValues | null;
  onClose: () => void;
  onSuccess?: (newSpecId: string) => void;
}

export function SpecificationForm({ initialData, onClose, onSuccess }: Props) {
  const { saveSpecification, isSavingSpecification } = useFleetSettings(); // <-- NEW: Destructure isSaving
  const { data: settingsData } = useBookingSettings();

  // Get active body types from settings
  const activeBodyTypes =
    settingsData?.vehicleTypes?.filter((vt: any) => vt.isActive) || [];

  const form = useForm<SpecificationFormValues>({
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
      is_archived: initialData?.is_archived ?? false,
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
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden shadow-sm transition-colors duration-300">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30 shrink-0 transition-colors">
        <Button
          variant="ghost"
          size="icon"
          disabled={isSavingSpecification}
          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex flex-col">
          <h3 className="font-bold text-xs text-foreground leading-tight">
            {initialData ? "Edit Configuration" : "New Configuration"}
          </h3>
          <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
            Define specifications to easily apply to future units.
          </p>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0 bg-background custom-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* GROUP 1: GENERAL */}
            <div className="p-3.5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  General Details
                </h4>
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Configuration Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSavingSpecification}
                        placeholder="e.g. Toyota Vios 2023 - Base"
                        className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage className="text-[9px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* GROUP 2: DRIVETRAIN & BODY */}
            <div className="p-3.5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Drivetrain & Body
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="body_type"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Body Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isSavingSpecification}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 w-full text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-lg border-border bg-popover">
                          {activeBodyTypes.map((opt: any) => (
                            <SelectItem
                              key={opt.id}
                              value={opt.label}
                              className="text-[11px]"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Transmission
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isSavingSpecification}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 w-full text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none">
                            <SelectValue placeholder="Select trans" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-lg border-border bg-popover">
                          {TRANSMISSION_TYPES.map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="text-[11px]"
                            >
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fuel_type"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Fuel Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                        disabled={isSavingSpecification}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 w-full text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none">
                            <SelectValue placeholder="Select fuel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-lg border-border bg-popover">
                          {FUEL_TYPES.map((opt) => (
                            <SelectItem
                              key={opt}
                              value={opt}
                              className="text-[11px]"
                            >
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engine_type"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Engine Details
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSavingSpecification}
                          placeholder="e.g. 1.3L 4-Cylinder"
                          className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* GROUP 3: CAPACITIES */}
            <div className="p-3.5 bg-card border border-border rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PackageOpen className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Capacities & Logistics
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="passenger_capacity"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Seats
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSavingSpecification}
                          className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : Number(val),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="luggage_capacity"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Bags
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSavingSpecification}
                          className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : Number(val),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-[9px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="pt-2 flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSavingSpecification}
                className="h-8 text-[11px] font-semibold bg-card border-border hover:bg-secondary text-foreground rounded-lg shadow-none transition-colors"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingSpecification}
                className="h-8 text-[11px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
              >
                {isSavingSpecification ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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
