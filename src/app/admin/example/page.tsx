"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Car,
  User,
  MapPin,
  Clock,
  Banknote,
  FileText,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Printer,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  // TODO: Replace with your actual useBookingDetails(bookingId) hook
  const isLoading = false;
  const booking = {
    id: "BKG-98234",
    status: "CONFIRMED", // CONFIRMED, ONGOING, COMPLETED
    start_date: new Date(),
    end_date: new Date(Date.now() + 86400000 * 2),
    pickup_location: "Ormoc City Hub",
    dropoff_location: "Ormoc City Hub",
    total_price: 12000,
    amount_paid: 1200,
    security_deposit: 5000,
    customer: {
      name: "Ricardo Colina Jr",
      phone: "09458203223",
      email: "ricricjr@gmail.com",
    },
    car: {
      brand: "Toyota",
      model: "Vios",
      plate: "HAG 5723",
      image: "https://placehold.co/600x400",
    },
    driver: null, // Self-drive
    notes: "Customer arrives via ferry at 9AM.",
  };

  const balance = booking.total_price - booking.amount_paid;

  return (
    <div className="h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col transition-colors duration-300">
      {/* --- TOP HEADER --- */}
      <header className="px-4 py-3 sm:px-6 shrink-0 flex justify-between items-center border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 bg-secondary border border-border rounded text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
              <span>Bookings</span> <span className="opacity-50">/</span>{" "}
              <span className="text-primary">Details</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black tracking-tighter uppercase">
                {booking.id}
              </h1>
              <Badge
                variant="outline"
                className="text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20"
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-widest"
          >
            <Printer className="w-3.5 h-3.5 mr-2" /> Print Invoice
          </Button>
          <Button
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground"
          >
            <FileText className="w-3.5 h-3.5 mr-2" /> Edit Booking
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* === LEFT COLUMN: THE ENTITIES === */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* Customer Card */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Customer
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold">{booking.customer.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {booking.customer.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary"
                >
                  <Phone className="w-3 h-3 mr-1.5" /> Call
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary"
                >
                  <MessageSquare className="w-3 h-3 mr-1.5" /> SMS
                </Button>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center text-[10px] font-medium">
                <span className="text-muted-foreground">ID Verification</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Assigned Asset
              </h3>
              <div className="flex gap-3">
                <img
                  src={booking.car.image}
                  alt="Car"
                  className="w-16 h-12 object-cover rounded border border-border"
                />
                <div>
                  <p className="text-xs font-bold uppercase">
                    {booking.car.brand} {booking.car.model}
                  </p>
                  <p className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 mt-1 inline-block">
                    {booking.car.plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex-1">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Internal Notes
              </h3>
              <textarea
                className="w-full h-32 bg-secondary border border-border rounded-md p-2 text-xs text-foreground resize-none focus:ring-1 focus:ring-primary outline-none"
                defaultValue={booking.notes}
                placeholder="Add private admin notes here..."
              />
              <Button
                size="sm"
                className="w-full mt-2 h-7 text-[9px] font-bold uppercase tracking-widest"
              >
                Save Note
              </Button>
            </div>
          </div>

          {/* === RIGHT COLUMN: WORKFLOWS & FINANCE === */}
          <div className="xl:col-span-9 flex flex-col gap-4">
            {/* BIG ACTION BANNER: Changes based on booking status */}
            {booking.status === "CONFIRMED" && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h2 className="text-lg font-black uppercase text-primary tracking-tight flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Awaiting Vehicle
                    Handover
                  </h2>
                  <p className="text-xs text-primary/80 font-medium mt-1">
                    Customer arrives on{" "}
                    {format(booking.start_date, "MMM dd, yyyy")}. Complete
                    inspection to release.
                  </p>
                </div>
                {/* THIS BUTTON OPENS YOUR DIGITAL KIOSK MODAL */}
                <Button
                  size="lg"
                  className="shrink-0 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] h-12 px-8"
                >
                  Start Handover & Contract
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Financial Ledger */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Banknote className="w-3.5 h-3.5" /> Financial Ledger
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest text-primary"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Charge
                  </Button>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Base Rental Rate
                    </span>
                    <span>₱{booking.total_price.toLocaleString()}</span>
                  </div>
                  {/* Dynamic map of additional charges from booking_charges table goes here */}
                  <div className="flex justify-between text-emerald-500">
                    <span>Reservation Paid</span>
                    <span>- ₱{booking.amount_paid.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
                    <span className="font-bold uppercase tracking-widest text-[10px]">
                      Rental Balance Due
                    </span>
                    <span className="text-sm font-black text-primary">
                      ₱{balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-secondary/50 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> Security Deposit
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20"
                    >
                      Pending Collection
                    </Badge>
                  </div>
                  <p className="text-sm font-black">
                    ₱{booking.security_deposit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Logistics & Paperwork */}
              <div className="flex flex-col gap-4">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex-1">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 pb-3 border-b border-border">
                    Logistics & Documents
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Route
                        </p>
                        <p className="text-xs font-semibold">
                          {booking.pickup_location} → {booking.dropoff_location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Lease Contract
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[8px] uppercase">
                        Awaiting Signature
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Pre-Trip Inspection
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[8px] uppercase">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT TIMELINE (Using same style as Car Details Page) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm mt-auto">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Audit & Activity Log
              </h3>
              <div className="relative border-l border-border ml-2 space-y-4">
                <div className="relative pl-4">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-card border border-border flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-medium text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" /> <span>Just now</span>
                  </div>
                  <p className="text-[10px] font-medium leading-tight">
                    Payment of ₱1,200 verified by Admin.
                  </p>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-card border border-border flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-medium text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" /> <span>2 hours ago</span>
                  </div>
                  <p className="text-[10px] font-medium leading-tight">
                    Booking created by Customer via Web.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
