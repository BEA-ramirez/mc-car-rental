export interface CreateBookingPayload {
  car_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_type: "hub" | "custom";
  dropoff_type: "hub" | "custom";
  pickup_price: number;
  dropoff_price: number;
  is_with_driver: boolean;
  daily_rate: number;
  grand_total: number;
  security_deposit: number;
  pickup_coords: string | null;
  dropoff_coords: string | null;
  booking_status: string; // Or strict union: "CONFIRMED" | "PENDING"
  payment_status: string;
  is12HourPromo: boolean;
  car12HourRate: number;
  carDailyRate: number;
  payment_details: {
    amount: number;
    transaction_reference: string;
    status: string;
    receipt_url: string;
  };
}
