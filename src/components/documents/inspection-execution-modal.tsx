"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  X,
  Save,
  Eraser,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInspectionChecklist } from "@/actions/docs-mutations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type InspectionExecutionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
  blueprintUrl?: string; // Passed down from your template settings
};

export default function InspectionExecutionModal({
  isOpen,
  onClose,
  inspection,
  blueprintUrl = "/default-car-outline.png",
}: InspectionExecutionModalProps) {
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState<any[]>([]);

  // --- CANVAS STATE (Digital Glass) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Undo/Redo Stacks (stores base64 snapshots of the canvas)
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  useEffect(() => {
    if (isOpen && inspection?.checklist_data) {
      setChecklist(inspection.checklist_data);
      setTimeout(initCanvas, 300); // Wait for DOM to expand
    }
  }, [isOpen, inspection]);

  // --- CANVAS LOGIC ---
  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Match canvas size to the full scrollable container size
    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#2563eb"; // Blue pen color for visibility
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    saveState(); // Save initial blank state
  };

  const saveState = () => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      restoreState(history[historyStep - 1]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      restoreState(history[historyStep + 1]);
    }
  };

  const restoreState = (base64: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = base64;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Drawing Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Calculate scale in case the canvas CSS size differs from its internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on mobile while drawing
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  // --- SAVE LOGIC ---
  const saveMutation = useMutation({
    mutationFn: async () => {
      const scribbleDataUrl = canvasRef.current?.toDataURL("image/png");

      const finalPayload = {
        checklist_data: checklist,
        images: {
          markup_layer: scribbleDataUrl,
          blueprint_bg: blueprintUrl, // Save the reference so the PDF generator knows what background to use
        },
      };

      return updateInspectionChecklist(inspection.inspection_id, finalPayload);
    },
    onSuccess: () => {
      toast.success("Inspection locked and saved.");
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      onClose();
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  if (!inspection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 h-[90vh] flex flex-col border-border bg-background shadow-2xl rounded-2xl transition-colors">
        {/* HEADER & TOOLS */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase">
                Digital Inspection
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Canvas Tools */}
          <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg w-max">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="h-7 px-2 text-[10px] uppercase"
            >
              <Undo className="w-3.5 h-3.5 mr-1" /> Undo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="h-7 px-2 text-[10px] uppercase"
            >
              <Redo className="w-3.5 h-3.5 mr-1" /> Redo
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              className="h-7 px-2 text-[10px] uppercase text-destructive hover:text-destructive"
            >
              <Eraser className="w-3.5 h-3.5 mr-1" /> Clear Ink
            </Button>
          </div>
        </DialogHeader>

        {/* THE DIGITAL PAPER (Scrollable Container) */}
        <div
          className="flex-1 overflow-y-auto relative custom-scrollbar bg-white"
          ref={containerRef}
        >
          {/* THE GLASS OVERLAY */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-50 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* THE UNDERLYING FORM (Matches your uploaded image) */}
          <div className="p-8 max-w-2xl mx-auto space-y-10 select-none">
            <h1 className="text-center text-xl font-bold text-black uppercase tracking-widest mb-6">
              Vehicle Checklist
            </h1>

            {/* Dynamic Checklist Table */}
            <div className="border-2 border-black rounded-sm overflow-hidden">
              {checklist.map((category, catIdx) => (
                <div key={category.categoryId}>
                  <div className="bg-gray-100 border-b border-black p-2 text-xs font-bold uppercase text-black">
                    {category.categoryName}
                  </div>
                  {category.items.map((item: any, idx: number) => (
                    <div
                      key={item.itemId}
                      className={cn(
                        "grid grid-cols-[1fr_80px] text-sm text-black",
                        idx !== category.items.length - 1 &&
                          "border-b border-gray-300",
                      )}
                    >
                      <div className="p-2 border-r border-black">
                        {item.label}
                      </div>
                      <div className="p-2"></div>{" "}
                      {/* Empty space for them to draw a checkmark */}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Signatures */}
            <div className="flex justify-center gap-10 text-sm font-bold text-black mt-8">
              <div className="flex flex-col items-center">
                <span>Checked by: _______________________</span>
                <span className="mt-4">Date: _______________________</span>
              </div>
            </div>

            {/* The Blueprint */}
            <div className="mt-12 flex justify-center">
              <img
                src={blueprintUrl}
                alt="Car Blueprint"
                className="w-full max-w-lg opacity-80 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-end z-50">
          <Button
            className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-2" />
            )}
            Save & Lock Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
