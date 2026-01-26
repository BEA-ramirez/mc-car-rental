"use client";

import { registerLicense } from "@syncfusion/ej2-base";
import { useState, useEffect } from "react";

export default function SyncfusionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 1. Get the key
    const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;

    // 2. Register it immediately inside the effect (Safe from "window is not defined")
    if (licenseKey) {
      try {
        registerLicense(licenseKey);
      } catch (error) {
        console.error("License registration failed:", error);
      }
    }

    // 3. ONLY after attempting to register, allow the app to show
    setIsClient(true);
  }, []);

  // 4. While we are waiting for the browser to be ready, show NOTHING.
  // This prevents the "Trial" banner from ever having a chance to appear.
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}
