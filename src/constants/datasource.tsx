import { BookingType } from "@/lib/schemas/booking";
import { FleetPartnerProfileType } from "@/lib/schemas/car-owner";

export const dummyFleetPartners: FleetPartnerProfileType[] = [
  {
    car_owner_id: "co-101",
    user_id: "u-001",
    business_name: "Ormoc City Transport Co.",
    partner_name: "Juan Dela Cruz",
    email: "juan@ormoctransport.com",
    phone_number: "0917-123-4567",

    verification_status: "verified",
    active_status: true,
    revenue_share_percentage: 70, // 70% to owner
    total_units: 5,

    payment_details: "GCash: 0917-123-4567",
    owner_notes: "Preferred partner for airport transfers.",
    created_at: new Date("2024-01-15"),
  },
  {
    car_owner_id: "co-102",
    user_id: "u-002",
    business_name: "Lina's Rentals",
    partner_name: "Lina Santos  ",
    email: "lina.santos@gmail.com",
    phone_number: "0918-987-6543",

    verification_status: "pending",
    active_status: false,
    revenue_share_percentage: 60,
    total_units: 1,

    payment_details: "BDO: 0012-3456-7890",
    owner_notes: "Pending updated vehicle registration documents.",
    created_at: new Date("2025-10-05"),
  },
  {
    car_owner_id: "co-103",
    user_id: "u-003",
    business_name: "Speedy Wheels",
    partner_name: "Mark Uy",
    email: "mark.uy@speedy.ph",
    phone_number: "0920-555-4444",

    verification_status: "rejected",
    active_status: false,
    revenue_share_percentage: 65,
    total_units: 0,

    payment_details: "Maya: 0920-555-4444",
    owner_notes: "Rejected due to expired business permit.",
    created_at: new Date("2025-08-20"),
  },
];

export let timelineResourceData: Object[] = [
  {
    Id: 1,
    Subject: "Car Rental - Toyota Vios",
    StartTime: new Date(2024, 10, 11, 9, 0),
    EndTime: new Date(2024, 10, 12, 9, 0),
    IsAllDay: false,
  },
  {
    Id: 2,
    Subject: "Car Rental - Honda Civic",
    StartTime: new Date(2024, 10, 11, 14, 0),
    EndTime: new Date(2024, 10, 13, 14, 0),
    IsAllDay: false,
  },
];

export const dummyBookings: BookingType[] = [
  {
    booking_id: "101",
    user_id: "u-001",
    car_id: "c-123",
    driver_id: null, // Self-drive
    pickup_location: "Ormoc City Port",
    dropoff_location: "Sabin Resort Hotel",
    start_date: new Date("2025-10-15T09:00:00"),
    end_date: new Date("2025-10-17T18:00:00"),
    booking_status: "confirmed",
    payment_method: "cash",
    created_at: new Date("2025-10-01T08:30:00"),
    last_updated_at: new Date("2025-10-02T10:00:00"),
  },
  {
    booking_id: "102",
    user_id: "u-002",
    car_id: "c-456",
    driver_id: "d-55", // With Driver
    pickup_location: "Robinsons Place Ormoc",
    dropoff_location: "Tacloban City Airport",
    start_date: new Date("2025-11-01T06:00:00"),
    end_date: new Date("2025-11-01T14:00:00"),
    booking_status: "completed",
    payment_method: "cash",
    created_at: new Date("2025-10-28T14:15:00"),
    last_updated_at: new Date("2025-11-01T15:00:00"),
  },
  {
    booking_id: "103",
    user_id: "u-003",
    car_id: "c-789",
    driver_id: null,
    pickup_location: "SM Center Ormoc",
    dropoff_location: "SM Center Ormoc",
    start_date: new Date("2025-12-05T10:00:00"),
    end_date: new Date("2025-12-08T10:00:00"),
    booking_status: "active",
    payment_method: "credit_card",
    created_at: new Date("2025-10-28T14:15:00"),
    last_updated_at: new Date("2025-11-01T15:00:00"),
  },
  {
    booking_id: "104",
    user_id: "u-004",
    car_id: "c-321",
    driver_id: "d-21",
    pickup_location: "Ormoc Villa Hotel",
    dropoff_location: "Lake Danao National Park",
    start_date: new Date("2025-12-20T08:00:00"),
    end_date: new Date("2025-12-20T17:00:00"),
    booking_status: "pending",
    payment_method: "paypal",
    created_at: new Date("2025-12-19T23:00:00"),
    last_updated_at: new Date("2025-12-19T23:00:00"),
  },
  {
    booking_id: "105",
    user_id: "u-005",
    car_id: "c-654",
    driver_id: null,
    pickup_location: "Ormoc City Terminal",
    dropoff_location: "Ormoc City Terminal",
    start_date: new Date("2025-09-10T13:00:00"),
    end_date: new Date("2025-09-12T13:00:00"),
    booking_status: "cancelled",
    payment_method: "cash",
    created_at: new Date("2025-09-01T11:20:00"),
    last_updated_at: new Date("2025-09-09T08:00:00"),
  },
];
