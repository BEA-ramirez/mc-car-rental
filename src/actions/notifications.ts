"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserNotifications() {
  const supabase = await createClient();

  // RLS automatically filters this to the logged-in user's notifications!
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50); // Keep it snappy, load the latest 50

  if (error) throw new Error(error.message);
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();

  // Call our new RPC function
  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) throw new Error(error.message);
  return { success: true };
}
