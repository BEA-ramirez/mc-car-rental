import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { deletePartner } from "@/actions/helper/delete-partner";
import { saveFleetPartnerApplication } from "@/actions/manage-partner";

const fetchFleetPartners = async (): Promise<FleetPartnerType[]> => {
  const response = await fetch("/api/fleet-partners");
  if (!response.ok) throw new Error("Failed to fetch fleet partners");

  const result = await response.json();
  return result.fleetPartners as FleetPartnerType[];
};

const fetchUnassignedCarOwners = async (): Promise<any[]> => {
  const response = await fetch("/api/fleet-partners/unassigned");
  if (!response.ok) throw new Error("Failed to fetch unassigned car owners");
  const result = await response.json();
  return result as any[];
};

export const useFleetPartners = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["fleet-partners"],
    queryFn: fetchFleetPartners,
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      carOwnerId,
      userId,
    }: {
      carOwnerId: string;
      userId: string;
    }) => {
      const result = await deletePartner(carOwnerId, userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Fleet partner deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fleet-partners"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    ...query,
    deletePartner: deleteMutation.mutate,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: ["fleet-partners"] }),
  };
};

export const useUnassignedCarOwners = () => {
  return useQuery({
    queryKey: ["unassigned-car-owners"],
    queryFn: fetchUnassignedCarOwners,
    staleTime: 0, // Always fetch fresh data when opening the form
  });
};

export const useFleetPartnerApplication = () => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await saveFleetPartnerApplication(formData);
      if (!result.success) {
        throw new Error(result.message || "Failed to save application.");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["fleet-partners"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    applyForFleetPartner: saveMutation.mutateAsync,
    isApplying: saveMutation.isPending,
  };
};
