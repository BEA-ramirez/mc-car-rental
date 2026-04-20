"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme(); // Defaulted to dark since your UI is dark mode

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#64c5c3]" />,
      }}
      toastOptions={{
        classNames: {
          // The main container: Dark glassmorphism with your border radiuses
          toast:
            "group toast group-[.toaster]:bg-[#0a1118]/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-sans p-4",

          // The title: Bold, uppercase, tracking wide like your headers
          title: "text-[11px] font-bold tracking-widest text-white",

          // The description text
          description: "text-gray-400 text-xs font-medium mt-1",

          // Action Buttons
          actionButton:
            "bg-[#64c5c3] text-black font-bold text-[10px] tracking-widest rounded-xl px-4",

          // Cancel Buttons
          cancelButton:
            "bg-white/5 text-gray-400 border-white/10 text-[10px] font-bold tracking-widest rounded-xl",

          // --- STATE SPECIFIC STYLING ---
          // This applies a subtle colored background tint and colors your custom Lucide icons
          success:
            "group-[.toaster]:border-[#64c5c3]/30 group-[.toaster]:bg-[#64c5c3]/5 [&_svg]:text-[#64c5c3]",
          error:
            "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-500/5 [&_svg]:text-red-400",
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-blue-500/5 [&_svg]:text-blue-400",
          warning:
            "group-[.toaster]:border-yellow-500/30 group-[.toaster]:bg-yellow-500/5 [&_svg]:text-yellow-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
