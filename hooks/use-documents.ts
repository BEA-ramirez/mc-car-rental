"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKYCDocuments,
  getPendingDocuments,
  getExpiringDocuments,
  getContracts,
  getInspections,
} from "@/actions/documents";
import { toast } from "sonner";
import {
  verifyDocumentAction,
  rejectDocumentAction,
  revokeDocumentAction,
  updateInternalNoteAction,
  deleteDocumentAction,
  getAllUsersForDropdown,
  getBookingsForDropdown,
  adminUploadDocumentAction,
  adminUpdateDocumentAction,
  saveContractSignature,
  upsertInspectionChecklist,
} from "@/actions/docs-mutations";
import { QUERY_KEYS } from "@/lib/query-keys"; // <-- NEW IMPORT

export function useKYCDocuments(page: number, search: string, filters: any) {
  return useQuery({
    queryKey: QUERY_KEYS.documents.kyc(page, search, filters), // <-- UPDATED
    queryFn: async () => {
      const response = await getKYCDocuments(page, search, filters);
      if (!response.success)
        throw new Error(response.message || "Failed to fetch KYC documents");
      return response;
    },
    placeholderData: (prev) => prev,
  });
}

export function usePendingDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.kycPending, // <-- UPDATED
    queryFn: async () => {
      const response = await getPendingDocuments();
      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch pending documents",
        );
      }
      return response.data;
    },
  });
}

export function useExpiringDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.kycExpiring, // <-- UPDATED
    queryFn: async () => {
      const response = await getExpiringDocuments();
      if (!response.success) {
        throw new Error(
          response.message || "Failed to fetch expiring documents in 30 days",
        );
      }
      return response.data;
    },
  });
}

export function useContracts() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.contracts, // <-- UPDATED
    queryFn: async () => {
      const response = await getContracts();
      if (!response.success)
        throw new Error(response.message || "Failed to fetch contracts");
      return response.data;
    },
  });
}

export function useInspections() {
  return useQuery({
    queryKey: QUERY_KEYS.documents.inspections, // <-- UPDATED
    queryFn: async () => {
      const response = await getInspections();
      if (!response.success)
        throw new Error(
          response.message || "Failed to fetch booking inspections",
        );
      return response.data;
    },
  });
}

export function useUpsertInspection() {
  const queryClient = useQueryClient();

  const upsertInspection = useMutation({
    mutationFn: async ({
      inspectionId,
      bookingId,
      type,
      payload,
    }: {
      inspectionId: string;
      bookingId: string;
      type: string;
      payload: any;
    }) => {
      const response = await upsertInspectionChecklist(
        inspectionId,
        bookingId,
        type,
        payload,
      );

      if (!response.success) {
        throw new Error("Failed to save inspection");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate everything related to bookings and inspections
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documents.inspections,
      });
      // Removed ghost ["inspections"] key
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.detailsBase,
      });
    },
    onError: (error) => {
      console.error("Inspection save error:", error);
      toast.error(error.message || "Failed to save inspection report.");
    },
  });

  return {
    saveInspection: upsertInspection.mutateAsync,
    isSaving: upsertInspection.isPending,
  };
}

export function useDocumentMutations() {
  const queryClient = useQueryClient();

  // --- THE MASTER RIPPLE INVALIDATOR ---
  // A document change impacts the User's Status, the Booking's readiness, and KPIs!
  const invalidateDocs = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.clients() }); // Admin Clients Table
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.profile }); // Customer's own profile
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary }); // Verification KPIs
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all }); // Admin & Customer Bookings
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.bookings.detailsBase,
    }); // Specific Booking Views
  };

  const verifyDoc = useMutation({
    mutationFn: async ({ id, expiry }: { id: string; expiry?: Date }) => {
      const result = await verifyDocumentAction(id, expiry);
      if (!result.success)
        throw new Error(result.message || "Failed to verify document.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Document verified successfully.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Verification failed: ${error.message}`),
  });

  const rejectDoc = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const result = await rejectDocumentAction(id, reason);
      if (!result.success)
        throw new Error(result.message || "Failed to reject document.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "Document rejected. Customer will be notified.",
      );
      invalidateDocs();
    },
    onError: (error) => toast.error(`Rejection failed: ${error.message}`),
  });

  const revokeDoc = useMutation({
    mutationFn: async (id: string) => {
      const result = await revokeDocumentAction(id);
      if (!result.success)
        throw new Error(result.message || "Failed to revoke document.");
      return result;
    },
    onSuccess: (data) => {
      toast.warning(data.message || "Document approval revoked.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Revocation failed: ${error.message}`),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const result = await updateInternalNoteAction(id, note);
      if (!result.success)
        throw new Error(result.message || "Failed to update internal note.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Internal note saved.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Failed to save note: ${error.message}`),
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDocumentAction(id);
      if (!result.success)
        throw new Error(result.message || "Failed to delete document.");
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateDocs();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadDoc = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await adminUploadDocumentAction(formData);
      if (!res.success)
        throw new Error(res.message || "Failed to upload document.");
      return res;
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "File uploaded and record created successfully.",
      );
      invalidateDocs();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateDoc = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await adminUpdateDocumentAction(formData);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      invalidateDocs();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const signContract = useMutation({
    mutationFn: async ({
      id,
      signatureDataUrl,
    }: {
      id: string;
      signatureDataUrl: string;
    }) => {
      const result = await saveContractSignature(id, signatureDataUrl);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Contract successfully executed!");
      invalidateDocs();
    },
    onError: (error) =>
      toast.error(`Failed to sign contract: ${error.message}`),
  });

  return {
    verifyDoc: verifyDoc.mutateAsync,
    rejectDoc: rejectDoc.mutateAsync,
    revokeDoc: revokeDoc.mutateAsync,
    updateNote: updateNote.mutateAsync,
    deleteDoc: deleteDoc.mutateAsync,
    uploadDoc: uploadDoc.mutateAsync,
    signContract: signContract.mutateAsync,
    updateDoc: updateDoc.mutateAsync,
    isPending:
      verifyDoc.isPending ||
      rejectDoc.isPending ||
      revokeDoc.isPending ||
      deleteDoc.isPending ||
      uploadDoc.isPending ||
      signContract.isPending ||
      updateDoc.isPending,
  };
}

export function useDropdownData() {
  const users = useQuery({
    queryKey: QUERY_KEYS.dropdowns.users, // <-- UPDATED
    queryFn: () => getAllUsersForDropdown(),
  });

  const bookings = useQuery({
    queryKey: QUERY_KEYS.dropdowns.bookings, // <-- UPDATED
    queryFn: () => getBookingsForDropdown(),
  });

  return { users, bookings };
}
