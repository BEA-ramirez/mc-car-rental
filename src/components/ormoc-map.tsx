"use client";

import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

// --- Helper: Draws the Green Zones ---
function ServiceAreaRenderer({
  onPathsLoaded,
}: {
  onPathsLoaded: (paths: any[]) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    async function loadServiceAreas() {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "service_area_boundary")
        .single();

      if (error || !data?.value) return;

      const savedData = data.value;

      let serviceAreaPaths: any[] = [];
      if (Array.isArray(savedData) && savedData.length > 0) {
        if (Array.isArray(savedData[0])) {
          serviceAreaPaths = savedData;
        } else {
          serviceAreaPaths = [savedData];
        }

        onPathsLoaded(serviceAreaPaths);

        const greenZone = new google.maps.Polygon({
          paths: serviceAreaPaths,
          strokeColor: "#16a34a",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#4ade80",
          fillOpacity: 0.2,
          map: map,
          clickable: false,
          zIndex: 1,
        });

        return () => {
          greenZone.setMap(null);
        };
      }
    }

    loadServiceAreas();
  }, [map, onPathsLoaded]);

  return null;
}

// --- Child Component: Handles Map Logic ---
// We moved all the logic HERE so it can access the APIProvider context
function MapContent({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [allowedPaths, setAllowedPaths] = useState<any[]>([]);

  // NOW this hook works because it's inside APIProvider
  const geometryLib = useMapsLibrary("geometry");

  const handleMapClick = (e: any) => {
    if (!e.detail.latLng) return;

    if (!geometryLib) {
      console.warn("Geometry library loading...");
      return;
    }

    if (allowedPaths.length === 0) {
      console.warn("No service areas loaded yet.");
      return;
    }

    const { lat, lng } = e.detail.latLng;
    const clickPoint = new google.maps.LatLng(lat, lng);

    let isInside = false;
    const tempPoly = new google.maps.Polygon({ paths: [] });

    for (const path of allowedPaths) {
      tempPoly.setPath(path);
      if (geometryLib.poly.containsLocation(clickPoint, tempPoly)) {
        isInside = true;
        break;
      }
    }

    if (isInside) {
      console.log("✅ Click valid! Pinning:", lat, lng);
      setSelectedLocation({ lat, lng });
      if (onLocationSelect) onLocationSelect(lat, lng);
    } else {
      console.log("❌ Click rejected: Outside green zone.");
      alert("Please select a location inside the green service area.");
    }
  };

  return (
    <>
      <Map
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultCenter={{ lat: 11.005, lng: 124.6075 }}
        defaultZoom={13}
        minZoom={12}
        maxZoom={18}
        gestureHandling={geometryLib ? "greedy" : "none"} // Wait for lib
        disableDefaultUI={true}
        onClick={handleMapClick}
      >
        <ServiceAreaRenderer onPathsLoaded={setAllowedPaths} />

        {selectedLocation && (
          <AdvancedMarker position={selectedLocation}>
            <Pin
              background={"#16a34a"}
              glyphColor={"#fff"}
              borderColor={"#14532d"}
            />
          </AdvancedMarker>
        )}
      </Map>

      {/* Helper Text */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-slate-600 z-10 pointer-events-none">
        <span className="font-bold text-green-600">Service Area</span>
        <br />
        You can only pin locations inside the{" "}
        <span className="text-green-600 font-bold">green zones</span>.
      </div>
    </>
  );
}

// --- Main Parent Component ---
export default function OrmocMapSelector(props: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  return (
    <div className="h-[500px] w-full rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner relative">
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        libraries={["geometry"]} // <--- Request the library here
      >
        {/* Render the child that uses the library */}
        <MapContent {...props} />
      </APIProvider>
    </div>
  );
}

// useEffect(() => {
//   if (!map) return;

//   // 1. Fetch the GeoJSON from your public folder
//   fetch("/data/ormoc-boundary.json")
//     .then((res) => res.json())
//     .then((data) => {
//       // Extract the coordinates. Note: GeoJSON is [lng, lat], Google is {lat, lng}
//       // This assumes a simple Polygon. If it's a MultiPolygon, you'll need a flatMap.
//       const ormocCoords = data.features[0].geometry.coordinates[0].map(
//         (coord: any) => ({
//           lat: coord[1],
//           lng: coord[0],
//         }),
//       );

//       // 2. Define the "World" (The shaded area)
//       const worldCoords = [
//         { lat: 85, lng: -180 },
//         { lat: 85, lng: 180 },
//         { lat: -85, lng: 180 },
//         { lat: -85, lng: -180 },
//       ];

//       // 3. Create the Mask (World with Ormoc cut out)
//       const mask = new google.maps.Polygon({
//         paths: [worldCoords, ormocCoords],
//         strokeColor: "#2563eb", // Nice blue border for Ormoc
//         strokeOpacity: 0.8,
//         strokeWeight: 2,
//         fillColor: "#0f172a", // Dark slate color
//         fillOpacity: 0.45, // Dim the outside world
//         map: map,
//         clickable: false,
//       });

//       return () => mask.setMap(null);
//     })
//     .catch((err) => console.error("Error loading GeoJSON:", err));
// }, [map]);
