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

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const newWidth = container.scrollWidth;
    const newHeight = container.scrollHeight;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }

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
    } else if (history.length === 0) {
      saveState();
    }
  }, [existingDrawingUrl, saveState, history.length]);

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
      <DialogContent className="!max-w-7xl w-[65vw]! p-0 h-[90vh] flex flex-col border-border bg-background shadow-2xl rounded-2xl transition-colors [&>button.absolute]:hidden">
        {/* --- CLEANED HEADER --- */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase leading-none mb-1">
                {inspection.type} Inspection
              </DialogTitle>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Digital Assessment Record
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Canvas Tools Group */}
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg p-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyStep <= 0}
                className="h-7 px-2.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <Undo className="w-3 h-3 mr-1.5" /> Undo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                className="h-7 px-2.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <Redo className="w-3 h-3 mr-1.5" /> Redo
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCanvas}
                className="h-7 px-2.5 text-[9px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Eraser className="w-3 h-3 mr-1.5" /> Clear
              </Button>
            </div>

            {/* Export & Close Group */}
            {existingDrawingUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="h-9 px-3 text-[9px] uppercase font-bold text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors shadow-none"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            >
              <X className="w-4 h-4" />
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
                    width={450}
                    height={300}
                    className="w-full max-w-[450px] h-auto opacity-80"
                    onLoad={initCanvas}
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
        <div className="bg-card border-t border-border p-4 shrink-0 flex gap-3 justify-end z-50 transition-colors">
          <Button
            variant="outline"
            className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest shadow-none rounded-lg hover:bg-secondary transition-colors"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
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
