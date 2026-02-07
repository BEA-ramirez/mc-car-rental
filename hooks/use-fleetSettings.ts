import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientContext,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/server";
import { toast } from "sonner";
import {
  saveFeature,
  saveSpecification,
  deleteFeature,
  deleteSpecification,
} from "@/actions/units.ts/settings";
import { FeatureType, CarSpecificationType } from "@/lib/schemas/car";

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
    queryKey: ["features"],
    queryFn: fetchFeatures,
    staleTime: 5 * 60 * 1000,
  });

  const featureMutation = useMutation({
    mutationFn: saveFeature,
    onSuccess: () => {
      toast.success("Feature saved successfully");
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save feature");
    },
  });

  const specificationMutation = useMutation({
    mutationFn: saveSpecification,
    onSuccess: () => {
      toast.success("Specification saved successfully");
      queryClient.invalidateQueries({ queryKey: ["specifications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save specification");
    },
  });

  const specificationsQuery = useQuery({
    queryKey: ["specifications"],
    queryFn: fetchSpecifications,
    staleTime: 5 * 60 * 1000,
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: () => {
      toast.success("Feature deleted");
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feature");
    },
  });

  const deleteSpecificationMutation = useMutation({
    mutationFn: deleteSpecification,
    onSuccess: () => {
      toast.success("Specification deleted");
      queryClient.invalidateQueries({ queryKey: ["specifications"] });
    },
    onError: (error: Error) => toast.error(error.message),
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
  };
};
