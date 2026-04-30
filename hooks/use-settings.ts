"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSystemSettings,
  savePaymentMethods,
  saveBookingFees,
  saveTaxSettings,
  saveBusinessHubs,
  saveVehicleTypes,
  saveCompanyProfile,
  saveServiceArea,
  saveInspectionTemplate,
  saveContractTemplate,
  type PaymentMethods,
  type BookingFees,
  type TaxSettings,
  type BusinessHub,
  type CompanyProfile,
  type MasterInspectionTemplate,
} from "@/actions/settings";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

// Expanded to fetch ALL settings for the entire dialog in one go
const ALL_SETTINGS_KEYS = [
  "booking_fees",
  "business_hubs",
  "tax_settings",
  "payment_methods",
  "vehicle_types",
  "company_profile",
  "service_area_boundary",
  "inspection_template",
  "contract_template",
];

export const useBookingSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: QUERY_KEYS.settings.booking,
    queryFn: async () => {
      const data = await getSystemSettings(ALL_SETTINGS_KEYS);
      return {
        fees: data.booking_fees || {},
        hubs: data.business_hubs || [],
        tax: data.tax_settings || {},
        payments: data.payment_methods || {},
        vehicleTypes: data.vehicle_types || [],
        companyProfile: data.company_profile || null,
        serviceArea: data.service_area_boundary || [],
        inspectionTemplate: data.inspection_template || [],
        contractTemplate: data.contract_template || "",
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  // --- HELPER TO INVALIDATE CACHE ---
  const invalidateSettings = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings.booking });
  };

  // --- MUTATIONS ---
  const savePaymentsMutation = useMutation({
    mutationFn: (methods: PaymentMethods) => savePaymentMethods(methods),
    onSuccess: () => {
      toast.success("Payment configurations saved successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save payment methods.");
    },
  });

  const saveFeesMutation = useMutation({
    mutationFn: (fees: BookingFees) => saveBookingFees(fees),
    onSuccess: () => {
      toast.success("Booking fees updated successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save booking fees.");
    },
  });

  const saveTaxMutation = useMutation({
    mutationFn: (tax: TaxSettings) => saveTaxSettings(tax),
    onSuccess: () => {
      toast.success("Tax settings updated successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save tax settings.");
    },
  });

  const saveHubsMutation = useMutation({
    mutationFn: (hubs: BusinessHub[]) => saveBusinessHubs(hubs),
    onSuccess: () => {
      toast.success("Business hubs saved successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save business hubs.");
    },
  });

  const saveVehicleTypesMutation = useMutation({
    mutationFn: (types: any) => saveVehicleTypes(types),
    onSuccess: () => {
      toast.success("Vehicle types updated successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save vehicle types.");
    },
  });

  const saveCompanyProfileMutation = useMutation({
    mutationFn: (profile: CompanyProfile) => saveCompanyProfile(profile),
    onSuccess: () => {
      toast.success("Company profile saved successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save company profile.");
    },
  });

  const saveServiceAreaMutation = useMutation({
    // Service Area action returns { error } instead of { success, message }, so we wrap it
    mutationFn: async (data: any) => {
      const res = await saveServiceArea(data);
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Service area boundaries updated!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save service area.");
    },
  });

  const saveInspectionMutation = useMutation({
    mutationFn: (template: MasterInspectionTemplate) =>
      saveInspectionTemplate(template),
    onSuccess: () => {
      toast.success("Inspection template saved successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save inspection template.");
    },
  });

  const saveContractMutation = useMutation({
    mutationFn: (content: string) => saveContractTemplate(content),
    onSuccess: () => {
      toast.success("Contract template saved successfully!");
      invalidateSettings();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save contract template.");
    },
  });

  return {
    data: settingsQuery.data,
    isLoading: settingsQuery.isLoading || settingsQuery.isFetching,

    // Export mutation tools
    savePaymentMethods: savePaymentsMutation.mutateAsync,
    isSavingPayments: savePaymentsMutation.isPending,

    saveBookingFees: saveFeesMutation.mutateAsync,
    isSavingFees: saveFeesMutation.isPending,

    saveTaxSettings: saveTaxMutation.mutateAsync,
    isSavingTax: saveTaxMutation.isPending,

    saveBusinessHubs: saveHubsMutation.mutateAsync,
    isSavingHubs: saveHubsMutation.isPending,

    saveVehicleTypes: saveVehicleTypesMutation.mutateAsync,
    isSavingVehicleTypes: saveVehicleTypesMutation.isPending,

    saveCompanyProfile: saveCompanyProfileMutation.mutateAsync,
    isSavingCompanyProfile: saveCompanyProfileMutation.isPending,

    saveServiceArea: saveServiceAreaMutation.mutateAsync,
    isSavingServiceArea: saveServiceAreaMutation.isPending,

    saveInspectionTemplate: saveInspectionMutation.mutateAsync,
    isSavingInspectionTemplate: saveInspectionMutation.isPending,

    saveContractTemplate: saveContractMutation.mutateAsync,
    isSavingContractTemplate: saveContractMutation.isPending,
  };
};
