"use client";
import { registerLicense } from "@syncfusion/ej2-base";
import { useState, useEffect } from "react";

function SyncfusionProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 1. This signals that we are now running in the browser
    setIsClient(true);

    // 2. Register the license ONLY here (inside the browser)
    const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;

    if (licenseKey) {
      try {
        registerLicense(licenseKey);
      } catch (error) {
        console.error("Failed to register Syncfusion license:", error);
      }
    } else {
      console.warn("Syncfusion License Key not found in .env.local");
    }
  }, []);

  if (!isClient) {
    return null;
  }
  return <>{children}</>;
}

export default SyncfusionProvider;
