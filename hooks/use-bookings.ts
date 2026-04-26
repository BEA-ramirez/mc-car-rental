"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { CompleteBookingType, AdminBookingInput } from "@/lib/schemas/booking";
import {
  createAdminBooking,
  deleteBooking,
  updateBookingStatus,
  updateAdminBooking,
  createCustomerBooking,
  getCustomerBookings,
  submitPaymentReceipt,
  getCarUnavailableDatesAction,
  checkDriverAvailabilityAction,
  getBookingDetailsAction,
  cancelBookingAction,
  updateBookingNoteAction,
} from "@/actions/bookings";
import { QUERY_KEYS } from "@/lib/query-keys";

const fetchBookingsList = async (
  page: number,
  limit: number,
  status: string,
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status: status,
  });
  const res = await fetch(`/api/bookings?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return (await res.json()) as CompleteBookingType[];
};

export const useBookings = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterStatus, setFilterStatus] = useState("All");

  const query = useQuery({
    queryKey: QUERY_KEYS.bookings.list(page, limit, filterStatus),
    queryFn: () => fetchBookingsList(page, limit, filterStatus),
    placeholderData: keepPreviousData,
  });

  // --- THE MASTER BOOKING INVALIDATOR ---
  const invalidateBookingRipples: any = (
    affectsFinancials = false,
    id?: string,
  ) => {
    // 1. Sync all Booking Tables & Dashboards
    queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.summary });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.dashboard.recentBookings,
    });
    if (id) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bookings.details(id),
      });
    }

    // 2. Sync Car Details (Because active bookings are listed inside the car profile)
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.detailBase });

    // 3. Sync Dropdowns
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dropdowns.bookings });

    // 4. Sync Financials (If a booking was cancelled with a refund/forfeit)
    if (affectsFinancials) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.masterLedger,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.incomesDashboard,
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: AdminBookingInput) => {
      const res = await createAdminBooking(data);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: (data) => {
      invalidateBookingRipples();
      toast.success(data.message);
    },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await updateBookingStatus(id, status);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: () => {
      invalidateBookingRipples();
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteBooking(id);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: () => {
      invalidateBookingRipples();
      toast.success("Booking archived");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AdminBookingInput;
    }) => {
      const res = await updateAdminBooking(id, data);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: () => {
      invalidateBookingRipples();
      toast.success("Booking updated successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const customerCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await createCustomerBooking(data);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.pendingPayments,
      });
      invalidateBookingRipples();
      toast.success("Booking created successfully!");
    },
    onError: (err) => toast.error(err.message),
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ bookingId, amount, ref, url }: any) => {
      const res = await submitPaymentReceipt(bookingId, amount, ref, url);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: () => {
      // Instantly sync the admin verification queue!
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.financials.pendingPayments,
      });
      toast.success("Payment submitted successfully!");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
      refundAction,
      amountPaid,
      refundMethod,
    }: any) =>
      cancelBookingAction(
        bookingId,
        reason,
        refundAction,
        amountPaid,
        refundMethod,
      ),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Pass true because cancellations move money (refunds/forfeits)
        invalidateBookingRipples(true, variables.bookingId);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ bookingId, note }: { bookingId: string; note: string }) =>
      updateBookingNoteAction(bookingId, note),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
  });

  return {
    bookings: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    page,
    setPage,
    limit,
    setLimit,
    filterStatus,
    setFilterStatus,
    createBooking: createMutation.mutate,
    updateStatus: statusMutation.mutateAsync,
    deleteBooking: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: statusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    updateBooking: updateMutation.mutateAsync,
    isBookingUpdating: updateMutation.isPending,
    submitCustomerBooking: customerCreateMutation.mutateAsync,
    isSubmittingCustomerBooking: customerCreateMutation.isPending,
    submitPayment: paymentMutation.mutateAsync,
    isSubmittingPayment: paymentMutation.isPending,
    cancelBooking: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    updateNote: updateNoteMutation.mutateAsync,
    isUpdatingNote: updateNoteMutation.isPending,
  };
};

export const useCustomerBookings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.customerList,
    queryFn: async () => {
      const res = await getCustomerBookings();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
};

export const useCarUnavailableDates = (carId: string | undefined) => {
  return useQuery({
    // Needs a fallback empty string if carId is undefined for TS
    queryKey: QUERY_KEYS.fleet.unavailableDates(carId || ""),
    queryFn: async () => {
      if (!carId) return [];
      return await getCarUnavailableDatesAction(carId);
    },
    enabled: !!carId,
    staleTime: 30 * 1000,
  });
};

export const useAvailableDrivers = (
  startDate: Date | null,
  endDate: Date | null,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.drivers.availability(
      startDate?.toISOString(),
      endDate?.toISOString(),
    ),
    queryFn: async () => {
      if (!startDate || !endDate) return false;
      return await checkDriverAvailabilityAction(
        startDate.toISOString(),
        endDate.toISOString(),
      );
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 1000,
  });
};

export const useBookingDetails = (bookingId: string | null | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.details(bookingId || ""),
    queryFn: async () => {
      try {
        const res = await getBookingDetailsAction(bookingId!);

        // This triggers if the try-catch in the server action caught an RLS/DB error
        if (!res.success) {
          throw new Error(
            res.message || "Unknown error fetching booking details.",
          );
        }

        return res.data;
      } catch (error: any) {
        console.error("Hook Error:", error);
        // Re-throw so TanStack Query knows it failed
        throw error;
      }
    },
    enabled: !!bookingId,
    // Optional: add retry logic to prevent immediate failures on flaky connections
    retry: 1,
  });
};
