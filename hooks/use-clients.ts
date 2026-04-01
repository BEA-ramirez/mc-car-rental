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
    // Adding params to the queryKey forces a refetch when a parameter changes!
    queryKey: ["clients", params],
    queryFn: () => fetchClients(params!),
    enabled: !!params, // Don't run the query until we have params
    placeholderData: keepPreviousData, // Keeps old data on screen while fetching the next page
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const isUpdate = formData.has("user_id");
      let result;
      if (isUpdate) {
        result = await updateClientAction({ message: null }, formData);
      } else {
        result = await createClientAction({ message: null }, formData);
      }
      if (!result.success)
        throw new Error(result.message || "Failed to save client.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Client saved successfully.");
      // Invalidate the base key so ALL paginated views refresh
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser(userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await bulkDeleteUsers(userIds);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: () => {
      const toastId = toast.loading("Deleting clients...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      toast.success(data.message, { id: context?.toastId });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
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
      if (!result.success) {
        throw new Error(result.message || "Failed to verify applicant.");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Applicant verified successfully.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
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
      if (!result.success) {
        throw new Error(result.message || "Failed to reject applicant.");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Applicant rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sendCustomEmailMutation = useMutation({
    mutationFn: async ({ userId, subject, body }: SendCustomEmailPayload) => {
      const result = await sendCustomEmailAction(userId, subject, body);
      if (!result.success) {
        throw new Error(result.message || "Failed to send custom email.");
      }
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
    queryKey: ["clients-kpi"],
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
