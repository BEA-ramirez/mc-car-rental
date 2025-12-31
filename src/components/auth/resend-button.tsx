"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resendConfirmationEmail } from "@/actions/confirm";

export function ResendButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    const result = await resendConfirmationEmail(email);

    setLoading(false);
    if (result.success) {
      setMessage("Email sent! Check your inbox.");
    } else {
      setMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-sm"
        onClick={handleResend}
        disabled={loading}
      >
        {loading ? "Sending..." : "Resend email"}
      </Button>
      {message && (
        <p className="text-xs text-center text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
