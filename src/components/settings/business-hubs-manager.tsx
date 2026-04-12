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
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
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
        "relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out outline-none focus-visible:ring-1 focus-visible:ring-primary",
        enabled ? "bg-primary" : "bg-secondary border border-border",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-2" : "-translate-x-2",
        )}
      />
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-4xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Physical Business Hubs
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Manage your official garages & pickup kiosks
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          onClick={handleAddHub}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Location
        </Button>
      </div>

      <div className="p-4 space-y-4 bg-background transition-colors">
        {/* INTERACTIVE MAP SECTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg transition-colors shadow-sm">
            <MousePointerClick className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90">
              Drag and drop the numbered pins on the map to automatically update
              their coordinates.
            </p>
          </div>

          <div className="h-[300px] w-full border border-border rounded-xl overflow-hidden relative shadow-inner bg-secondary transition-colors">
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
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[10px] shadow-md transition-transform hover:scale-110",
                        hub.is_active
                          ? "bg-foreground border-background text-background"
                          : "bg-muted-foreground border-background text-background opacity-80",
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
        <div className="space-y-3">
          {hubs.length === 0 ? (
            <div className="text-center py-8 bg-card border border-border border-dashed rounded-xl transition-colors">
              <Building className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                No physical hubs defined.
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Click 'Add Location' to drop your first pin on the map.
              </p>
            </div>
          ) : (
            hubs.map((hub, index) => (
              <div
                key={hub.id}
                className={cn(
                  "bg-card border rounded-xl overflow-hidden transition-all duration-200",
                  hub.is_active
                    ? "border-border shadow-sm"
                    : "border-border opacity-60 bg-secondary/30",
                )}
              >
                {/* Hub Header */}
                <div className="px-3 py-2.5 border-b border-border bg-secondary/50 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center font-mono text-[9px] font-bold transition-colors",
                        hub.is_active
                          ? "bg-foreground text-background"
                          : "bg-muted-foreground text-background",
                      )}
                    >
                      {index + 1}
                    </div>
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                      {hub.name || "Unnamed Hub"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Active
                      </span>
                      <CustomToggle
                        enabled={hub.is_active}
                        onClick={() =>
                          handleUpdateHub(hub.id, "is_active", !hub.is_active)
                        }
                      />
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      onClick={() => handleRemoveHub(hub.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Hub Form Body */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Name & Address */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Hub Name
                      </label>
                      <Input
                        placeholder="e.g., Main Garage"
                        value={hub.name}
                        onChange={(e) =>
                          handleUpdateHub(hub.id, "name", e.target.value)
                        }
                        className="h-8 text-[11px] bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-semibold transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Complete Address
                      </label>
                      <Input
                        placeholder="e.g., Aviles St, Ormoc City"
                        value={hub.address}
                        onChange={(e) =>
                          handleUpdateHub(hub.id, "address", e.target.value)
                        }
                        className="h-8 text-[11px] bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-medium transition-colors"
                      />
                    </div>
                  </div>

                  {/* Coordinates (Synced with Map) */}
                  <div className="md:col-span-5 space-y-3 border-l border-border pl-4 transition-colors">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-primary" /> Latitude
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
                        className="h-8 text-[11px] border-border rounded-lg shadow-none font-mono bg-secondary text-muted-foreground focus:bg-background focus:text-foreground transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-primary" />{" "}
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
                        className="h-8 text-[11px] border-border rounded-lg shadow-none font-mono bg-secondary text-muted-foreground focus:bg-background focus:text-foreground transition-colors"
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
          Save Hub Locations
        </Button>
      </div>
    </div>
  );
}
