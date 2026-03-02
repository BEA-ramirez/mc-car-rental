"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  MapPin,
  Building,
  Plus,
  Trash2,
  Navigation,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBusinessHubs,
  saveBusinessHubs,
  BusinessHub,
} from "@/actions/settings";
import { cn } from "@/lib/utils";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function BusinessHubsManager() {
  const [hubs, setHubs] = useState<BusinessHub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Default center for the map (Ormoc City)
  const defaultCenter = { lat: 11.005, lng: 124.6075 };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBusinessHubs();
        if (data) setHubs(data);
      } catch (error) {
        toast.error("Failed to load business hubs.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddHub = () => {
    // Add new hub slightly offset from the default center so they don't stack perfectly
    const offset = hubs.length * 0.002;
    const newHub: BusinessHub = {
      id: `hub_${Date.now()}`,
      name: "",
      address: "",
      lat: defaultCenter.lat - offset,
      lng: defaultCenter.lng + offset,
      is_active: true,
    };
    setHubs([...hubs, newHub]);
    toast.info(
      "New hub pin dropped on the map. Drag it to the correct location.",
    );
  };

  const handleUpdateHub = (
    id: string,
    field: keyof BusinessHub,
    value: any,
  ) => {
    setHubs((prev) =>
      prev.map((hub) => (hub.id === id ? { ...hub, [field]: value } : hub)),
    );
  };

  const handleRemoveHub = (id: string) => {
    if (confirm("Are you sure you want to delete this hub location?")) {
      setHubs((prev) => prev.filter((hub) => hub.id !== id));
    }
  };

  const handleSave = async () => {
    if (hubs.some((h) => !h.name.trim())) {
      toast.error("All hubs must have a valid name.");
      return;
    }

    setIsSaving(true);
    try {
      await saveBusinessHubs(hubs);
      toast.success("Business hubs updated successfully!");
    } catch (error) {
      toast.error("Failed to save business hubs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Hub Locations...
      </div>
    );

  const CustomToggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-600",
        enabled ? "bg-emerald-500" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-2" : "-translate-x-2",
        )}
      />
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-4xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Physical Business Hubs
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage your official garages, airport booths, and physical pickup
            locations.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm"
          onClick={handleAddHub}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Location
        </Button>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        {/* INTERACTIVE MAP SECTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-sm">
            <MousePointerClick className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-medium text-blue-800">
              Drag and drop the numbered pins on the map to automatically update
              their coordinates.
            </p>
          </div>

          <div className="h-[350px] w-full border border-slate-200 rounded-sm overflow-hidden relative shadow-inner bg-slate-100">
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
            >
              <Map
                mapId={process.env.NEXT_PUBLIC_MAP_ID || "DEMO_MAP_ID"}
                defaultCenter={
                  hubs.length > 0
                    ? { lat: hubs[0].lat, lng: hubs[0].lng }
                    : defaultCenter
                }
                defaultZoom={13}
                gestureHandling="greedy"
                disableDefaultUI={false}
                streetViewControl={false}
                mapTypeControl={false}
              >
                {hubs.map((hub, index) => (
                  <AdvancedMarker
                    key={hub.id}
                    position={{
                      lat: hub.lat || defaultCenter.lat,
                      lng: hub.lng || defaultCenter.lng,
                    }}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        handleUpdateHub(hub.id, "lat", e.latLng.lat());
                        handleUpdateHub(hub.id, "lng", e.latLng.lng());
                      }
                    }}
                  >
                    {/* Custom HTML Marker to match the list indexes */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-md transition-transform hover:scale-110",
                        hub.is_active
                          ? "bg-slate-900 border-white text-white"
                          : "bg-slate-400 border-white text-white opacity-80",
                      )}
                    >
                      {index + 1}
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-4">
          {hubs.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-sm">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">
                No physical hubs defined.
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Click 'Add Location' to drop your first pin on the map.
              </p>
            </div>
          ) : (
            hubs.map((hub, index) => (
              <div
                key={hub.id}
                className={cn(
                  "bg-white border rounded-sm overflow-hidden transition-all duration-200",
                  hub.is_active
                    ? "border-slate-200 shadow-sm"
                    : "border-slate-200 opacity-60 bg-slate-50",
                )}
              >
                {/* Hub Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold text-white",
                        hub.is_active ? "bg-slate-900" : "bg-slate-400",
                      )}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {hub.name || "Unnamed Hub"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Active
                      </span>
                      <CustomToggle
                        enabled={hub.is_active}
                        onClick={() =>
                          handleUpdateHub(hub.id, "is_active", !hub.is_active)
                        }
                      />
                    </div>
                    <div className="w-px h-4 bg-slate-300" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm"
                      onClick={() => handleRemoveHub(hub.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Hub Form Body */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Name & Address */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Hub Name
                      </label>
                      <Input
                        placeholder="e.g., Main Garage"
                        value={hub.name}
                        onChange={(e) =>
                          handleUpdateHub(hub.id, "name", e.target.value)
                        }
                        className="h-8 text-xs border-slate-200 rounded-sm shadow-none font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Complete Address
                      </label>
                      <Input
                        placeholder="e.g., Aviles St, Ormoc City"
                        value={hub.address}
                        onChange={(e) =>
                          handleUpdateHub(hub.id, "address", e.target.value)
                        }
                        className="h-8 text-xs border-slate-200 rounded-sm shadow-none"
                      />
                    </div>
                  </div>

                  {/* Coordinates (Synced with Map) */}
                  <div className="md:col-span-5 space-y-4 border-l border-slate-100 pl-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-blue-500" />{" "}
                        Latitude
                      </label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="11.0050"
                        value={hub.lat || ""}
                        onChange={(e) =>
                          handleUpdateHub(
                            hub.id,
                            "lat",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8 text-xs border-slate-200 rounded-sm shadow-none font-mono bg-slate-50 text-slate-600 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-blue-500" />{" "}
                        Longitude
                      </label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="124.6075"
                        value={hub.lng || ""}
                        onChange={(e) =>
                          handleUpdateHub(
                            hub.id,
                            "lng",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-8 text-xs border-slate-200 rounded-sm shadow-none font-mono bg-slate-50 text-slate-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
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
          Save Hub Locations
        </Button>
      </div>
    </div>
  );
}
