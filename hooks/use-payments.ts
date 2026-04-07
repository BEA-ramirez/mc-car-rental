import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingPayments, verifyPayment } from "@/actions/payments";
import { toast } from "sonner";

export function usePendingPayments() {
  const queryClient = useQueryClient();

  const {
    data: payments = [], // Default to empty array
    isLoading,
    refetch: refresh,
  } = useQuery({
    queryKey: ["pendingPayments"],
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

      // Instant UI Update: Remove the verified payment from the cache directly
      queryClient.setQueryData(["pendingPayments"], (oldData: any[]) => {
        if (!oldData) return [];
        return oldData.filter((p) => p.payment_id !== variables.paymentId);
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
    updatedAmount?: string | number, // <-- NEW
    updatedRef?: string, // <-- NEW
  ) => {
    // mutateAsync allows us to await it if needed by the caller,
    // though the onSuccess/onError callbacks above handle the UI feedback.
    await verifyMutation({
      paymentId,
      action,
      reason,
      updatedAmount, // <-- Pass it through
      updatedRef, // <-- Pass it through
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
