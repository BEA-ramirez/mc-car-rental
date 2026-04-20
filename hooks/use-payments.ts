import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingPayments, verifyPayment } from "@/actions/payments";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export function usePendingPayments() {
  const queryClient = useQueryClient();

  const {
    data: payments = [], // Default to empty array
    isLoading,
    refetch: refresh,
  } = useQuery({
    queryKey: QUERY_KEYS.financials.pendingPayments,
    queryFn: async () => {
      const result = await getPendingPayments();
      if (!result.success) throw new Error("Failed to fetch pending payments");
      return result.data || [];
    },
  });

  const { mutateAsync: verifyMutation, isPending: isProcessing } = useMutation({
    mutationFn: async ({
      paymentId,
      action,
      reason,
      updatedAmount,
      updatedRef,
    }: {
      paymentId: string;
      action: "approve" | "reject";
      reason?: string;
      updatedAmount?: string | number;
      updatedRef?: string;
    }) => {
      // Pass the new override parameters down to the server action
      const result = await verifyPayment(
        paymentId,
        action,
        reason,
        updatedAmount,
        updatedRef,
      );

      if (!result.success) throw new Error(result.message);
      return { paymentId, result };
    },
    onSuccess: (data, variables) => {
      toast.success(data.result.message);

      // 1. Instant UI Update: Remove from the EXACT key used in useQuery
      queryClient.setQueryData(
        QUERY_KEYS.financials.pendingPayments,
        (oldData: any[]) =>
          oldData?.filter((p) => p.payment_id !== variables.paymentId) || [],
      );

      // Background Sync: Force React Query to re-fetch the other tabs
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.pendingPayments,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Wrapper function to keep the exact same API signature for your UI component
  const handleVerify = async (
    paymentId: string,
    action: "approve" | "reject",
    reason?: string,
    updatedAmount?: string | number,
    updatedRef?: string,
  ) => {
    await verifyMutation({
      paymentId,
      action,
      reason,
      updatedAmount,
      updatedRef,
    });
  };

  return {
    payments,
    isLoading,
    isProcessing,
    handleVerify,
    refresh,
  };
}
