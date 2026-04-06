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
} from "@/actions/bookings"; // Ensure this matches filename!

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
    queryKey: ["bookings", page, limit, filterStatus],
    queryFn: () => fetchBookingsList(page, limit, filterStatus),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: async (data: AdminBookingInput) => {
      const res = await createAdminBooking(data);
      if (!res.success) throw new Error(res.message || "Failed");
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
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
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
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
      toast.success("Booking archived");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
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
      toast.success("Booking updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-data"] });
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
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] }); // Invalidate customer's personal list
      queryClient.invalidateQueries({ queryKey: ["bookings"] }); // Invalidate admin list
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
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
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
    submitPayment: paymentMutation.mutateAsync, // <-- EXPORTED HERE!
    isSubmittingPayment: paymentMutation.isPending,
  };
};

export const useCustomerBookings = () => {
  return useQuery({
    queryKey: ["customer-bookings"],
    queryFn: async () => {
      const res = await getCustomerBookings();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
};

export const useCarUnavailableDates = (carId: string | undefined) => {
  return useQuery({
    queryKey: ["car-unavailable-dates", carId],
    queryFn: async () => {
      if (!carId) return [];
      return await getCarUnavailableDatesAction(carId);
    },
    enabled: !!carId,
    // Keep it relatively fresh since this is a real-time booking engine
    staleTime: 30 * 1000,
  });
};
