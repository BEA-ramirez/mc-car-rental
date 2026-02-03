"use client";

import { registerLicense } from "@syncfusion/ej2-base";

// 1. Register at MODULE SCOPE
// This code runs as soon as the JavaScript bundle loads,
// BEFORE React even attempts to render the component tree.
try {
  const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
  if (licenseKey) {
    registerLicense(licenseKey);
  } else {
    console.warn("Syncfusion License Key is missing in environment variables!");
  }
} catch (error) {
  console.error("Error registering Syncfusion license:", error);
}

export default function SyncfusionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Just render children immediately. No blocking, no flash.
  return <>{children}</>;
}
