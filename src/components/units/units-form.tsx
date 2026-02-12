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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // 👈 Import Tabs
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
} from "lucide-react"; // Icons for tabs
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

        //transform generic upload to car schema
        const newImageObjects = newFiles.map((file, index) => ({
          image_url: file.url,
          storage_path: file.path,
          is_primary: currentImages.length === 0 && index === 0,
          is_archived: false,
        }));

        // update form statement
        form.setValue("images", [...currentImages, ...newImageObjects], {
          shouldDirty: true,
        });
      },
    });

  // 1. Setup Form
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

  // 2. Reset on Open
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

  // 3. Submit Handler
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
      <DialogContent className="max-w-3xl! h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>
            {initialData ? "Edit Unit Details" : "Add New Unit"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log("🟢 Form Submit Attempted");

              // 2. We pass two functions: one for Success, one for Error
              form.handleSubmit(
                (data) => {
                  console.log("✅ SUCCESS! Form is valid. Data:", data);
                  onSubmit(data); // Run your actual logic
                },
                (errors) => {
                  console.log("❌ FAILURE! Validation Errors:", errors);
                  // This will pop up a browser alert so you can't miss it
                  alert("Form Error: " + JSON.stringify(errors, null, 2));
                },
              )(e);
            }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* 4. TABS COMPONENT */}
            <Tabs
              defaultValue="config"
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Tab Navigation Header */}
              <div className="px-6 py-2 border-b bg-muted/30 shrink-0">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger
                    value="config"
                    className="flex items-center gap-2"
                  >
                    <CarFront className="w-4 h-4" />
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger
                    value="identity"
                    className="flex items-center gap-2"
                  >
                    <IdCard className="w-4 h-4" />
                    Identity
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Features
                    {/* Optional: Show count badge */}
                    <span className="ml-1 bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                      {form.watch("features")?.length || 0}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents (Scrollable Area) */}
              <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                <TabsContent
                  value="config"
                  className="m-0 h-full flex flex-col gap-4"
                >
                  {form.formState.errors.spec_id && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Selection Required</AlertTitle>
                      <AlertDescription>
                        Please select a vehicle configuration from the list
                        below.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search specs (e.g. 'Vios', 'Automatic')..."
                        className="pl-9"
                        // 👇 CONNECTED: Updates the search query in the hook
                        onChange={(e) => setSpecSearch(e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="outline" className="gap-2">
                      <PlusCircle className="h-4 w-4" /> New Spec
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 -mx-6 px-6">
                    {/* 👇 LOADING STATE */}
                    {loadingSpecs ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {/* 👇 REAL DATA MAPPING */}
                        {specifications.map((spec: CarSpecificationType) => (
                          <div
                            key={spec.spec_id}
                            onClick={() => {
                              // Set the ID
                              form.setValue("spec_id", spec.spec_id!);
                              // Optional: You can auto-fill other fields here if you want
                              // form.setValue("brand", spec.name.split(' ')[0])
                            }}
                            className={cn(
                              "cursor-pointer border rounded-lg p-3 transition-all hover:border-primary",
                              form.watch("spec_id") === spec.spec_id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "bg-card",
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {spec.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {spec.body_type} • {spec.engine_type}
                                </p>
                              </div>
                              {form.watch("spec_id") === spec.spec_id && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                            </div>

                            <div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5"
                              >
                                {spec.transmission}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5"
                              >
                                {spec.fuel_type}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-5"
                              >
                                {spec.passenger_capacity} Seats
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {specifications.length === 0 && (
                          <p className="col-span-full text-center text-muted-foreground py-4 text-sm">
                            No specifications found.
                          </p>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* --- TAB 2: IDENTITY --- */}
                <TabsContent
                  value="identity"
                  className="m-0 h-full overflow-y-auto pr-2"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* --- LEFT COLUMN: DETAILS FORM (7 cols) --- */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Plate & Rate Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="plate_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plate Number</FormLabel>
                              <FormControl>
                                <Input placeholder="ABC-1234" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="rental_rate_per_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Rate (₱)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="2500"
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Brand & Model Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Input placeholder="Toyota" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <FormControl>
                                <Input placeholder="Vios" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Year & Color Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Model</FormLabel>
                              <FormControl>
                                <Input
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <FormControl>
                                <Input placeholder="Red Mica" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Owner & Status Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="car_owner_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select owner" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                  {fleetPartners?.map(
                                    (partner: FleetPartnerType) => (
                                      <SelectItem
                                        key={partner.car_owner_id}
                                        value={partner.car_owner_id}
                                      >
                                        {partner.business_name ||
                                          partner.users.full_name}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="availability_status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Available">
                                    🟢 Available
                                  </SelectItem>
                                  <SelectItem value="Rented">
                                    🔵 Rented
                                  </SelectItem>
                                  <SelectItem value="Maintenance">
                                    🟠 Maintenance
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* --- VIN & Mileage Row --- */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* VIN Field */}
                        <FormField
                          control={form.control}
                          name="vin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                VIN (Vehicle Identification Number)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1HGCM82633A..."
                                  maxLength={17} // Standard VIN length
                                  {...field}
                                  // UX TWEAK: Auto-capitalize input because VINs are always uppercase
                                  onChange={(e) =>
                                    field.onChange(e.target.value.toUpperCase())
                                  }
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Current Mileage Field (Optional, but good to pair with VIN) */}
                        <FormField
                          control={form.control}
                          name="current_mileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Mileage (km)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  // Use the safe number conversion pattern we learned
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* --- RIGHT COLUMN: IMAGES (5 cols) --- */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <FormLabel>Unit Images</FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {form.watch("images")?.length || 0} / 5
                        </span>
                      </div>

                      {/* 1. Upload Box */}
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
                        className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                        onClick={triggerFileDialog}
                      >
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Click to upload
                        </p>
                      </div>

                      {/* 2. Image List */}
                      <ScrollArea className="h-70 w-full rounded-md border p-2">
                        <div className="space-y-2">
                          {(form.watch("images") || []).map((img, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-2 border rounded-md bg-card group"
                            >
                              {/* Thumbnail */}
                              <img
                                src={img.image_url}
                                alt="Unit"
                                className="h-12 w-16 object-cover rounded-sm bg-muted"
                              />

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  image_{index + 1}.jpg
                                </p>
                                {img.is_primary && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-4 px-1"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  title="Set as Primary"
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
                                      "h-4 w-4",
                                      img.is_primary
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    const filtered = form
                                      .getValues("images")
                                      ?.filter((_, i) => i !== index);
                                    form.setValue("images", filtered);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {form.watch("images")?.length === 0 && (
                            <p className="text-xs text-center text-muted-foreground py-8">
                              No images added yet.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                {/* --- TAB 3: FEATURES --- */}
                <TabsContent
                  value="features"
                  className="m-0 h-full flex flex-col gap-4"
                >
                  {form.formState.errors.features && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {form.formState.errors.features.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search features..."
                        className="pl-9"
                        onChange={(e) => setFeatureSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      Manage Features
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 -mx-6 px-6">
                    {loadingFeatures ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* MOCK FEATURE DATA */}
                        {features.map((feat: FeatureType, i) => {
                          // check if this feature is inside the selected array
                          const isSelected = form
                            .watch("features")
                            ?.some((f) => f.feature_id === feat.feature_id);

                          return (
                            <div
                              key={feat.feature_id || i}
                              onClick={() => {
                                const current =
                                  form.getValues("features") || [];
                                if (isSelected) {
                                  // Remove, filter out by id
                                  form.setValue(
                                    "features",
                                    current.filter(
                                      (f) => f.feature_id !== feat.feature_id,
                                      {
                                        shouldDirth: true,
                                        shouldValidate: true,
                                      },
                                    ),
                                  );
                                } else {
                                  const cleanFeature = {
                                    feature_id: feat.feature_id,
                                    name: feat.name,
                                    description: feat.description,
                                    is_archived: feat.is_archived,
                                    last_updated_at: null,
                                  };

                                  // Add, push the whole object
                                  form.setValue(
                                    "features",
                                    [...current, cleanFeature],
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                }
                              }}
                              className={cn(
                                "cursor-pointer flex items-start gap-3 p-3 border rounded-lg transition-all",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-foreground/20",
                              )}
                            >
                              <div
                                className={cn(
                                  "h-5 w-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground",
                                )}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <div>
                                <p
                                  className={cn(
                                    "text-sm font-medium",
                                    isSelected && "text-primary",
                                  )}
                                >
                                  {feat.name}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  Adds navigation capabilities to the unit.
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>

            {/* Footer is strictly for Actions */}
            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Save Changes" : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
