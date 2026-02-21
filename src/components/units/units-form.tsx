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
  PlusCircle,
  Trash2,
  Star,
  UploadCloud,
  Search,
  Settings2,
  Settings,
  Users,
  Fuel,
  Car,
  Tag,
  Check,
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
  initialData?: CompleteCarType | null;
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

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({
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
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-lg bg-white shadow-xl border-slate-200">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CarFront className="w-4 h-4 text-slate-500" />
            {initialData ? "Edit Unit Details" : "Add New Unit"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
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
              <div className="px-5 py-3 border-b border-slate-100 bg-white shrink-0">
                <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex">
                  <TabsTrigger
                    value="identity"
                    className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
                  >
                    <IdCard className="w-3.5 h-3.5" /> Identity & Pricing
                  </TabsTrigger>
                  <TabsTrigger
                    value="config"
                    className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Features
                    <span className="ml-1 bg-slate-200 text-slate-600 text-[9px] px-1.5 py-0 rounded-full font-bold">
                      {form.watch("features")?.length || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                {/* --- TAB 1: IDENTITY & PRICING --- */}
                <TabsContent
                  value="identity"
                  className="m-0 h-full outline-none"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: DETAILS */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="plate_number"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Plate Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="ABC-1234"
                                  className="h-8 text-xs bg-white border-slate-200 uppercase"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value.toUpperCase())
                                  }
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rental_rate_per_day"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Daily Rate (₱)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="2500"
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      form.setValue(
                                        "rental_rate_per_day",
                                        value,
                                      );
                                    } else if (e.target.value === "") {
                                      form.setValue("rental_rate_per_day", "");
                                    }
                                  }}
                                  value={(field.value as number) || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
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
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Brand
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Toyota"
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Model
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Vios"
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Year Model
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);

                                    if (!isNaN(value)) {
                                      form.setValue("year", value);
                                    } else if (e.target.value === "") {
                                      form.setValue("year", "");
                                    }
                                  }}
                                  value={(field.value as number) || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Color
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Red Mica"
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="car_owner_id"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Owner / Partner
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                                    <SelectValue placeholder="Select owner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-md border-slate-200">
                                  {fleetPartners?.map(
                                    (partner: FleetPartnerType) => (
                                      <SelectItem
                                        key={partner.car_owner_id}
                                        value={partner.car_owner_id}
                                        className="text-xs"
                                      >
                                        {partner.business_name ||
                                          partner.users.full_name}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="availability_status"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Status
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-md border-slate-200">
                                  <SelectItem
                                    value="Available"
                                    className="text-xs"
                                  >
                                    🟢 Available
                                  </SelectItem>
                                  <SelectItem
                                    value="Rented"
                                    className="text-xs"
                                  >
                                    🔵 Rented
                                  </SelectItem>
                                  <SelectItem
                                    value="Maintenance"
                                    className="text-xs"
                                  >
                                    🟠 Maintenance
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                VIN (Serial Number)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1HGCM82633A..."
                                  maxLength={17}
                                  className="h-8 text-xs bg-white border-slate-200 uppercase"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value.toUpperCase())
                                  }
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="current_mileage"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Current Mileage (km)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  className="h-8 text-xs bg-white border-slate-200"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);

                                    if (!isNaN(value)) {
                                      form.setValue("current_mileage", value);
                                    } else if (e.target.value === "") {
                                      form.setValue("current_mileage", "");
                                    }
                                  }}
                                  value={(field.value as number) || ""}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* RIGHT COLUMN: IMAGES */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Unit Images
                        </FormLabel>
                        <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-1.5 rounded">
                          {form.watch("images")?.length || 0} / 5
                        </span>
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
                        className="border border-dashed border-slate-300 rounded-md h-24 flex flex-col items-center justify-center bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                        onClick={triggerFileDialog}
                      >
                        <UploadCloud className="h-5 w-5 text-slate-400 mb-1.5" />
                        <p className="text-[10px] text-slate-500 font-medium">
                          Click to upload images
                        </p>
                      </div>

                      {/* Image List */}
                      <div className="flex-1 overflow-y-auto w-full bg-white rounded-md border border-slate-200 p-1.5 min-h-[150px]">
                        <div className="space-y-1.5">
                          {(form.watch("images") || []).map((img, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-1.5 border border-slate-100 rounded bg-slate-50 group"
                            >
                              <img
                                src={img.image_url}
                                alt="Unit"
                                className="h-10 w-14 object-cover rounded shadow-sm border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-slate-700 truncate">
                                  image_{index + 1}.jpg
                                </p>
                                {img.is_primary && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[8px] uppercase tracking-widest h-3.5 px-1 bg-blue-100 text-blue-700 border-none mt-0.5"
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
                                  className="h-6 w-6 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded"
                                  title="Set Primary"
                                  onClick={() => {
                                    const updated = form
                                      .getValues("images")
                                      ?.map((item, i) => ({
                                        ...item,
                                        is_primary: i === index,
                                      }));
                                    form.setValue("images", updated);
                                  }}
                                >
                                  <Star
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      img.is_primary
                                        ? "fill-yellow-400 text-yellow-500"
                                        : "",
                                    )}
                                  />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  onClick={() => {
                                    const filtered = form
                                      .getValues("images")
                                      ?.filter((_, i) => i !== index);
                                    form.setValue("images", filtered);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {form.watch("images")?.length === 0 && (
                            <p className="text-[10px] text-center text-slate-400 py-10 font-medium italic">
                              No images added yet.
                            </p>
                          )}
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
                    <Alert variant="destructive" className="py-2 px-3 h-auto">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-xs">
                        Selection Required
                      </AlertTitle>
                      <AlertDescription className="text-[10px]">
                        Please select a vehicle configuration from the list
                        below.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search templates (e.g. 'Vios', 'Automatic')..."
                        className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-1"
                        onChange={(e) => setSpecSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4">
                    {loadingSpecs ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-slate-400 h-5 w-5" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {specifications.map((spec: CarSpecificationType) => {
                          const isSelected =
                            form.watch("spec_id") === spec.spec_id;
                          return (
                            <div
                              key={spec.spec_id}
                              onClick={() =>
                                form.setValue("spec_id", spec.spec_id!)
                              }
                              className={cn(
                                "cursor-pointer border rounded-md p-3 transition-all flex flex-col gap-2",
                                isSelected
                                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                                  : "bg-white border-slate-200 hover:border-slate-300",
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4
                                    className={cn(
                                      "font-bold text-xs leading-tight",
                                      isSelected
                                        ? "text-blue-900"
                                        : "text-slate-800",
                                    )}
                                  >
                                    {spec.name}
                                  </h4>
                                  <p className="text-[9px] text-slate-500 mt-0.5">
                                    {spec.body_type} • {spec.engine_type}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                                )}
                              </div>
                              <div className="flex gap-1.5 text-[10px] text-muted-foreground flex-wrap pt-1 border-t border-slate-100">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-white border border-slate-200 text-slate-600"
                                >
                                  {spec.transmission}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-white border border-slate-200 text-slate-600"
                                >
                                  {spec.fuel_type}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 px-1.5 bg-white border border-slate-200 text-slate-600"
                                >
                                  {spec.passenger_capacity} Seats
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                        {specifications.length === 0 && (
                          <p className="col-span-full text-center text-slate-400 py-4 text-xs">
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
                    <Alert variant="destructive" className="py-2 px-3 h-auto">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-[10px]">
                        {form.formState.errors.features.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search features..."
                        className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-1"
                        onChange={(e) => setFeatureSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pb-4">
                    {loadingFeatures ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-slate-400 h-5 w-5" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {features.map((feat: FeatureType) => {
                          const currentFeats = form.watch("features") || [];
                          const isSelected = currentFeats.some(
                            (f) => f.feature_id === feat.feature_id,
                          );

                          return (
                            <div
                              key={feat.feature_id}
                              onClick={() => {
                                if (isSelected) {
                                  form.setValue(
                                    "features",
                                    currentFeats.filter(
                                      (f) => f.feature_id !== feat.feature_id,
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
                                        description: feat.description,
                                        is_archived: feat.is_archived,
                                        last_updated_at: null,
                                      },
                                    ],
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                }
                              }}
                              className={cn(
                                "cursor-pointer flex items-start gap-2.5 p-2.5 border rounded-md transition-all",
                                isSelected
                                  ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                                  : "bg-white border-slate-200 hover:border-slate-300",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-slate-300 bg-slate-50",
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <div className="flex flex-col">
                                <p
                                  className={cn(
                                    "text-xs font-bold leading-tight",
                                    isSelected
                                      ? "text-blue-900"
                                      : "text-slate-800",
                                  )}
                                >
                                  {feat.name}
                                </p>
                                {feat.description && (
                                  <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
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
            <DialogFooter className="px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
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
