"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
// Make sure this path matches where your actions actually live!
import { getServiceArea, saveServiceArea } from "@/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Map as MapIcon,
  MousePointerClick,
  Info,
} from "lucide-react";

// --- DRAWING MANAGER & POLYGON INITIALIZER ---
function DrawingManager({
  initialPolygons,
  onPolygonsChange,
}: {
  initialPolygons: any[][];
  onPolygonsChange: (polys: any[][]) => void;
}) {
  const map = useMap();
  const drawingLib = useMapsLibrary("drawing");
  const [manager, setManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const hasInitialized = useRef(false);

  console.log("manager", manager);

  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const updateParent = useCallback(() => {
    const allCoords = polygonsRef.current.map((poly) => {
      const path = poly.getPath();
      const coords = [];
      for (let i = 0; i < path.getLength(); i++) {
        const xy = path.getAt(i);
        coords.push({ lat: xy.lat(), lng: xy.lng() });
      }
      return coords;
    });

    // Call your prop
    onPolygonsChange(allCoords);

    // Tell React to only recreate this if the onPolygonsChange prop changes
  }, [onPolygonsChange]);

  // 2. Wrap attachPolygonListeners in useCallback
  const attachPolygonListeners = useCallback(
    (poly: google.maps.Polygon) => {
      poly.addListener("contextmenu", () => {
        poly.setMap(null);
        polygonsRef.current = polygonsRef.current.filter((p) => p !== poly);
        updateParent();
        toast.info("Boundary shape removed");
      });

      poly.getPath().addListener("set_at", updateParent);
      poly.getPath().addListener("insert_at", updateParent);
      poly.getPath().addListener("remove_at", updateParent);
      poly.addListener("dragend", updateParent);

      // This depends on the cached updateParent we just made above!
    },
    [updateParent],
  );

  useEffect(() => {
    if (!map || !drawingLib) return;

    const newManager = new drawingLib.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        editable: true,
        draggable: true,
        fillColor: "#3b82f6", // Kept specific colors for map elements as Tailwind classes don't apply inside Google Maps canvas
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#2563eb",
        clickable: true,
      },
    });

    newManager.setMap(map);
    setManager(newManager);

    // Load Existing Polygons (ONLY ONCE)
    if (
      !hasInitialized.current &&
      initialPolygons &&
      initialPolygons.length > 0
    ) {
      initialPolygons.forEach((coords) => {
        const poly = new google.maps.Polygon({
          paths: coords,
          map: map,
          editable: true,
          draggable: true,
          fillColor: "#3b82f6",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#2563eb",
          clickable: true,
        });

        attachPolygonListeners(poly);
        polygonsRef.current.push(poly);
      });

      updateParent();
      hasInitialized.current = true;
    }

    // Listen for NEW shapes being drawn
    const listener = google.maps.event.addListener(
      newManager,
      "overlaycomplete",
      (event: any) => {
        const newPoly = event.overlay as google.maps.Polygon;
        polygonsRef.current.push(newPoly);
        newManager.setDrawingMode(null);
        attachPolygonListeners(newPoly);
        updateParent();
      },
    );

    return () => {
      google.maps.event.removeListener(listener);
      newManager.setMap(null);
    };
  }, [map, drawingLib, initialPolygons, attachPolygonListeners, updateParent]);

  return null;
}

// --- MAIN UI COMPONENT ---
export default function ServiceAreaEditor() {
  const [initialPolygons, setInitialPolygons] = useState<any[][]>([]);
  const [currentPolygons, setCurrentPolygons] = useState<any[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedAreas = await getServiceArea();
        setInitialPolygons(savedAreas);
        setCurrentPolygons(savedAreas);
      } catch {
        toast.error("Failed to load service areas.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (currentPolygons.length === 0) {
      toast.error("Please draw at least one shape!");
      return;
    }

    setIsSaving(true);
    const result = await saveServiceArea(currentPolygons as any);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Successfully saved ${currentPolygons.length} service boundaries!`,
      );
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Map Data...
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-4xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <MapIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Service Area Boundaries
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Define delivery polygons via Google Maps
            </p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 shadow-sm">
          <Info className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            {currentPolygons.length} Active Zones
          </span>
        </div>
      </div>

      <div className="p-4 bg-background space-y-4 transition-colors">
        {/* Helper Banner */}
        <div className="flex items-center gap-2.5 bg-secondary/50 border border-border px-3 py-2 rounded-lg transition-colors">
          <MousePointerClick className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-[10px] font-medium text-foreground leading-tight">
            Select the polygon tool at the top of the map to draw.{" "}
            <strong className="font-bold text-primary">
              Right-click any shape to delete it.
            </strong>{" "}
            Drag edges to adjust.
          </p>
        </div>

        {/* Map Container */}
        <div className="h-[450px] w-full border border-border rounded-lg overflow-hidden relative shadow-inner bg-secondary transition-colors">
          <APIProvider
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
          >
            <Map
              mapId={process.env.NEXT_PUBLIC_MAP_ID || "DEMO_MAP_ID"}
              defaultCenter={{ lat: 11.005, lng: 124.6075 }} // Ormoc default
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI={false}
              streetViewControl={false}
              mapTypeControl={false}
            >
              <DrawingManager
                initialPolygons={initialPolygons}
                onPolygonsChange={setCurrentPolygons}
              />
            </Map>
          </APIProvider>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end transition-colors">
        <Button
          className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          {isSaving ? "Saving..." : `Save ${currentPolygons.length} Boundaries`}
        </Button>
      </div>
    </div>
  );
}
