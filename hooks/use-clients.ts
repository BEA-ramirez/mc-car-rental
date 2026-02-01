import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/lib/schemas/user";
import { deleteUser, bulkDeleteUsers } from "@/actions/helper/delete-user";
import { toast } from "sonner";

const fetchClients = async (): Promise<UserType[]> => {
  const response = await fetch("/api/clients");

  if (!response.ok) {
    throw new Error("Failed to fetch clients");
  }
  const result = await response.json();
  return result.users as UserType[];
};

export const useClients = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUser(userId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const result = await bulkDeleteUsers(userIds);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: () => {
      const toastId = toast.loading("Deleting clients...");
      return { toastId };
    },
    onSuccess: (data, variables, context) => {
      toast.success(data.message, { id: context?.toastId });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error, variables, context) => {
      toast.error(error.message, { id: context?.toastId });
    },
  });

  return {
    ...query,
    deleteClient: deleteMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
  };
};
