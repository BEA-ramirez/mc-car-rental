"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Tables } from "@/types/database.types";
import { deleteUser, bulkDeleteUsers } from "@/actions/helper/delete-user";
import { toast } from "sonner";
import {
  createClientAction,
  updateClientAction,
  verifyApplicantAction,
  rejectApplicantAction,
  sendCustomEmailAction,
  getClientsKpiAction,
} from "@/actions/manage-user";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

export type ClientRow = Tables<"users">;

export interface KpiData {
  total_users: number;
  pending_id: number;
  active_rentals: number;
  fleet_partners: number;
  active_drivers: number;
}

export interface FetchClientsParams {
  page: number;
  limit: number;
  search: string;
  statusFilter: string[];
  roleFilter: string[];
}

export interface FetchClientsResponse {
  users: ClientRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface VerifyPayload {
  userId: string;
  licenseExpiry: string;
  validIdExpiry: string;
}

interface RejectPayload {
  userId: string;
  reason: string;
  rejectLicense: boolean;
  rejectValidId: boolean;
}

interface SendCustomEmailPayload {
  userId: string;
  subject: string;
  body: string;
}

const fetchClients = async (
  params: FetchClientsParams,
): Promise<FetchClientsResponse> => {
  const urlParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search,
  });

  if (params.statusFilter.length > 0) {
    urlParams.append("status", params.statusFilter.join(","));
  }

  if (params.roleFilter.length > 0) {
    urlParams.append("role", params.roleFilter.join(","));
  }

  const response = await fetch(`/api/clients?${urlParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  return await response.json();
};

export const useClients = (params: FetchClientsParams | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.users.clients(params), // <-- UPDATED
    queryFn: () => fetchClients(params!),
    enabled: !!params,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  // --- THE MASTER CLIENT INVALIDATOR ---
  const invalidateClientRipples = (affectsDocumentsAndDropdowns = false) => {
    // 1. Sync User Tables and local KPIs
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.clients() }); // Fuzzy match hits all pages/filters
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.clientsKpi });

    // 2. Sync the Main Dashboard (Total Users & Verification KPIs)
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });

    // 3. Sync connected features if a user was created, deleted, verified, or rejected
    if (affectsDocumentsAndDropdowns) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all }); // Refreshes KYC queues
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dropdowns.users }); // Refreshes Select combo-boxes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.profile }); // Refreshes customer's personal view
    }
  };

  // FORM ACTION: Returns the raw ActionState for the component to handle Zod errors
  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const isUpdate =
        formData.has("user_id") && formData.get("user_id") !== "";

      if (isUpdate) {
        return await updateClientAction({ message: null }, formData);
      } else {
        return await createClientAction({ message: null }, formData);
      }
      // DO NOT THROW HERE. Let the component receive the Zod errors!
    },
    onSuccess: (result) => {
      // Only toast and invalidate if it actually passed validation and saved
      if (result.success) {
        toast.success(result.message || "Client saved successfully.");
        invalidateClientRipples(true); // true = refreshes dropdowns so new user appears!
      }
    },
    onError: (error: Error) => {
      // This only catches critical network/server crashes now
      toast.error("A critical error occurred while saving.");
    },
  });

  // NORMAL ACTION: Throws error to trigger generic toast
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser(userId);
      if (!result.success)
        throw new Error(result.message || "Failed to delete.");
      return result;
    },
    onSuccess: () => {
      toast.success("Client deleted successfully");
      invalidateClientRipples(true); // true = clears them from dropdowns & docs
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await bulkDeleteUsers(userIds);
      if (!result.success)
        throw new Error(result.message || "Failed to delete clients.");
      return result;
    },
    onMutate: () => {
      const toastId = toast.loading("Deleting clients...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      toast.success(data.message, { id: context?.toastId });
      invalidateClientRipples(true);
    },
    onError: (error: Error, variables, context) => {
      toast.error(error.message, { id: context?.toastId });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      userId,
      licenseExpiry,
      validIdExpiry,
    }: VerifyPayload) => {
      const result = await verifyApplicantAction(
        userId,
        licenseExpiry,
        validIdExpiry,
      );
      if (!result.success)
        throw new Error(result.message || "Failed to verify applicant.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Applicant verified successfully.");
      invalidateClientRipples(true); // true = refreshes document queues to remove the pending items
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      userId,
      reason,
      rejectLicense,
      rejectValidId,
    }: RejectPayload) => {
      const result = await rejectApplicantAction(
        userId,
        reason,
        rejectLicense,
        rejectValidId,
      );
      if (!result.success)
        throw new Error(result.message || "Failed to reject applicant.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Applicant rejected successfully.");
      invalidateClientRipples(true);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendCustomEmailMutation = useMutation({
    mutationFn: async ({ userId, subject, body }: SendCustomEmailPayload) => {
      const result = await sendCustomEmailAction(userId, subject, body);
      if (!result.success)
        throw new Error(result.message || "Failed to send custom email.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Custom email sent successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    data: query.data?.users || [],
    totalCount: query.data?.totalCount || 0,
    totalPages: query.data?.totalPages || 1,

    saveClient: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteClient: deleteMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
    verifyApplicant: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    rejectApplicant: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    sendCustomEmail: sendCustomEmailMutation.mutateAsync,
    isSendingCustomEmail: sendCustomEmailMutation.isPending,
  };
};

export const useClientsKpi = () => {
  return useQuery({
    queryKey: QUERY_KEYS.users.clientsKpi, // <-- UPDATED
    queryFn: async () => {
      const result = await getClientsKpiAction();
      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to fetch KPIs");
      }
      return result.data as KpiData;
    },
    staleTime: 5 * 60 * 1000,
  });
};
