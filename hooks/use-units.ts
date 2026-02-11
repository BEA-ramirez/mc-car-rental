import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchSpecifications,
  searchFeatures,
  saveUnit,
  getUnitById,
  deleteUnit,
} from "@/actions/units.ts/manage";
import { toast } from "sonner";
import { CompleteCarType } from "@/lib/schemas/car";
import { useState } from "react";

const fetchUnits = async (): Promise<CompleteCarType[]> => {
  const response = await fetch("/api/units");
  if (!response.ok) throw new Error("Failed to fetch units");
  const result = await response.json();
  return result as CompleteCarType[];
};

export const useUnits = (unitId?: string) => {
  const queryClient = useQueryClient();

  const useSpecifications = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const query = useQuery({
      queryKey: ["specifications", searchQuery],
      queryFn: () => searchSpecifications(searchQuery),
      staleTime: 60 * 1000, //cache for 1 min
    });

    return {
      specifications: query.data || [],
      isLoading: query.isLoading,
      setSearchQuery,
    };
  };

  const useFeatures = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const query = useQuery({
      queryKey: ["features", searchQuery],
      queryFn: () => searchFeatures(searchQuery),
      staleTime: 60 * 1000, //cache for 1 min
    });

    return {
      features: query.data || [],
      isLoading: query.isLoading,
      setSearchQuery,
    };
  };

  const query = useQuery({
    queryKey: ["units"],
    queryFn: fetchUnits,
    staleTime: 60 * 1000,
  });

  // fetch unit for editing
  const unitQuery = useQuery({
    queryKey: ["unit", unitId],
    queryFn: () => getUnitById(unitId!),
    enabled: !!unitId, // only fetch if id exists
  });

  // save mutation
  const saveUnitMutation = useMutation({
    mutationFn: saveUnit,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["units"] });
        queryClient.invalidateQueries({ queryKey: ["unit", unitId] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      toast.error("Failed to save unit " + err.message);
    },
  });

  // delete mutation
  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["units"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      toast.error("Failed to delete unit " + err.message);
    },
  });

  return {
    units: query.data || [],
    isUnitsLoading: query.isLoading || query.isFetching,
    unit: unitQuery.data,
    isLoadingUnit: unitQuery.isLoading,
    saveUnit: saveUnitMutation.mutate,
    isSaving: saveUnitMutation.isPending,
    deleteUnit: deleteUnitMutation.mutate,
    isDeleting: deleteUnitMutation.isPending,
    searchSpecifications,
    searchFeatures,
    useSpecifications,
    useFeatures,
  };
};
