"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCustomerProfile,
  updateCustomerDetails,
  uploadCustomerDocument,
} from "@/actions/profile";

export const useProfile = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["customer-profile"],
    queryFn: async () => await getCustomerProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await updateCustomerDetails(data);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await uploadCustomerDocument(data);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    uploadDocument: uploadMutation.mutateAsync,
    isUploadingDoc: uploadMutation.isPending,
  };
};
