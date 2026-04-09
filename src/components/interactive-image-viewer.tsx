"use client";

import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Download, RotateCw, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// A clean, gray placeholder with a "document" icon
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjFmNWY5IiBzdHJva2U9Im5vbmUiLz48cGF0aCBkPSJNMTQgMmgtNmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMnYtOGwtNi02eiIvPjxwYXRoIGQ9Ik0xNCAydjZhNiA2IDAgMCAwIDYgNnIvPjxwYXRoIGQ9Ik05IDE1aDYuNSIvPjxwYXRoIGQ9Ik05IDE5aDYuNSIvPjxwYXRoIGQ9Ik05IDExaDEiLz48L3N2Zz4=";

interface InteractiveImageViewerProps {
  url?: string;
  alt?: string;
  downloadFilename?: string;
}

export function InteractiveImageViewer({
  url,
  alt = "Document Image",
  downloadFilename = "document_download.jpg",
}: InteractiveImageViewerProps) {
  const [imgSrc, setImgSrc] = useState<string>(url || FALLBACK_IMAGE);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Panning State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Reset state if a new URL is passed in
  useEffect(() => {
    setImgSrc(url || FALLBACK_IMAGE);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [url]);

  // --- CONTROLS LOGIC ---
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 5)); // Max 5x zoom
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5)); // Min 0.5x zoom
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // --- DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!url || imgSrc === FALLBACK_IMAGE) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, opening in new tab instead", error);
      window.open(url, "_blank");
    }
  };

  // --- PANNING (DRAG) LOGIC ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    // Record where the mouse was clicked, factoring in the current position
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    // Calculate new position based on where the mouse has moved
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-full flex flex-col bg-zinc-950 dark:bg-black overflow-hidden">
      {/* FLOATING TOOLBAR */}
      <div className="absolute top-4 left-4 flex gap-1.5 z-20 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800 backdrop-blur-md shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <div className="flex items-center justify-center min-w-[36px] text-[10px] font-bold text-zinc-400 font-mono">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-7 bg-zinc-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
          onClick={handleRotate}
          title="Rotate 90°"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
          onClick={handleReset}
          title="Reset View"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-7 bg-zinc-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
          onClick={handleDownload}
          title="Download Image"
          disabled={imgSrc === FALLBACK_IMAGE}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* INTERACTIVE DRAG AREA */}
      <div
        className={`flex-1 overflow-hidden relative flex items-center justify-center p-8 select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp} // Stops dragging if mouse leaves the box
      >
        <div
          className="relative w-full h-full transition-transform ease-out"
          // We apply the translation (pan), THEN scale, THEN rotation. Order matters!
          // We remove the transition duration while dragging so it sticks to the mouse perfectly
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transitionDuration: isDragging ? "0ms" : "300ms",
          }}
        >
          <Image
            src={imgSrc}
            alt={alt}
            fill
            className="object-contain pointer-events-none" // pointer-events-none stops browser's native drag
            draggable={false} // Crucial to prevent "ghost image" dragging
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            unoptimized={imgSrc === FALLBACK_IMAGE}
          />
        </div>
      </div>
    </div>
  );
}
