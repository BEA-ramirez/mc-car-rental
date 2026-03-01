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
} from "@/actions/docs-mutations";
import {
  getCustomersForDropdown,
  getBookingsForDropdown,
  adminUploadDocumentAction,
} from "@/actions/docs-mutations";

export function useKYCDocuments() {
  return useQuery({
    queryKey: ["documents", "kyc", "all"],
    queryFn: () => getKYCDocuments(),
  });
}

export function usePendingDocuments() {
  return useQuery({
    queryKey: ["documents", "kyc", "pending"],
    queryFn: () => getPendingDocuments(),
  });
}

// 3. Expiring Inbox
export function useExpiringDocuments() {
  return useQuery({
    queryKey: ["documents", "kyc", "expiring"],
    queryFn: () => getExpiringDocuments(),
  });
}

// 4. Contracts Table
export function useContracts() {
  return useQuery({
    queryKey: ["documents", "contracts"],
    queryFn: () => getContracts(),
  });
}

// 5. Inspections Table
export function useInspections() {
  return useQuery({
    queryKey: ["documents", "inspections"],
    queryFn: () => getInspections(),
  });
}

export function useDocumentMutations() {
  const queryClient = useQueryClient();

  // Helper to refresh all document-related tables on the screen
  const invalidateDocs = () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  };

  const verifyDoc = useMutation({
    mutationFn: ({ id, expiry }: { id: string; expiry?: Date }) =>
      verifyDocumentAction(id, expiry),
    onSuccess: () => {
      toast.success("Document verified successfully.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Verification failed: ${error.message}`),
  });

  const rejectDoc = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectDocumentAction(id, reason),
    onSuccess: () => {
      toast.success("Document rejected. Customer will be notified.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Rejection failed: ${error.message}`),
  });

  const revokeDoc = useMutation({
    mutationFn: (id: string) => revokeDocumentAction(id),
    onSuccess: () => {
      toast.warning("Document approval revoked.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Revocation failed: ${error.message}`),
  });

  const updateNote = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      updateInternalNoteAction(id, note),
    onSuccess: () => {
      toast.success("Internal note saved.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Failed to save note: ${error.message}`),
  });

  const deleteDoc = useMutation({
    mutationFn: ({ id, path }: { id: string; path?: string }) =>
      deleteDocumentAction(id, path),
    onSuccess: () => {
      toast.success("Document permanently deleted.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Deletion failed: ${error.message}`),
  });

  const uploadDoc = useMutation({
    mutationFn: (formData: FormData) => adminUploadDocumentAction(formData),
    onSuccess: () => {
      toast.success("File uploaded and record created successfully.");
      invalidateDocs();
    },
    onError: (error) => toast.error(`Upload failed: ${error.message}`),
  });

  return {
    verifyDoc,
    rejectDoc,
    revokeDoc,
    updateNote,
    deleteDoc,
    uploadDoc,
    isPending:
      verifyDoc.isPending ||
      rejectDoc.isPending ||
      revokeDoc.isPending ||
      deleteDoc.isPending ||
      uploadDoc.isPending,
  };
}

export function useDropdownData() {
  const customers = useQuery({
    queryKey: ["dropdown", "customers"],
    queryFn: () => getCustomersForDropdown(),
  });

  const bookings = useQuery({
    queryKey: ["dropdown", "bookings"],
    queryFn: () => getBookingsForDropdown(),
  });

  return { customers, bookings };
}
