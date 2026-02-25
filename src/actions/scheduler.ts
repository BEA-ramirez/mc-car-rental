"use server";

import { createClient } from "@/utils/supabase/server";
import {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler";

export async function getSchedulerData(startDate: Date, endDate: Date) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_scheduler_view", {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate.toISOString(),
    });

    if (error) {
      console.error("Error fetching scheduler data:", error);
      return { events: [], resources: [] };
    }

    return {
      resources: (data?.resources as SchedulerResource[]) || [],
      events: (data?.events as SchedulerEvent[]) || [],
    };
  } catch (error) {
    console.error("Unexpected error fetching scheduler data:", error);
    return { events: [], resources: [] };
  }
}
