"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Download,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useUpsertInspection } from "../../../hooks/use-documents";
import { generateInspectionPDF } from "@/utils/export-pdf";
import { cn } from "@/lib/utils";

type InspectionExecutionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
  blueprintUrl?: string;
  bookingDetails?: any;
};

export default function InspectionExecutionModal({
  isOpen,
  onClose,
  inspection,
  blueprintUrl = "/default-car-outline.png",
  bookingDetails,
}: InspectionExecutionModalProps) {
  const [checklist, setChecklist] = useState<any[]>([]);

  // --- CANVAS STATE (Digital Glass) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const existingDrawingUrl = inspection?.images?.markup_layer;
  const { saveInspection, isSaving } = useUpsertInspection();

  // --- CANVAS LOGIC ---
  const saveState = useCallback(() => {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // 2. Define initCanvas SECOND, so it can use saveState
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (existingDrawingUrl) {
      const img = new window.Image();
      img.src = existingDrawingUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveState();
      };
    } else {
      saveState();
    }
  }, [existingDrawingUrl, saveState]); // Now this dependency array works perfectly!

  useEffect(() => {
    if (isOpen && inspection?.checklist_data) {
      setChecklist(inspection.checklist_data);
      setTimeout(initCanvas, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, inspection]);

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

    const img = new window.Image();
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
    e.preventDefault();
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
  const handleSave = async () => {
    const scribbleDataUrl = canvasRef.current?.toDataURL("image/png");

    const finalPayload = {
      checklist_data: checklist,
      images: {
        markup_layer: scribbleDataUrl,
        blueprint_bg: blueprintUrl,
      },
    };

    try {
      await saveInspection({
        inspectionId: inspection.inspection_id,
        bookingId: inspection.booking_id,
        type: inspection.type,
        payload: finalPayload,
      });
      toast.success(`${inspection.type} Inspection locked and saved.`);
      onClose();
    } catch {
      // Handled by hook
    }
  };

  // --- EXPORT PDF DELEGATION ---
  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    toast.loading("Generating Aligned PDF...", { id: "pdf-toast" });
    try {
      await generateInspectionPDF(
        inspection,
        bookingDetails,
        containerRef.current,
      );
      toast.success("PDF Downloaded!", { id: "pdf-toast" });
    } catch {
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    }
  };

  if (!inspection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 h-[90vh] flex flex-col border-border bg-background shadow-2xl rounded-2xl transition-colors">
        {/* HEADER & TOOLS */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase">
                {inspection.type} Digital Inspection
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {existingDrawingUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  className="h-8 px-3 text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

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

        {/* THE DIGITAL PAPER */}
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

          {/* THE UNDERLYING FORM - Tighter layout for PDF */}
          <div className="p-6 max-w-2xl mx-auto space-y-6 select-none pointer-events-none">
            <h1 className="text-center text-lg font-bold text-black uppercase tracking-widest mb-4">
              Vehicle {inspection.type} Checklist
            </h1>

            <div
              id="pdf-checklist-section"
              className="border-2 border-black rounded-sm overflow-hidden bg-white"
            >
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px] bg-gray-200 border-b-2 border-black p-1.5 text-[11px] font-black uppercase text-black tracking-widest">
                <div className="pl-1">Checklist Item</div>
                <div className="text-center border-l border-black">
                  Mark ( ✔ / ✖ )
                </div>
              </div>

              {checklist.map((category) => (
                <div key={category.categoryId}>
                  <div className="bg-gray-100 border-y border-black p-1.5 text-[9px] font-black uppercase text-gray-700 tracking-widest">
                    {category.categoryName}
                  </div>
                  {category.items.map((item: any, idx: number) => (
                    <div
                      key={item.itemId}
                      className={cn(
                        "grid grid-cols-[1fr_120px] text-xs text-black",
                        idx !== category.items.length - 1 &&
                          "border-b border-gray-300",
                      )}
                    >
                      <div className="p-1.5 pl-2 border-r border-black font-medium flex items-center">
                        {item.label}
                      </div>
                      {/* Blank drawing space */}
                      <div className="h-7 bg-white"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* BLUEPRINT SECTION - With explicit ID for measurement */}
            <div
              id="pdf-blueprint-section"
              className="flex flex-col items-center w-full mt-20"
            >
              {blueprintUrl && (
                <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex flex-col items-center w-full">
                  <h2 className="text-[11px] font-black text-black uppercase tracking-widest mb-4">
                    Vehicle Damage Markup
                  </h2>
                  <Image
                    src={blueprintUrl}
                    alt="Car Blueprint"
                    crossOrigin="anonymous"
                    className="w-full max-w-[450px] opacity-80"
                  />
                </div>
              )}

              <div className="flex justify-between w-full px-8 text-xs font-bold text-black pt-12 pb-4">
                <div className="flex flex-col items-center">
                  <span className="w-40 border-b border-black inline-block mb-2"></span>
                  <span>Inspector Signature</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-40 border-b border-black inline-block mb-2"></span>
                  <span>Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-end z-50">
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
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
