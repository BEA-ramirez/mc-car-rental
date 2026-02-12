import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompleteDriverType } from "@/lib/schemas/driver";
import {
  saveDriver,
  deleteDriver,
  getDriverById,
} from "@/actions/manage-driver";

const fetchDrivers = async () => {
  const response = await fetch("/api/drivers");
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const result = await response.json();
  return result as CompleteDriverType[];
};

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: saveDriver,
    onSuccess: () => {
      toast.success("Driver saved successfully");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      toast.success("Driver deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    saveDriver: saveMutation.mutate,
    deleteDriver: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
