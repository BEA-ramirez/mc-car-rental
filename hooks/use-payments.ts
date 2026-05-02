import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingPayments, verifyPayment } from "@/actions/payments";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export function usePendingPayments() {
  const queryClient = useQueryClient();

  const {
    data: payments = [],
    isLoading,
    refetch: refresh,
  } = useQuery({
    queryKey: QUERY_KEYS.financials.pendingPayments,
    queryFn: async () => {
      const result = await getPendingPayments();
      if (!result.success) throw new Error("Failed to fetch pending payments");
      return result.data || [];
    },
    // FIX 1: Polling. This forces the admin dashboard to check for new
    // pending payments every 10 seconds automatically.
    // Now, if you are just "waiting", new payments will magically pop up!
    refetchInterval: 10000,
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

      // 1. Instant UI Update: Remove from the exact key
      queryClient.setQueryData(
        QUERY_KEYS.financials.pendingPayments,
        (oldData: any[]) =>
          oldData?.filter((p) => p.payment_id !== variables.paymentId) || [],
      );

      // 2. Background Sync
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.pendingPayments,
      });

      // FIX 2: Explicitly invalidate the scheduler!
      // Because your QUERY_KEYS.bookings.scheduler is a function, we must invoke it `()`
      // without arguments to invalidate all scheduler months.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.scheduler(),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
