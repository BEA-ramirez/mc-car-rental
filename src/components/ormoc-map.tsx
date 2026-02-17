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
import { toast } from "sonner"; // Assuming you have sonner installed

// --- TYPES ---
export type MapHub = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type MapProps = {
  // Updated to include the optional name argument
  onLocationSelect?: (lat: number, lng: number, locationName?: string) => void;
  hubs?: MapHub[];
};

const supabase = createClient();

// --- COMPONENT 1: Hub Markers ---
function HubMarkers({
  hubs,
  onHubSelect,
}: {
  hubs: MapHub[];
  onHubSelect: (hub: MapHub) => void;
}) {
  return (
    <>
      {hubs.map((hub) => (
        <AdvancedMarker
          key={hub.id}
          position={{ lat: hub.lat, lng: hub.lng }}
          onClick={(e) => {
            e.stop(); // Prevent map click event
            onHubSelect(hub);
          }}
        >
          <Pin
            background={"#2563eb"}
            glyphColor={"#fff"}
            borderColor={"#1e40af"}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap z-50 pointer-events-none">
            {hub.name}
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

// --- COMPONENT 2: Service Area (Green Zone) ---
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

      // Normalize data to ensure it's an array of paths
      const savedData = data.value;
      let serviceAreaPaths: any[] = [];

      if (Array.isArray(savedData) && savedData.length > 0) {
        // Check if it's a single polygon (array of coords) or multipolygon (array of arrays of coords)
        if (
          Array.isArray(savedData[0]) &&
          typeof savedData[0][0] === "number"
        ) {
          // It's a single path [[lat,lng], [lat,lng]] - wrap it
          serviceAreaPaths = [savedData];
        } else {
          // It's likely already multiple paths
          serviceAreaPaths = savedData;
        }
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
        clickable: false, // Important: Let clicks pass through to the map
        zIndex: 1,
      });

      return () => {
        greenZone.setMap(null);
      };
    }

    loadServiceAreas();
  }, [map, onPathsLoaded]);

  return null;
}

// --- COMPONENT 3: Map Content (Logic) ---
function MapContent({ onLocationSelect, hubs = [] }: MapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [allowedPaths, setAllowedPaths] = useState<any[]>([]);

  // Load Geometry Library for "containsLocation"
  const geometryLib = useMapsLibrary("geometry");

  const handleMapClick = (e: any) => {
    // If geometry lib isn't loaded or no service area, block clicks
    if (!geometryLib || allowedPaths.length === 0) {
      toast.warning("Loading service area map...");
      return;
    }

    const { lat, lng } = e.detail.latLng;
    const clickPoint = new google.maps.LatLng(lat, lng);

    // Check if click is inside ANY of the allowed paths
    let isInside = false;
    // We create a temporary polygon object just to use the math library
    const tempPoly = new google.maps.Polygon({ paths: [] });

    for (const path of allowedPaths) {
      tempPoly.setPath(path);
      if (geometryLib.poly.containsLocation(clickPoint, tempPoly)) {
        isInside = true;
        break;
      }
    }

    if (isInside) {
      setSelectedLocation({ lat, lng });
      if (onLocationSelect) onLocationSelect(lat, lng, undefined); // Custom location has no name
    } else {
      toast.error("Please select a location inside the green service area.");
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
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        onClick={handleMapClick}
      >
        {/* Render Green Zones */}
        <ServiceAreaRenderer onPathsLoaded={setAllowedPaths} />

        {/* Render Business Hubs */}
        <HubMarkers
          hubs={hubs}
          onHubSelect={(hub) => {
            setSelectedLocation({ lat: hub.lat, lng: hub.lng });
            // Pass the Hub Name as the 3rd argument
            if (onLocationSelect) onLocationSelect(hub.lat, hub.lng, hub.name);
          }}
        />

        {/* Render User Selection Pin */}
        {selectedLocation && (
          <AdvancedMarker position={selectedLocation}>
            <Pin
              background={"#ef4444"}
              glyphColor={"#fff"}
              borderColor={"#b91c1c"}
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

// --- MAIN PARENT COMPONENT ---
// Fix: Use the MapProps type here so 'hubs' is accepted
export default function OrmocMapSelector(props: MapProps) {
  return (
    <div className="h-full w-full rounded-xl border-2 border-slate-200 overflow-hidden shadow-inner relative">
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        libraries={["geometry"]} // Request geometry lib here
      >
        <MapContent {...props} />
      </APIProvider>
    </div>
  );
}
