"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { saveServiceArea } from "@/actions/settings";
import { toast } from "sonner";

function DrawingManager({
  onPolygonsChange,
}: {
  onPolygonsChange: (polys: any[][]) => void;
}) {
  const map = useMap();
  const drawingLib = useMapsLibrary("drawing");
  const [manager, setManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);

  // Store references to all drawn shapes so we can manage them
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  // Helper: Extract coords from ALL polygons and notify parent
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

  useEffect(() => {
    if (!map || !drawingLib) return;

    const newManager = new drawingLib.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
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
        clickable: true, // Important for deletion
      },
    });

    newManager.setMap(map);
    setManager(newManager);

    // EVENT: When a new shape is drawn
    const listener = google.maps.event.addListener(
      newManager,
      "overlaycomplete",
      (event: any) => {
        const newPoly = event.overlay as google.maps.Polygon;

        // Add to our list
        polygonsRef.current.push(newPoly);

        // Switch back to hand tool
        newManager.setDrawingMode(null);

        // Add "Right Click to Delete" listener
        newPoly.addListener("contextmenu", () => {
          // Right click
          newPoly.setMap(null); // Remove from map
          polygonsRef.current = polygonsRef.current.filter(
            (p) => p !== newPoly,
          ); // Remove from list
          updateParent(); // Update state
          toast.info("Shape removed");
        });

        // Listen for edits (dragging points) to update state
        newPoly.getPath().addListener("set_at", updateParent);
        newPoly.getPath().addListener("insert_at", updateParent);

        // Update parent immediately
        updateParent();
      },
    );

    return () => {
      google.maps.event.removeListener(listener);
      newManager.setMap(null);
    };
  }, [map, drawingLib]);

  return null;
}

export default function ServiceAreaEditor() {
  const [polygons, setPolygons] = useState<any[][]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (polygons.length === 0) {
      toast.error("Please draw at least one shape!");
      return;
    }

    setIsSaving(true);
    const result = await saveServiceArea(polygons); // Now sends Array of Arrays
    setIsSaving(false);

    if (result.error) toast.error(result.error);
    else toast.success("All service areas saved!");
  };

  return (
    <div className="space-y-4">
      <div className="h-[500px] w-full border rounded-lg overflow-hidden relative">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}>
          <Map
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            defaultCenter={{ lat: 11.005, lng: 124.6075 }}
            defaultZoom={13}
            gestureHandling="greedy"
          >
            <DrawingManager onPolygonsChange={setPolygons} />
          </Map>
        </APIProvider>
        <div className="absolute top-2 left-2 bg-white/90 p-2 text-xs rounded shadow z-10">
          💡 Tip: Right-click a shape to delete it.
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : `Save ${polygons.length} Service Areas`}
      </button>
    </div>
  );
}
