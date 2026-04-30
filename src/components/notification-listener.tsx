"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function NotificationListener() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Initialize audio only on the client side
    setAudio(new Audio("/ding.wav"));

    // Ask the user for desktop notification permissions on load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Fetch the current user securely on the client side
    supabase.auth.getUser().then(({ data }) => {
      // The isMounted check prevents the "state update on unmounted component" warning!
      if (isMounted && data?.user) {
        setCurrentUserId(data.user.id);
      }
    });

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, []);

  useEffect(() => {
    // Wait until we have successfully fetched the user ID
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
          const notification = payload.new;

          // 1. Play the "Ding!"
          if (audio) {
            audio
              .play()
              .catch((e) =>
                console.log(
                  "Audio blocked by browser policy until interaction",
                ),
              );
          }

          // 2. Fire the Sonner Toast inside the app
          toast.success(notification.title, {
            description: notification.message,
          });

          // 3. Fire the Native Desktop Notification (Only if tab is hidden)
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            if (document.hidden) {
              new Notification(notification.title, {
                body: notification.message,
                icon: "/favicon.ico",
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [audio, currentUserId]);

  return null; // Invisible component
}
