import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchSpecifications,
  searchFeatures,
  saveUnit,
  getUnitById,
  deleteUnit,
  getCarDetailsAction,
  getInfiniteUnits,
} from "@/actions/units.ts/manage";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CompleteCarType } from "@/lib/schemas/car";
import { useState } from "react";
import { QUERY_KEYS } from "@/lib/query-keys";

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
      queryKey: QUERY_KEYS.fleet.specifications(searchQuery),
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
      queryKey: QUERY_KEYS.fleet.features(searchQuery),
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
    queryKey: QUERY_KEYS.fleet.all,
    queryFn: fetchUnits,
    staleTime: 60 * 1000,
  });

  // fetch unit for editing
  const unitQuery = useQuery({
    queryKey: QUERY_KEYS.fleet.detail(unitId!),
    queryFn: () => getUnitById(unitId!),
    enabled: !!unitId, // only fetch if id exists
  });

  // --- SAVE MUTATION ---
  const saveUnitMutation = useMutation({
    mutationFn: saveUnit,
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(data.message);

        // 1. Broadly invalidate ALL admin-units queries (ignores specific filters/pages)
        queryClient.invalidateQueries({ queryKey: ["admin-units"] });

        // Invalidate the legacy fleet list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.all });

        // --- NEW: Invalidate Customer Fleet & Scheduler ---
        // Wipes all filters/pages of the customer fleet view
        queryClient.invalidateQueries({
          queryKey: ["customer-fleet-infinite"],
        });
        // Wipes all months of the scheduler timeline
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.scheduler(),
        });

        // 2. Extract the carId (either from the returned data or the variables we sent)
        const carId = data.car_id || variables.car_id;

        if (carId) {
          // Invalidate the specific unit query you requested
          queryClient.invalidateQueries({ queryKey: ["unit", carId] });

          // Legacy detail query invalidation
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.fleet.detail(carId),
          });
        }

        // Wipe all cached detail views globally
        queryClient.invalidateQueries({ queryKey: ["car-details"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      toast.error("Failed to save unit: " + err.message);
    },
  });

  // --- DELETE MUTATION ---
  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    // Note: variables is usually just the ID string for delete mutations
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(data.message);

        // 1. Broadly invalidate ALL admin-units queries
        queryClient.invalidateQueries({ queryKey: ["admin-units"] });

        // Invalidate the legacy fleet list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fleet.all });

        // --- NEW: Invalidate Customer Fleet & Scheduler ---
        // Ensures deleted cars disappear from the customer view
        queryClient.invalidateQueries({
          queryKey: ["customer-fleet-infinite"],
        });
        // Ensures deleted cars disappear from the admin timeline
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.bookings.scheduler(),
        });

        // 2. Wipe the specific unit from cache to prevent ghost data
        const carId =
          typeof variables === "string" ? variables : (variables as any).car_id;
        if (carId) {
          queryClient.invalidateQueries({ queryKey: ["unit", carId] });
        }
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      toast.error("Failed to delete unit: " + err.message);
    },
  });

  return {
    units: query.data || [],
    isUnitsLoading: query.isLoading || query.isFetching,
    unit: unitQuery.data,
    isLoadingUnit: unitQuery.isLoading,
    saveUnit: saveUnitMutation.mutateAsync,
    isSaving: saveUnitMutation.isPending,
    deleteUnit: deleteUnitMutation.mutateAsync,
    isDeleting: deleteUnitMutation.isPending,
    searchSpecifications,
    searchFeatures,
    useSpecifications,
    useFeatures,
  };
};

export const useCarDetails = (carId: string) => {
  return useQuery({
    queryKey: ["car-details", carId],
    queryFn: async () => {
      if (!carId) return null;
      return await getCarDetailsAction(carId);
    },
    enabled: !!carId,
  });
};

export function useUnitsAdmin(filters: {
  search: string;
  type: string;
  ownerId: string;
}) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["admin-units", filters],
    queryFn: async ({ pageParam = 1 }) => {
      return await getInfiniteUnits({
        pageParam,
        limit: 12,
        search: filters.search,
        type: filters.type,
        ownerId: filters.ownerId,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const refreshUnits = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-units"] });
  };

  return {
    ...query,
    units: query.data?.pages.flatMap((page) => page.data) || [],
    isUnitsLoading: query.isLoading,
    refreshUnits,
  };
}
