"use client";

import React, { useState, useRef } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  UploadCloud,
  X,
  User,
  FileText,
  Calendar as CalendarIcon,
  Check,
  FileUp,
  Link,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDropdownData,
  useDocumentMutations,
} from "../../../hooks/use-documents";

const DOC_TYPES = [
  { value: "DRIVER_LICENSE", label: "Driver's License" },
  { value: "GOVT_ID", label: "Government ID" },
  { value: "PROOF_OF_BILLING", label: "Proof of Billing" },
  { value: "RENTAL_AGREEMENT", label: "Signed Rental Agreement" },
  { value: "DAMAGE_REPORT", label: "Vehicle Damage Report" },
  { value: "OTHER", label: "Other / Misc" },
];

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  // Live Database Hooks
  const { customers, bookings } = useDropdownData();
  const { uploadDoc } = useDocumentMutations();

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [docType, setDocType] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedUser("");
      setDocType("");
      setSelectedBooking("");
      setExpiryDate(undefined);
      setFile(null);
    }
  }, [isOpen]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      setFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !selectedUser || !docType) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", selectedUser);
    formData.append("docType", docType);
    if (selectedBooking) formData.append("bookingId", selectedBooking);
    if (expiryDate) formData.append("expiryDate", expiryDate.toISOString());

    uploadDoc.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const requiresBooking =
    docType === "RENTAL_AGREEMENT" || docType === "DAMAGE_REPORT";
  const isFormValid =
    selectedUser && docType && file && (!requiresBooking || selectedBooking);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Upload Document
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 leading-none">
                Manually add a document to the registry.
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
            disabled={uploadDoc.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-5 bg-slate-50 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" /> Customer
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between h-9 text-xs bg-white border-slate-200 focus:ring-1 focus:ring-blue-500 rounded-sm shadow-sm",
                    !selectedUser && "text-muted-foreground",
                  )}
                  disabled={customers.isLoading}
                >
                  <span className="truncate font-medium">
                    {customers.isLoading
                      ? "Loading customers..."
                      : selectedUser
                        ? customers.data?.find(
                            (u: any) => u.user_id === selectedUser,
                          )?.full_name
                        : "Search customer..."}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[460px] p-0 border-slate-200 shadow-xl rounded-sm"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search name or email..."
                    className="text-xs h-9"
                  />
                  <CommandList>
                    <CommandEmpty className="text-xs py-4 text-center text-slate-500">
                      No customer found.
                    </CommandEmpty>
                    <CommandGroup>
                      {customers.data?.map((user: any) => (
                        <CommandItem
                          key={user.user_id}
                          value={user.full_name || ""}
                          onSelect={() => setSelectedUser(user.user_id)}
                          className="py-2 cursor-pointer rounded-sm"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              user.user_id === selectedUser
                                ? "opacity-100 text-blue-600"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {user.full_name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 truncate">
                              {user.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Document Type
              </label>
              <Select
                value={docType}
                onValueChange={(val) => {
                  setDocType(val);
                  setSelectedBooking("");
                }}
              >
                <SelectTrigger className="h-9 text-xs bg-white border-slate-200 rounded-sm font-medium shadow-sm">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-slate-200 shadow-xl">
                  {DOC_TYPES.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-xs font-medium rounded-sm"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" /> Expiry Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-medium h-9 text-xs bg-white border-slate-200 rounded-sm shadow-sm",
                      !expiryDate && "text-slate-400",
                    )}
                    disabled={requiresBooking}
                  >
                    {expiryDate
                      ? format(expiryDate, "MMM d, yyyy")
                      : "Optional"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-slate-200 shadow-xl rounded-sm"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* DYNAMIC BOOKING LINK */}
          {requiresBooking && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Link className="w-3 h-3 text-blue-500" /> Link to Booking
                (Required)
              </label>
              <Select
                value={selectedBooking}
                onValueChange={setSelectedBooking}
                disabled={bookings.isLoading}
              >
                <SelectTrigger className="h-9 text-xs bg-white border-blue-200 ring-1 ring-blue-100 rounded-sm font-medium shadow-sm">
                  <SelectValue
                    placeholder={
                      bookings.isLoading
                        ? "Loading bookings..."
                        : "Select associated booking..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-slate-200 shadow-xl max-h-[200px]">
                  {bookings.data?.map((b: any) => (
                    <SelectItem
                      key={b.booking_id}
                      value={b.booking_id}
                      className="text-xs font-medium rounded-sm"
                    >
                      <span className="font-bold text-slate-700 mr-2">
                        {b.booking_id.split("-")[0]}
                      </span>
                      {b.cars?.brand} {b.cars?.model} (
                      {format(new Date(b.start_date), "MMM d")} -{" "}
                      {format(new Date(b.end_date), "MMM d")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileUp className="w-3 h-3" /> Upload File
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                file
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-400",
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
              />
              {file ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-emerald-800">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <UploadCloud className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">
                    PNG, JPG, or PDF (Max. 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 rounded-sm hover:text-slate-900 hover:bg-slate-100"
            onClick={onClose}
            disabled={uploadDoc.isPending}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-6 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm"
            disabled={!isFormValid || uploadDoc.isPending}
            onClick={handleSubmit}
          >
            {uploadDoc.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{" "}
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
