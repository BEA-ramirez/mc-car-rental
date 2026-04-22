"use client";

import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDriverDocuments } from "../../../hooks/use-drivers";
import { cn } from "@/lib/utils";

interface DriverDocsTabProps {
  driverId: string;
}

export default function DriverDocsTab({ driverId }: DriverDocsTabProps) {
  const {
    data: documents = [],
    isLoading,
    error,
  } = useDriverDocuments(driverId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-card border border-border rounded-xl transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Loading Documents...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-destructive/5 border border-destructive/20 rounded-xl transition-colors min-h-[200px]">
        <span className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">
          Error Loading Data
        </span>
        <span className="text-[11px] font-medium text-destructive/80">
          Failed to load driver documents. Please try again.
        </span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-background border border-dashed border-border rounded-xl p-8 text-center transition-colors">
        <FileText className="w-8 h-8 text-muted-foreground/30 mb-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          No Documents Found
        </span>
        <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium">
          This driver has not uploaded any documents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {documents.map((doc: any) => {
        // Determine styling based on dynamic status
        let statusColor = "bg-secondary";
        let textStatusColor = "text-muted-foreground";
        let StatusIcon = FileText;

        if (doc.status === "Valid") {
          statusColor = "bg-emerald-500/20";
          textStatusColor = "text-emerald-600 dark:text-emerald-400";
          StatusIcon = CheckCircle2;
        } else if (doc.status === "Rejected") {
          statusColor = "bg-destructive/20";
          textStatusColor = "text-destructive";
          StatusIcon = AlertCircle;
        } else if (doc.status === "Pending Review") {
          statusColor = "bg-amber-500/20";
          textStatusColor = "text-amber-600 dark:text-amber-400";
          StatusIcon = Clock;
        }

        return (
          <div
            key={doc.id}
            className="bg-card border border-border rounded-xl shadow-sm p-4 flex items-start justify-between transition-colors hover:border-primary/30"
          >
            <div className="flex items-start gap-3 min-w-0 pr-4">
              <div
                className={cn(
                  "w-1 h-9 rounded-full shrink-0 transition-colors",
                  statusColor,
                )}
              />
              <div className="min-w-0">
                <h4 className="text-[11px] font-bold text-foreground truncate uppercase tracking-wider mb-1">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-1.5">
                  <StatusIcon
                    className={cn("w-3 h-3 shrink-0", textStatusColor)}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest truncate",
                      textStatusColor,
                    )}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-[9px] text-muted-foreground/70 font-mono mt-1 truncate">
                  {doc.date}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest shadow-none rounded-lg shrink-0 border-border bg-background hover:bg-secondary text-foreground transition-colors"
              onClick={() => {
                if (doc.fileUrl) {
                  // If you store full URLs, this works. If you store Supabase storage paths,
                  // you may need to format it with your Supabase project URL here.
                  window.open(doc.fileUrl, "_blank");
                }
              }}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> View
            </Button>
          </div>
        );
      })}
    </div>
  );
}
