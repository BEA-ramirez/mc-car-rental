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
  };
};
