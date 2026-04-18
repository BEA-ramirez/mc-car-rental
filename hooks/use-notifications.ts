import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";

export function useNotifications() {
  const queryClient = useQueryClient();

  // 1. Fetching Hook
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getUserNotifications(),
  });

  // 2. Mark Single as Read Mutation
  const markAsRead = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      // Instantly refresh the notification list in the background
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 3. Mark All as Read Mutation
  const markAllAsRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    ...query,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    isMarking: markAsRead.isPending || markAllAsRead.isPending,
  };
}
