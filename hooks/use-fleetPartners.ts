"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { deletePartner } from "@/actions/helper/delete-partner";
import { saveFleetPartnerApplication } from "@/actions/manage-partner";
import {
  getPendingFleetPartnersAction,
  verifyFleetPartnerAction,
  rejectFleetPartnerAction,
  getPartnerRevenueChartData,
  getPartnerCarUtilization,
  getPartnerFleetUnits,
  getPartnerPayoutHistory,
  getPartnerDocumentsAction,
  getPartnerAuditLogsAction,
} from "@/actions/manage-partner";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

const fetchFleetPartners = async (): Promise<FleetPartnerType[]> => {
  const response = await fetch("/api/fleet-partners");
  if (!response.ok) throw new Error("Failed to fetch fleet partners");

  const result = await response.json();
  return result.fleetPartners as FleetPartnerType[];
};

const fetchUnassignedCarOwners = async (): Promise<any[]> => {
  const response = await fetch("/api/fleet-partners/unassigned");
  if (!response.ok) throw new Error("Failed to fetch unassigned car owners");
  const result = await response.json();
  return result as any[];
};

export const useFleetPartners = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEYS.partners.all, // <-- UPDATED
    queryFn: fetchFleetPartners,
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      carOwnerId,
      userId,
    }: {
      carOwnerId: string;
      userId: string;
    }) => {
      const result = await deletePartner(carOwnerId, userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Fleet partner deleted successfully");

      // --- THE DELETE RIPPLES ---
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary }); // KPI Drops
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.clients() }); // Role resets
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.partners.unassigned,
      }); // Cars might be orphaned
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    deletePartner: deleteMutation.mutate,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.all }),
  };
};

export const useUnassignedCarOwners = () => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.unassigned, // <-- UPDATED
    queryFn: fetchUnassignedCarOwners,
    staleTime: 0, // Always fetch fresh data when opening the form
  });
};

export const useFleetPartnerApplication = () => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await saveFleetPartnerApplication(formData);
      if (!result.success) {
        throw new Error(result.message || "Failed to save application.");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully.");
      // FIXED: Hit the pending queue, not the main list!
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.pending });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    applyForFleetPartner: saveMutation.mutateAsync,
    isApplying: saveMutation.isPending,
  };
};

export const useFleetPartnerApplications = () => {
  const queryClient = useQueryClient();

  // Fetch Pending Queue
  const query = useQuery({
    queryKey: QUERY_KEYS.partners.pending, // <-- UPDATED
    queryFn: async () => {
      const result = await getPendingFleetPartnersAction();
      if (!result.success) throw new Error("Failed to fetch pending partners");
      return result.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Approve Partner
  const approveMutation = useMutation({
    mutationFn: async ({
      carOwnerId,
      userId,
    }: {
      carOwnerId: string;
      userId: string;
    }) => {
      const result = await verifyFleetPartnerAction(carOwnerId, userId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);

      // --- THE APPROVAL RIPPLES ---
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.pending });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary }); // KPI Goes Up
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.clients() }); // Role is elevated to Partner
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reject Partner
  const rejectMutation = useMutation({
    mutationFn: async ({
      carOwnerId,
      userId,
      reason,
    }: {
      carOwnerId: string;
      userId: string;
      reason: string;
    }) => {
      const result = await rejectFleetPartnerAction(carOwnerId, userId, reason);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.pending });
      // Minor ripple: just in case they were already somehow in the main list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.partners.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    pendingPartners: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    approvePartner: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectPartner: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
};

export const usePartnerRevenueChart = (
  ownerId: string | undefined,
  monthsBack: number = 6,
) => {
  return useQuery({
    // Needs a fallback empty string for TS if undefined
    queryKey: QUERY_KEYS.partners.revenue(ownerId || "", monthsBack),
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerRevenueChartData(ownerId, monthsBack);
    },
    enabled: !!ownerId,
  });
};

export const usePartnerCarUtilization = (
  ownerId: string | undefined,
  daysBack: number = 30,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.utilization(ownerId || "", daysBack), // <-- UPDATED
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerCarUtilization(ownerId, daysBack);
    },
    enabled: !!ownerId,
  });
};

export const usePartnerFleetUnits = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.fleetUnits(ownerId || ""), // <-- UPDATED
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerFleetUnits(ownerId);
    },
    enabled: !!ownerId,
  });
};

export const usePartnerPayoutHistory = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.payouts(ownerId || ""), // <-- UPDATED
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerPayoutHistory(ownerId);
    },
    enabled: !!ownerId,
  });
};

export const usePartnerDocuments = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.documents(ownerId || ""), // <-- UPDATED
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerDocumentsAction(ownerId);
    },
    enabled: !!ownerId,
  });
};

export const usePartnerAuditLogs = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.partners.auditLogs(ownerId || ""), // <-- UPDATED
    queryFn: async () => {
      if (!ownerId) return [];
      return await getPartnerAuditLogsAction(ownerId);
    },
    enabled: !!ownerId,
  });
};
