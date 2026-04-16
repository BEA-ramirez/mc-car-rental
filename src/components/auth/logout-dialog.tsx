"use client";

import { useTransition } from "react";
import { logout } from "@/actions/login";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutDialog({ isOpen, onClose }: LogoutDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  // If the parent says it's not open, render absolutely nothing.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[340px] p-5 bg-card border border-border shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200 transition-colors">
        <div className="flex flex-col items-center text-center">
          {/* Glassmorphic Icon */}
          <div className="flex items-center justify-center w-10 h-10 mb-3 bg-destructive/10 border border-destructive/20 rounded-xl transition-colors">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>

          <h3 className="mb-1.5 text-sm font-bold text-foreground uppercase tracking-widest leading-none">
            Ready to leave?
          </h3>
          <p className="mb-6 text-[10px] font-medium text-muted-foreground leading-relaxed px-2">
            Are you sure you want to sign out of your account? You will need to
            log back in to manage your bookings and fleet.
          </p>

          <div className="flex w-full gap-2.5">
            <button
              onClick={onClose}
              disabled={isPending}
              className={cn(
                "flex-1 h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors bg-background border border-border rounded-lg hover:bg-secondary disabled:opacity-50 shadow-none outline-none focus-visible:ring-1 focus-visible:ring-primary",
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className={cn(
                "flex-1 h-8 flex justify-center items-center gap-1.5 px-4 text-[10px] font-bold uppercase tracking-widest text-destructive-foreground transition-colors bg-destructive border border-transparent rounded-lg hover:opacity-90 disabled:opacity-50 shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-destructive",
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing out...
                </>
              ) : (
                "Sign out"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
