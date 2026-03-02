"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  const updateParent = () => {
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
  };

  const attachPolygonListeners = (poly: google.maps.Polygon) => {
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
  };

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
        fillColor: "#2563eb",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#1d4ed8",
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
          fillColor: "#2563eb",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#1d4ed8",
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
  }, [map, drawingLib, initialPolygons]);

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
        // Your existing getServiceArea returns [] if nothing is found,
        // so we can safely set it directly!
        setInitialPolygons(savedAreas);
        setCurrentPolygons(savedAreas);
      } catch (error) {
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
    // Since your existing saveServiceArea expects the data type mapped in Zod,
    // we pass currentPolygons directly. (Assuming Zod expects an array of coordinate arrays).
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
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Map Data...
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-4xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-blue-600" />
            Service Area Boundaries
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Draw geographical polygons to define where vehicles can be
            delivered.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-sm border border-blue-100 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {currentPolygons.length} Active Zones
          </span>
        </div>
      </div>

      <div className="p-6 bg-white space-y-4">
        {/* Helper Banner */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-sm">
          <MousePointerClick className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-medium text-slate-600">
            Select the polygon tool at the top of the map to draw.{" "}
            <strong className="text-slate-900">
              Right-click any shape to delete it.
            </strong>{" "}
            Drag edges to adjust.
          </p>
        </div>

        {/* Map Container */}
        <div className="h-[550px] w-full border border-slate-200 rounded-sm overflow-hidden relative shadow-inner bg-slate-100">
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
      <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-end">
        <Button
          className="h-9 px-6 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm"
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
