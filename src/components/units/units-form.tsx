"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FleetPartnerType } from "@/lib/schemas/car-owner";

interface UnitsFormProp {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Use 'any' or an extended type here since initialData might be the mapped RPC response
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

  const form = useForm({
    resolver: zodResolver(completeCarSchema),
    defaultValues: {
      car_id: undefined,
      plate_number: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      rental_rate_per_day: 0,
      availability_status: "Available",
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

  // --- UPDATED HYDRATION LOGIC ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Ensure numeric fields are actually numbers and arrays are mapped correctly
        form.reset({
          car_id: initialData.car_id,
          plate_number: initialData.plate_number || "",
          brand: initialData.brand || "",
          model: initialData.model || "",
          year: Number(initialData.year) || new Date().getFullYear(),
          color: initialData.color || "",
          rental_rate_per_day: Number(initialData.rental_rate_per_day) || 0,
          availability_status: initialData.availability_status || "Available",
          spec_id: initialData.spec_id || "",
          car_owner_id: initialData.car_owner_id || "",
          features: initialData.features || [],
          images: initialData.images || [],
          vin: initialData.vin || "",
          current_mileage: Number(initialData.current_mileage) || 0,
          is_archived: initialData.is_archived || false,
        });
      } else {
        // Create Mode - Wipe form
        form.reset({
          car_id: undefined,
          plate_number: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          rental_rate_per_day: 0,
          availability_status: "Available",
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
      <DialogContent className="sm:max-w-[950px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl bg-background shadow-2xl border-border transition-colors duration-300">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card shrink-0 transition-colors">
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <CarFront className="w-4 h-4 text-primary" />
            {initialData ? "Edit Unit Details" : "Add New Unit"}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
            Configure the vehicle identity, specifications, and features.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation Errors:", errors);
                alert("Please check all required fields before saving.");
              })(e);
            }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <Tabs
              defaultValue="identity"
              className="flex flex-col flex-1 min-h-0"
            >
              {/* TAB NAVIGATION */}
              <div className="px-5 py-2.5 border-b border-border bg-card shrink-0 transition-colors">
                <TabsList className="h-8 bg-secondary p-0.5 rounded-lg border border-border inline-flex">
                  <TabsTrigger
                    value="identity"
                    className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-1.5"
                  >
                    <IdCard className="w-3.5 h-3.5" /> Identity & Operations
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Features
                    <span className="ml-1 bg-primary/10 text-primary text-[9px] px-1.5 py-0 rounded border border-primary/20 font-bold">
                      {form.watch("features")?.length || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-background custom-scrollbar">
                {/* --- TAB 1: IDENTITY & PRICING --- */}
                <TabsContent
                  value="identity"
                  className="m-0 h-full outline-none"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                    {/* LEFT COLUMN: INPUTS */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Section: Vehicle Identity */}
                      <div className="p-4 bg-card border border-border rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                            Vehicle Identity
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="plate_number"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Plate Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="ABC-1234"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground uppercase rounded-lg focus-visible:ring-primary shadow-none"
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
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  VIN (Serial)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="1HGCM82..."
                                    maxLength={17}
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground uppercase rounded-lg focus-visible:ring-primary shadow-none"
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

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Brand
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Toyota"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
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
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Model
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Fortuner"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Year
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
                                    {...field}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val))
                                        form.setValue("year", val);
                                      else if (e.target.value === "")
                                        form.setValue("year", "" as any);
                                    }}
                                    value={(field.value as number) || ""}
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
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Color
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Attitude Black"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
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
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Mileage (km)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
                                    {...field}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val))
                                        form.setValue("current_mileage", val);
                                      else if (e.target.value === "")
                                        form.setValue(
                                          "current_mileage",
                                          "" as any,
                                        );
                                    }}
                                    value={(field.value as number) || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Section: Pricing & Operations */}
                      <div className="p-4 bg-card border border-border rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                            Operations & Pricing
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="rental_rate_per_day"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Daily Rate (₱)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2500"
                                    className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none"
                                    {...field}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val))
                                        form.setValue(
                                          "rental_rate_per_day",
                                          val,
                                        );
                                      else if (e.target.value === "")
                                        form.setValue(
                                          "rental_rate_per_day",
                                          "" as any,
                                        );
                                    }}
                                    value={(field.value as number) || ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="availability_status"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Status
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-lg border-border bg-popover">
                                    <SelectItem
                                      value="Available"
                                      className="text-[11px]"
                                    >
                                      🟢 Available
                                    </SelectItem>
                                    <SelectItem
                                      value="Rented"
                                      className="text-[11px]"
                                    >
                                      🔵 Rented
                                    </SelectItem>
                                    <SelectItem
                                      value="Maintenance"
                                      className="text-[11px]"
                                    >
                                      🟠 Maintenance
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-[9px]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="car_owner_id"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Owner / Partner
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-[11px] font-medium bg-secondary border-border text-foreground rounded-lg focus-visible:ring-primary shadow-none">
                                    <SelectValue placeholder="Assign fleet partner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg border-border bg-popover">
                                  {fleetPartners?.map(
                                    (partner: FleetPartnerType) => (
                                      <SelectItem
                                        key={partner.car_owner_id}
                                        value={partner.car_owner_id}
                                        className="text-[11px]"
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
                    </div>

                    {/* RIGHT COLUMN: IMAGES */}
                    <div className="lg:col-span-5 h-full">
                      <div className="p-4 bg-card border border-border rounded-xl h-full flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-primary" />
                            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                              Media Gallery
                            </h3>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-semibold text-muted-foreground bg-secondary border-border rounded"
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
                          disabled={isUploading}
                        />
                        <div
                          className="border border-dashed border-border rounded-lg h-24 flex flex-col items-center justify-center bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors shadow-sm mb-3"
                          onClick={triggerFileDialog}
                        >
                          <UploadCloud className="h-5 w-5 text-muted-foreground mb-1.5" />
                          <p className="text-[10px] text-muted-foreground font-semibold">
                            {isUploading
                              ? "Uploading..."
                              : "Click to upload images"}
                          </p>
                        </div>

                        {/* Image List */}
                        <div className="flex-1 overflow-y-auto w-full rounded-lg border border-border p-2 bg-secondary/30 min-h-[150px] custom-scrollbar">
                          <div className="space-y-2">
                            {(form.watch("images") || []).map(
                              (img: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-1.5 border border-border rounded-md bg-card shadow-sm group transition-colors hover:border-primary/50"
                                >
                                  <img
                                    src={img.image_url}
                                    alt="Unit"
                                    className="h-10 w-14 object-cover rounded shadow-sm border border-border"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold text-foreground truncate">
                                      image_{index + 1}.jpg
                                    </p>
                                    {img.is_primary && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[8px] uppercase tracking-widest h-3.5 px-1 bg-primary/10 text-primary border-primary/20 mt-0.5 rounded"
                                      >
                                        Primary
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
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
                                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
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
                              <p className="text-[10px] text-center text-muted-foreground/50 py-10 font-semibold italic">
                                No images added yet.
                              </p>
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
                      className="py-2 px-3 h-auto border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-[11px] font-bold uppercase tracking-widest">
                        Selection Required
                      </AlertTitle>
                      <AlertDescription className="text-[10px] font-medium">
                        Please select a vehicle configuration from the list
                        below.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search templates (e.g. 'Vios', 'Automatic')..."
                        className="pl-8 h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none"
                        onChange={(e) => setSpecSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                    {loadingSpecs ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary h-5 w-5" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {specifications.map((spec: CarSpecificationType) => {
                          const isSelected =
                            form.watch("spec_id") === spec.spec_id;
                          return (
                            <div
                              key={spec.spec_id}
                              onClick={() =>
                                form.setValue("spec_id", spec.spec_id!, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                              className={cn(
                                "cursor-pointer rounded-xl p-3 transition-all flex flex-col gap-2.5 border",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                  : "bg-card border-border hover:border-primary/50",
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4
                                    className={cn(
                                      "font-bold text-[11px] leading-tight",
                                      isSelected
                                        ? "text-primary"
                                        : "text-foreground",
                                    )}
                                  >
                                    {spec.name}
                                  </h4>
                                  <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                                    {spec.body_type} • {spec.engine_type}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </div>
                              <div className="flex gap-1.5 text-[10px] flex-wrap pt-2 border-t border-border">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-secondary border border-border text-foreground rounded"
                                >
                                  {spec.transmission}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-secondary border border-border text-foreground rounded"
                                >
                                  {spec.fuel_type}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-secondary border border-border text-foreground rounded"
                                >
                                  {spec.passenger_capacity} Seats
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                        {specifications.length === 0 && (
                          <p className="col-span-full text-center text-muted-foreground py-4 text-[10px] font-semibold">
                            No specifications found.
                          </p>
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
                      className="py-2 px-3 h-auto border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-[10px] font-medium">
                        {form.formState.errors.features.message as string}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search features..."
                        className="pl-8 h-8 text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-primary rounded-lg shadow-none"
                        onChange={(e) => setFeatureSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
                    {loadingFeatures ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary h-5 w-5" />
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
                                "cursor-pointer flex items-start gap-2.5 p-3 rounded-xl transition-all border",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                  : "bg-card border-border hover:border-primary/50",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
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
                                    "text-[11px] font-bold leading-tight",
                                    isSelected
                                      ? "text-primary"
                                      : "text-foreground",
                                  )}
                                >
                                  {feat.name}
                                </p>
                                {feat.description && (
                                  <p className="text-[9px] font-medium text-muted-foreground line-clamp-1 mt-0.5">
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
            <DialogFooter className="px-5 py-3 border-t border-border bg-card shrink-0 flex items-center justify-end gap-2 transition-colors">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-[11px] font-semibold bg-card text-foreground border-border hover:bg-secondary rounded-lg shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving || !form.formState.isDirty}
                className="h-8 text-[11px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                {initialData ? "Save Changes" : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
