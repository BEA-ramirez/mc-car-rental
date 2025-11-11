"use client";
import { registerLicense } from "@syncfusion/ej2-base";

const SYNCFUSION_LICENSE_KEY = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
if (SYNCFUSION_LICENSE_KEY) {
  registerLicense(SYNCFUSION_LICENSE_KEY);
} else {
  console.error("SYNCFUSION LICENSE KEY IS MISSING");
  console.log("Check your .env.local file and RESTART the server.");
}

function SyncfusionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default SyncfusionProvider;
