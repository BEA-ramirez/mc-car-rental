import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveFeature,
  saveSpecification,
  deleteFeature,
  deleteSpecification,
} from "@/actions/units.ts/settings";
import { FeatureType, CarSpecificationType } from "@/lib/schemas/car";
import { QUERY_KEYS } from "@/lib/query-keys";

const fetchFeatures = async (): Promise<FeatureType[]> => {
  const response = await fetch("/api/features");
  if (!response.ok) throw new Error("Failed to fetch features");
  const result = await response.json();
  return result as FeatureType[];
};

const fetchSpecifications = async (): Promise<CarSpecificationType[]> => {
  const response = await fetch("/api/specifications");
  if (!response.ok) throw new Error("Failed to fetch specifications");
  const result = await response.json();
  return result as CarSpecificationType[];
};

export const useFleetSettings = () => {
  const queryClient = useQueryClient();

  const featuresQuery = useQuery({
    queryKey: QUERY_KEYS.fleet.features(),
    queryFn: fetchFeatures,
    staleTime: 5 * 60 * 1000,
  });

  const specificationsQuery = useQuery({
    queryKey: QUERY_KEYS.fleet.specifications(),
    queryFn: fetchSpecifications,
    staleTime: 5 * 60 * 1000,
  });

  // --- THE RIPPLE INVALIDATORS ---
  const invalidateFeatureRipples = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.features() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.detailBase });
  };

  const invalidateSpecificationRipples = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.fleet.specifications(),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.all });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.detailBase });
  };

  const featureMutation = useMutation({
    mutationFn: saveFeature,
    onSuccess: () => {
      toast.success("Feature saved successfully");
      invalidateFeatureRipples();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save feature");
    },
  });

  const specificationMutation = useMutation({
    mutationFn: saveSpecification,
    onSuccess: () => {
      toast.success("Specification saved successfully");
      invalidateSpecificationRipples();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save specification");
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: () => {
      toast.success("Feature deleted");
      invalidateFeatureRipples();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feature");
    },
  });

  const deleteSpecificationMutation = useMutation({
    mutationFn: deleteSpecification,
    onSuccess: () => {
      toast.success("Specification deleted");
      invalidateSpecificationRipples();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete specification");
    },
  });

  return {
    features: featuresQuery.data || [],
    specifications: specificationsQuery.data || [],
    isFeaturesLoading: featuresQuery.isLoading || featuresQuery.isFetching,
    isSpecificationsLoading:
      specificationsQuery.isLoading || specificationsQuery.isFetching,
    saveFeature: featureMutation.mutateAsync,
    saveSpecification: specificationMutation.mutateAsync,
    deleteFeature: deleteFeatureMutation.mutate,
    deleteSpecification: deleteSpecificationMutation.mutate,

    // NEW: Expose the isPending states
    isSavingFeature: featureMutation.isPending,
    isSavingSpecification: specificationMutation.isPending,
    isDeletingFeature: deleteFeatureMutation.isPending,
    isDeletingSpecification: deleteSpecificationMutation.isPending,
  };
};
