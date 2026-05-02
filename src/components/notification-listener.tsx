"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function NotificationListener() {
  //Use a ref for audio so it doesn't trigger unnecessary re-renders
  // or disconnect the Supabase Realtime channel.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Initialize audio safely on the client side
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/ding.wav");
    }

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data?.user) {
        setCurrentUserId(data.user.id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("Realtime Notification Received!", payload);
          const notification = payload.new;

          // Reset the audio track before playing so it can fire multiple times!
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) =>
                console.warn(
                  "Audio blocked by browser. Admin must click anywhere on the screen first before sounds can autoplay.",
                ),
              );
          }

          // Fire the Sonner Toast
          toast.success(notification.title, {
            description: notification.message,
          });

          // Fire the Native Desktop Notification (Only if tab is hidden)
          if (
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.hidden
          ) {
            new Notification(notification.title, {
              body: notification.message,
              icon: "/favicon.ico",
            });
          }
        },
      )
      .subscribe((status) => {
        // Log the status so you can verify it connects successfully
        console.log("Realtime Subscription Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]); // audio is no longer a dependency!

  return null;
}
