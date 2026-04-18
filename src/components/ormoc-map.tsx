"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Search, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TYPES ---
export type MapHub = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type MapProps = {
  onLocationSelect?: (lat: number, lng: number, locationName?: string) => void;
  hubs?: MapHub[];
};

const supabase = createClient();

// --- COMPONENT 1: Search Bar (Autocomplete) ---
function PlaceAutocomplete({
  onPlaceSelect,
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
      componentRestrictions: { country: "ph" },
    });

    autocomplete.addListener("place_changed", () => {
      onPlaceSelect(autocomplete.getPlace());
    });
  }, [placesLib, onPlaceSelect]);

  return (
    <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] z-10">
      <div className="relative flex items-center w-full h-12 rounded-xl bg-white shadow-lg overflow-hidden border border-gray-200">
        <div className="grid place-items-center h-full w-12 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2 bg-transparent font-medium"
          type="text"
          placeholder="Search for a place in Ormoc..."
        />
      </div>
    </div>
  );
}

// --- COMPONENT 2: Hub Markers ---
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
            if (e.stop) e.stop();
            onHubSelect(hub);
          }}
        >
          <Pin
            background={"#2563eb"}
            glyphColor={"#fff"}
            borderColor={"#1e40af"}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap z-50 pointer-events-none text-black">
            {hub.name}
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

// --- COMPONENT 3: Service Area (Green Zone) ---
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
        if (
          Array.isArray(savedData[0]) &&
          typeof savedData[0][0] === "number"
        ) {
          serviceAreaPaths = [savedData];
        } else {
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
        clickable: false,
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

// --- COMPONENT 4: Map Content (Logic) ---
function MapContent({ onLocationSelect, hubs = [] }: MapProps) {
  const map = useMap();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [locationName, setLocationName] = useState<string>("Pinned Location");
  const [allowedPaths, setAllowedPaths] = useState<any[]>([]);

  const geometryLib = useMapsLibrary("geometry");
  const geocodingLib = useMapsLibrary("geocoding");
  const placesLib = useMapsLibrary("places");

  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  // Initialize Libraries
  useEffect(() => {
    if (geocodingLib) setGeocoder(new geocodingLib.Geocoder());
    if (placesLib && map) setPlacesService(new placesLib.PlacesService(map));
  }, [geocodingLib, placesLib, map]);

  const checkIfInsideServiceArea = (lat: number, lng: number) => {
    if (!geometryLib || allowedPaths.length === 0) return false;
    const point = new google.maps.LatLng(lat, lng);
    const tempPoly = new google.maps.Polygon({ paths: [] });

    for (const path of allowedPaths) {
      tempPoly.setPath(path);
      if (geometryLib.poly.containsLocation(point, tempPoly)) return true;
    }
    return false;
  };

  // --- 🚨 FIXED: MASTER CLICK HANDLER (Handles both Streets AND Landmarks) ---
  const handleMapClick = (e: any) => {
    if (!geometryLib || allowedPaths.length === 0) {
      toast.warning("Loading service area map...");
      return;
    }

    // 1. If it's a Landmark (POI), stop Google's default pop-up window
    if (e.detail?.placeId && typeof e.stop === "function") {
      e.stop();
    }

    const { lat, lng } = e.detail.latLng;
    const placeId = e.detail.placeId; // This exists if they clicked a mall, store, etc.

    if (checkIfInsideServiceArea(lat, lng)) {
      setSelectedLocation({ lat, lng });

      // 2. Fetch the specific name of the Landmark they clicked!
      if (placeId && placesService) {
        setLocationName("Loading landmark details...");
        placesService.getDetails(
          { placeId, fields: ["name", "formatted_address"] },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              setLocationName(
                place.name || place.formatted_address || "Selected Landmark",
              );
            } else {
              setLocationName(
                `Landmark (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              );
            }
          },
        );
      }
      // 3. Fallback: If they just clicked an empty street, use standard Geocoding
      else if (geocoder) {
        setLocationName("Loading address...");
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            setLocationName(results[0].formatted_address);
          } else {
            setLocationName(
              `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            );
          }
        });
      }
    } else {
      toast.error("Please select a location inside the green service area.");
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) {
      toast.error("Could not find coordinates for this place.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    if (checkIfInsideServiceArea(lat, lng)) {
      setSelectedLocation({ lat, lng });
      setLocationName(
        place.name || place.formatted_address || "Searched Location",
      );

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(16);
      }
    } else {
      toast.error("This location is outside our service area.");
    }
  };

  const confirmSelection = () => {
    if (onLocationSelect && selectedLocation) {
      onLocationSelect(
        selectedLocation.lat,
        selectedLocation.lng,
        locationName,
      );
    }
  };

  return (
    <>
      <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />

      <Map
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultCenter={{ lat: 11.005, lng: 124.6075 }}
        defaultZoom={13}
        minZoom={12}
        maxZoom={20}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        clickableIcons={true} // Ensure landmarks are clickable!
        onClick={handleMapClick}
      >
        <ServiceAreaRenderer onPathsLoaded={setAllowedPaths} />

        <HubMarkers
          hubs={hubs}
          onHubSelect={(hub) => {
            setSelectedLocation({ lat: hub.lat, lng: hub.lng });
            setLocationName(hub.name);
            if (map) {
              map.panTo({ lat: hub.lat, lng: hub.lng });
              map.setZoom(16);
            }
          }}
        />

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

      {/* --- TWO-STEP CONFIRMATION UI --- */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-20 animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full shrink-0">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Selected Location
              </p>
              <p className="text-sm font-bold text-gray-900 line-clamp-2">
                {locationName}
              </p>
            </div>
          </div>

          <Button
            onClick={confirmSelection}
            className="w-full bg-[#64c5c3] hover:bg-[#52a3a1] text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Location
          </Button>
        </div>
      )}
    </>
  );
}

// --- MAIN PARENT COMPONENT ---
export default function OrmocMapSelector(props: MapProps) {
  return (
    <div className="h-full w-full rounded-xl border-2 border-white/10 overflow-hidden shadow-inner relative bg-[#0a1118]">
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        libraries={["geometry", "places", "geocoding"]}
      >
        <MapContent {...props} />
      </APIProvider>
    </div>
  );
}
