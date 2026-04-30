"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Map as MapIcon,
  MousePointerClick,
  Info,
} from "lucide-react";
import { useBookingSettings } from "../../../hooks/use-settings";

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

    onPolygonsChange(allCoords);
  }, [onPolygonsChange]);

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
        fillColor: "#3b82f6",
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
  // 1. Destructure from the master hook
  const { data, isLoading, saveServiceArea, isSavingServiceArea } =
    useBookingSettings();

  const [initialPolygons, setInitialPolygons] = useState<any[][]>([]);
  const [currentPolygons, setCurrentPolygons] = useState<any[][]>([]);

  // 2. Sync the hook's cached data into local state
  useEffect(() => {
    if (data?.serviceArea) {
      setInitialPolygons(data.serviceArea);
      setCurrentPolygons(data.serviceArea);
    }
  }, [data?.serviceArea]);

  const handleSave = async () => {
    if (currentPolygons.length === 0) {
      toast.error("Please draw at least one shape!");
      return;
    }

    // 3. Just call the hook's mutation!
    // The hook handles the sonner toasts natively.
    try {
      await saveServiceArea(currentPolygons);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Map Data...
      </div>
    );

  return (
    <div className="bg-background shadow-sm overflow-hidden flex flex-col max-w-4xl transition-colors">
      <div className="bg-primary/10 mb-4 w-35 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 shadow-sm">
        <Info className="w-3.5 h-3.5" />
        <span className="text-[9px] font-bold uppercase tracking-widest">
          {currentPolygons.length} Active Zones
        </span>
      </div>
      <div className="bg-background space-y-4 transition-colors">
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
      <div className="bg-background p-3 shrink-0 flex justify-end transition-colors">
        <Button
          className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          onClick={handleSave}
          disabled={isSavingServiceArea} // 4. Using the hook's pending state
        >
          {isSavingServiceArea ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          {isSavingServiceArea
            ? "Saving..."
            : `Save ${currentPolygons.length} Boundaries`}
        </Button>
      </div>
    </div>
  );
}
