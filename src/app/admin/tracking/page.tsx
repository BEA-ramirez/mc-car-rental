"use client";

import React from "react";
import { ExternalLink, Info } from "lucide-react";

function Tracking() {
  // Use the specific SinoTrack server URL your client utilizes
  const sinotrackUrl = "https://vip.sinotrack.com/";

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* --- Mini Header --- */}
      <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Live Fleet Tracking
          </h1>
          <p className="text-[10px] font-medium text-muted-foreground">
            SinoTrack Global Positioning System
          </p>
        </div>

        <a
          href={sinotrackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open in New Tab
        </a>
      </div>

      {/* --- Info Bar --- */}
      <div className="px-6 py-2 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          <p className="text-[10px] font-medium">
            If the map does not load, SinoTrack may have restricted embedded
            viewing. Use the "Open in New Tab" button as a fallback.
          </p>
        </div>
      </div>

      {/* --- WebView / Iframe Container --- */}
      <div className="flex-1 w-full relative bg-muted">
        <iframe
          src={sinotrackUrl}
          title="SinoTrack Fleet Tracking"
          className="w-full h-full border-none shadow-inner"
          allow="geolocation" // Critical for map functionality
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}

export default Tracking;
