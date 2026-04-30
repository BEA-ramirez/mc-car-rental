"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  CarSpecificationType,
  completeCarSchema,
  CompleteCarType,
  FeatureType,
} from "@/lib/schemas/car";
import { useUnits } from "../../../hooks/use-units";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { useFileUpload } from "../../../hooks/use-file-upload";
import {
  Loader2,
  CarFront,
  IdCard,
  Sparkles,
  CheckCircle2,
  Trash2,
  Star,
  UploadCloud,
  Search,
  Settings2,
  Check,
  Tag,
  Briefcase,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import Image from "next/image";
import { toast } from "sonner"; // Imported toast

interface UnitsFormProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any | null;
}

export function UnitsForm({ open, onOpenChange, initialData }: UnitsFormProp) {
  const { saveUnit, isSaving, useSpecifications, useFeatures } = useUnits();
  const { data: fleetPartners } = useFleetPartners();

  const {
    specifications,
    isLoading: loadingSpecs,
    setSearchQuery: setSpecSearch,
  } = useSpecifications();

  const {
    features,
    isLoading: loadingFeatures,
    setSearchQuery: setFeatureSearch,
  } = useFeatures();

  const { isUploading, fileInputRef, handleFileSelect, triggerFileDialog } =
    useFileUpload({
      bucket: "fleet",
      folder: "cars",
      onUploadComplete: (newFiles) => {
        const currentImages = form.getValues("images") || [];
        const newImageObjects = newFiles.map((file, index) => ({
          image_url: file.url,
          storage_path: file.path,
          is_primary: currentImages.length === 0 && index === 0,
          is_archived: false,
        }));
        form.setValue("images", [...currentImages, ...newImageObjects], {
          shouldDirty: true,
        });
      },
    });

  const form = useForm<CompleteCarType>({
    resolver: zodResolver(completeCarSchema),
    defaultValues: {
      car_id: undefined,
      plate_number: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      rental_rate_per_day: 0,
      rental_rate_per_12h: 0,
      default_buffer_hours: 3,
      availability_status: "AVAILABLE",
      spec_id: "",
      car_owner_id: "",
      specifications: null,
      owner: null,
      features: [],
      images: [],
      vin: "",
      current_mileage: 0,
      is_archived: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Fix: Strip problematic timestamp fields from features to prevent Zod ISO string errors
        const safeFeatures = (initialData.features || []).map((f: any) => ({
          feature_id: f.feature_id,
          name: f.name,
          description: f.description,
        }));

        form.reset({
          car_id: initialData.car_id,
          plate_number: initialData.plate_number || "",
          brand: initialData.brand || "",
          model: initialData.model || "",
          year: Number(initialData.year) || new Date().getFullYear(),
          color: initialData.color || "",
          rental_rate_per_day: Number(initialData.rental_rate_per_day) || 0,
          rental_rate_per_12h: Number(initialData.rental_rate_per_12h) || 0,
          default_buffer_hours: Number(initialData.default_buffer_hours) || 3,
          availability_status: initialData.availability_status || "AVAILABLE",
          spec_id: initialData.spec_id || "",
          car_owner_id: initialData.car_owner_id || "",
          features: safeFeatures, // Using the sanitized features array
          images: initialData.images || [],
          vin: initialData.vin || "",
          current_mileage: Number(initialData.current_mileage) || 0,
          is_archived: initialData.is_archived || false,
        });
      } else {
        form.reset({
          car_id: undefined,
          plate_number: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          rental_rate_per_day: 0,
          rental_rate_per_12h: 0,
          default_buffer_hours: 3,
          availability_status: "AVAILABLE",
          spec_id: "",
          car_owner_id: "",
          specifications: null,
          owner: null,
          features: [],
          images: [],
          vin: "",
          current_mileage: 0,
          is_archived: false,
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (data: any) => {
    try {
      await saveUnit(data as unknown as CompleteCarType);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !w-[95vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-background shadow-2xl border-border transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
              <CarFront className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1.5 uppercase">
                {initialData ? "Edit Unit Details" : "Add New Unit"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-medium text-muted-foreground leading-none m-0">
                Configure the vehicle identity, specifications, and features.
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSaving || isUploading} // Disable close button when busy
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation Errors:", errors);
                // Fix: Replaced alert with a toast notification
                toast.error("Please check all required fields before saving.", {
                  description:
                    "Ensure you've selected a specification and assigned an owner.",
                });
              })(e);
            }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <Tabs
              defaultValue="identity"
              className="flex flex-col flex-1 min-h-0"
            >
              {/* TAB NAVIGATION */}
              <div className="px-4 py-2 border-b border-border bg-secondary/30 shrink-0 transition-colors">
                <TabsList className="h-9 bg-background/50 p-1 flex w-full max-w-[400px] rounded-lg border border-border shadow-inner transition-colors">
                  <TabsTrigger
                    value="identity"
                    className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all gap-1.5"
                  >
                    <IdCard className="w-3.5 h-3.5" /> Identity & Ops
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Specs
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Features
                    <span className="ml-1 bg-primary/10 text-primary text-[9px] px-1.5 py-0 rounded border border-primary/20 font-bold">
                      {form.watch("features")?.length || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 sm:pt-2 bg-background custom-scrollbar transition-colors">
                {/* --- TAB 1: IDENTITY & PRICING --- */}
                <TabsContent
                  value="identity"
                  className="m-0 h-full outline-none"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                    {/* LEFT COLUMN: INPUTS */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Section: Vehicle Identity */}
                      <div className="p-4 bg-card border border-border rounded-xl space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 border-b border-border pb-2.5">
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                            Vehicle Identity
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="plate_number"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Plate Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="ABC-1234"
                                    className="h-8 text-[11px] font-bold font-mono bg-secondary border-border text-foreground uppercase rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value.toUpperCase(),
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vin"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  VIN (Serial)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1HGCM82..."
                                    maxLength={17}
                                    className="h-8 text-[11px] font-bold font-mono bg-secondary border-border text-foreground uppercase rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value.toUpperCase(),
                                      )
                                    }
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Brand
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Toyota"
                                    className="h-8 text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Model
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Fortuner"
                                    className="h-8 text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Year
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-8 text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    value={
                                      field.value === undefined
                                        ? ""
                                        : field.value
                                    }
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
                            name="color"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Color
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Black"
                                    className="h-8 text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="current_mileage"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Mileage (km)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-8 text-[11px] font-semibold font-mono bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    value={
                                      field.value === undefined
                                        ? ""
                                        : field.value
                                    }
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

                      {/* Section: Pricing & Operations */}
                      <div className="p-4 bg-card border border-border rounded-xl space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 border-b border-border pb-2.5">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                            Operations & Pricing
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="availability_status"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Status
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 w-full text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-lg border-border bg-popover shadow-md">
                                    <SelectItem
                                      value="AVAILABLE"
                                      className="text-[11px] font-semibold"
                                    >
                                      🟢 Available
                                    </SelectItem>
                                    <SelectItem
                                      value="IN USE"
                                      className="text-[11px] font-semibold"
                                    >
                                      🔵 Rented
                                    </SelectItem>
                                    <SelectItem
                                      value="MAINTENANCE"
                                      className="text-[11px] font-semibold"
                                    >
                                      🟠 Maintenance
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="car_owner_id"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Owner / Partner
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 w-full text-[11px] font-semibold bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors">
                                      <SelectValue placeholder="Assign fleet partner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-lg border-border bg-popover shadow-md">
                                    {fleetPartners?.map(
                                      (partner: FleetPartnerType) => (
                                        <SelectItem
                                          key={partner.car_owner_id}
                                          value={partner.car_owner_id}
                                          className="text-[11px] font-semibold"
                                        >
                                          {partner.business_name ||
                                            partner.users.first_name}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="rental_rate_per_day"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Daily Rate (₱)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2500"
                                    className="h-8 text-[11px] font-bold font-mono bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    value={
                                      field.value === undefined
                                        ? ""
                                        : field.value
                                    }
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
                            name="rental_rate_per_12h"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  12-Hr Rate (₱)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1500"
                                    className="h-8 text-[11px] font-bold font-mono bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    value={
                                      field.value === undefined
                                        ? ""
                                        : field.value
                                    }
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
                            name="default_buffer_hours"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Buffer (Hrs)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="12"
                                    className="h-8 text-[11px] font-bold font-mono bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none transition-colors"
                                    {...field}
                                    value={
                                      field.value === undefined
                                        ? ""
                                        : field.value
                                    }
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
                    </div>

                    {/* RIGHT COLUMN: IMAGES */}
                    <div className="lg:col-span-5 h-full">
                      <div className="p-4 bg-card border border-border rounded-xl h-full flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-border pb-2.5">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                              Media Gallery
                            </h3>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-bold font-mono text-muted-foreground bg-secondary border border-border rounded shadow-none h-5 px-1.5"
                          >
                            {form.watch("images")?.length || 0} / 5
                          </Badge>
                        </div>

                        {/* Upload Box */}
                        <Input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleFileSelect}
                          disabled={isUploading || isSaving}
                        />
                        <div
                          className={cn(
                            "border border-dashed border-border rounded-xl h-24 flex flex-col items-center justify-center bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors shadow-sm mb-4",
                            (isUploading || isSaving) &&
                              "opacity-50 cursor-not-allowed pointer-events-none",
                          )}
                          onClick={triggerFileDialog}
                        >
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 text-primary mb-1.5 animate-spin" />
                          ) : (
                            <UploadCloud className="h-5 w-5 text-muted-foreground mb-1.5" />
                          )}
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {isUploading
                              ? "Uploading Images..."
                              : "Click to upload images"}
                          </p>
                        </div>

                        {/* Image List */}
                        <div className="flex-1 overflow-y-auto w-full rounded-xl border border-border p-3 bg-secondary/30 max-h-[400px] custom-scrollbar">
                          <div className="space-y-2.5">
                            {(form.watch("images") || []).map(
                              (img: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-2 border border-border rounded-lg bg-card shadow-sm group transition-colors hover:border-primary/50"
                                >
                                  <Image
                                    src={img.image_url}
                                    alt="Unit"
                                    width={64}
                                    height={48}
                                    className="h-12 w-16 object-cover rounded border border-border"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest truncate">
                                      image_{index + 1}.jpg
                                    </p>
                                    {img.is_primary && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[8px] uppercase tracking-widest h-4 px-1.5 bg-primary/10 text-primary border border-primary/20 mt-1 rounded shadow-none"
                                      >
                                        Primary
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={isUploading || isSaving}
                                      className="h-7 w-7 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                      title="Set Primary"
                                      onClick={() => {
                                        const updated = form
                                          .getValues("images")
                                          ?.map((item: any, i: number) => ({
                                            ...item,
                                            is_primary: i === index,
                                          }));
                                        form.setValue("images", updated, {
                                          shouldDirty: true,
                                        });
                                      }}
                                    >
                                      <Star
                                        className={cn(
                                          "h-3.5 w-3.5",
                                          img.is_primary
                                            ? "fill-amber-500 text-amber-500"
                                            : "",
                                        )}
                                      />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={isUploading || isSaving}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                      onClick={() => {
                                        const filtered = form
                                          .getValues("images")
                                          ?.filter(
                                            (_: any, i: number) => i !== index,
                                          );
                                        form.setValue("images", filtered, {
                                          shouldDirty: true,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ),
                            )}
                            {form.watch("images")?.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
                                <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                                <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                                  No images added
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* --- TAB 2: CONFIGURATION --- */}
                <TabsContent
                  value="config"
                  className="m-0 h-full flex flex-col gap-4 outline-none"
                >
                  {form.formState.errors.spec_id && (
                    <Alert
                      variant="destructive"
                      className="py-2.5 px-3 h-auto border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-[10px] font-bold uppercase tracking-widest">
                        Selection Required
                      </AlertTitle>
                      <AlertDescription className="text-[11px] font-medium mt-1">
                        Please select a vehicle configuration from the list
                        below.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[320px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates (e.g. 'Vios', 'Automatic')..."
                        disabled={isSaving || isUploading}
                        className="pl-9 h-9 text-[11px] font-medium bg-card border-border text-foreground focus-visible:ring-primary rounded-lg shadow-sm transition-colors"
                        onChange={(e) => setSpecSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                    {loadingSpecs ? (
                      <div className="flex justify-center items-center h-full min-h-[200px]">
                        <Loader2 className="animate-spin text-primary h-6 w-6" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {specifications.map((spec: CarSpecificationType) => {
                          const isSelected =
                            form.watch("spec_id") === spec.spec_id;
                          return (
                            <div
                              key={spec.spec_id}
                              onClick={() => {
                                if (isSaving || isUploading) return;
                                form.setValue("spec_id", spec.spec_id!, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                              className={cn(
                                "cursor-pointer rounded-xl p-4 transition-all flex flex-col gap-3 border shadow-sm",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "bg-card border-border hover:border-primary/50 hover:bg-secondary/40",
                                (isSaving || isUploading) &&
                                  "opacity-50 cursor-not-allowed pointer-events-none",
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4
                                    className={cn(
                                      "font-bold text-xs uppercase tracking-wider leading-tight",
                                      isSelected
                                        ? "text-primary"
                                        : "text-foreground",
                                    )}
                                  >
                                    {spec.name}
                                  </h4>
                                  <p className="text-[10px] font-medium text-muted-foreground mt-1">
                                    {spec.body_type} • {spec.engine_type}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </div>
                              <div className="flex gap-2 text-[10px] flex-wrap pt-3 border-t border-border mt-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] font-bold uppercase tracking-widest h-5 px-2 bg-secondary border border-border text-foreground rounded shadow-none"
                                >
                                  {spec.transmission}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] font-bold uppercase tracking-widest h-5 px-2 bg-secondary border border-border text-foreground rounded shadow-none"
                                >
                                  {spec.fuel_type}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] font-bold uppercase tracking-widest h-5 px-2 bg-secondary border border-border text-foreground rounded shadow-none"
                                >
                                  {spec.passenger_capacity} Seats
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                        {specifications.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center h-full min-h-[200px] border border-dashed border-border rounded-xl bg-card">
                            <Settings2 className="h-8 w-8 text-muted-foreground/30 mb-3" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              No specifications found.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* --- TAB 3: FEATURES --- */}
                <TabsContent
                  value="features"
                  className="m-0 h-full flex flex-col gap-4 outline-none"
                >
                  {form.formState.errors.features && (
                    <Alert
                      variant="destructive"
                      className="py-2.5 px-3 h-auto border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-[11px] font-medium mt-1">
                        {form.formState.errors.features.message as string}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-[320px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search features..."
                        disabled={isSaving || isUploading}
                        className="pl-9 h-9 text-[11px] font-medium bg-card border-border text-foreground focus-visible:ring-primary rounded-lg shadow-sm transition-colors"
                        onChange={(e) => setFeatureSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                    {loadingFeatures ? (
                      <div className="flex justify-center items-center h-full min-h-[200px]">
                        <Loader2 className="animate-spin text-primary h-6 w-6" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {features.map((feat: FeatureType) => {
                          const currentFeats = form.watch("features") || [];
                          const isSelected = currentFeats.some(
                            (f: any) => f.feature_id === feat.feature_id,
                          );

                          return (
                            <div
                              key={feat.feature_id}
                              onClick={() => {
                                if (isSaving || isUploading) return;
                                if (isSelected) {
                                  form.setValue(
                                    "features",
                                    currentFeats.filter(
                                      (f: any) =>
                                        f.feature_id !== feat.feature_id,
                                    ),
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                } else {
                                  form.setValue(
                                    "features",
                                    [
                                      ...currentFeats,
                                      {
                                        feature_id: feat.feature_id,
                                        name: feat.name,
                                      },
                                    ],
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                }
                              }}
                              className={cn(
                                "cursor-pointer flex items-start gap-3 p-4 rounded-xl transition-all border shadow-sm",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "bg-card border-border hover:border-primary/50 hover:bg-secondary/40",
                                (isSaving || isUploading) &&
                                  "opacity-50 cursor-not-allowed pointer-events-none",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border bg-secondary",
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <div className="flex flex-col">
                                <p
                                  className={cn(
                                    "text-[11px] font-bold uppercase tracking-wider leading-tight",
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground",
                                  )}
                                >
                                  {feat.name}
                                </p>
                                {feat.description && (
                                  <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 mt-1">
                                    {feat.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* FOOTER */}
            <DialogFooter className="px-5 py-4 border-t border-border bg-card shrink-0 flex items-center justify-end gap-3 transition-colors">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isUploading} // Disable Cancel button when busy
                className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest bg-card text-foreground border-border hover:bg-secondary rounded-lg shadow-none disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || isUploading || !form.formState.isDirty} // Disable Save button when busy
                className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
              >
                {(isSaving || isUploading) && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {isSaving
                  ? "Saving..."
                  : isUploading
                    ? "Uploading Images..."
                    : initialData
                      ? "Save Changes"
                      : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
