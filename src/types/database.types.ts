export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_charges: {
        Row: {
          amount: number
          booking_id: string
          category: string
          charge_id: string
          created_at: string | null
          description: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          category: string
          charge_id?: string
          created_at?: string | null
          description?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          category?: string
          charge_id?: string
          created_at?: string | null
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_charges_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      booking_contracts: {
        Row: {
          booking_id: string
          contract_html: string | null
          contract_id: string
          contract_pdf_url: string | null
          created_at: string | null
          customer_signature_url: string | null
          is_signed: boolean | null
          signed_at: string | null
        }
        Insert: {
          booking_id: string
          contract_html?: string | null
          contract_id?: string
          contract_pdf_url?: string | null
          created_at?: string | null
          customer_signature_url?: string | null
          is_signed?: boolean | null
          signed_at?: string | null
        }
        Update: {
          booking_id?: string
          contract_html?: string | null
          contract_id?: string
          contract_pdf_url?: string | null
          created_at?: string | null
          customer_signature_url?: string | null
          is_signed?: boolean | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_contracts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      booking_driver_assignments: {
        Row: {
          assignment_id: string
          booking_id: string
          created_at: string | null
          driver_id: string
          last_updated_at: string | null
          shift_end: string
          shift_start: string
          status: string | null
        }
        Insert: {
          assignment_id?: string
          booking_id: string
          created_at?: string | null
          driver_id: string
          last_updated_at?: string | null
          shift_end: string
          shift_start: string
          status?: string | null
        }
        Update: {
          assignment_id?: string
          booking_id?: string
          created_at?: string | null
          driver_id?: string
          last_updated_at?: string | null
          shift_end?: string
          shift_start?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_driver_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["driver_id"]
          },
        ]
      }
      booking_inspections: {
        Row: {
          booking_id: string
          checklist_data: Json | null
          conducted_by: string | null
          created_at: string | null
          fuel_level: string | null
          images: Json | null
          inspection_id: string
          notes: string | null
          odometer_reading: number | null
          type: string
        }
        Insert: {
          booking_id: string
          checklist_data?: Json | null
          conducted_by?: string | null
          created_at?: string | null
          fuel_level?: string | null
          images?: Json | null
          inspection_id?: string
          notes?: string | null
          odometer_reading?: number | null
          type: string
        }
        Update: {
          booking_id?: string
          checklist_data?: Json | null
          conducted_by?: string | null
          created_at?: string | null
          fuel_level?: string | null
          images?: Json | null
          inspection_id?: string
          notes?: string | null
          odometer_reading?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_inspections_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_inspections_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      booking_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          booking_id: string
          created_at: string | null
          log_id: string
          message: string
          metadata: Json | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          booking_id: string
          created_at?: string | null
          log_id?: string
          message: string
          metadata?: Json | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          booking_id?: string
          created_at?: string | null
          log_id?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "booking_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          paid_at: string | null
          payment_id: string
          payment_method: string | null
          status: string | null
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          paid_at?: string | null
          payment_id?: string
          payment_method?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          paid_at?: string | null
          payment_id?: string
          payment_method?: string | null
          status?: string | null
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_return_date: string | null
          base_rate_snapshot: number
          booking_id: string
          booking_status: string
          buffer_duration: number | null
          car_id: string
          created_at: string | null
          driver_id: string | null
          dropoff_coordinates: string | null
          dropoff_location: string
          dropoff_price: number | null
          dropoff_type: string | null
          end_date: string
          group_id: string | null
          is_archived: boolean | null
          is_with_driver: boolean | null
          last_updated_at: string | null
          notes: string | null
          owner_payout_id: string | null
          owner_payout_status: string | null
          parent_booking_id: string | null
          payment_status: string | null
          pickup_coordinates: string | null
          pickup_location: string
          pickup_price: number | null
          pickup_type: string | null
          security_deposit: number | null
          start_date: string
          total_price: number
          user_id: string
        }
        Insert: {
          actual_return_date?: string | null
          base_rate_snapshot: number
          booking_id?: string
          booking_status: string
          buffer_duration?: number | null
          car_id: string
          created_at?: string | null
          driver_id?: string | null
          dropoff_coordinates?: string | null
          dropoff_location: string
          dropoff_price?: number | null
          dropoff_type?: string | null
          end_date: string
          group_id?: string | null
          is_archived?: boolean | null
          is_with_driver?: boolean | null
          last_updated_at?: string | null
          notes?: string | null
          owner_payout_id?: string | null
          owner_payout_status?: string | null
          parent_booking_id?: string | null
          payment_status?: string | null
          pickup_coordinates?: string | null
          pickup_location: string
          pickup_price?: number | null
          pickup_type?: string | null
          security_deposit?: number | null
          start_date: string
          total_price: number
          user_id: string
        }
        Update: {
          actual_return_date?: string | null
          base_rate_snapshot?: number
          booking_id?: string
          booking_status?: string
          buffer_duration?: number | null
          car_id?: string
          created_at?: string | null
          driver_id?: string | null
          dropoff_coordinates?: string | null
          dropoff_location?: string
          dropoff_price?: number | null
          dropoff_type?: string | null
          end_date?: string
          group_id?: string | null
          is_archived?: boolean | null
          is_with_driver?: boolean | null
          last_updated_at?: string | null
          notes?: string | null
          owner_payout_id?: string | null
          owner_payout_status?: string | null
          parent_booking_id?: string | null
          payment_status?: string | null
          pickup_coordinates?: string | null
          pickup_location?: string
          pickup_price?: number | null
          pickup_type?: string | null
          security_deposit?: number | null
          start_date?: string
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "bookings_owner_payout_id_fkey"
            columns: ["owner_payout_id"]
            isOneToOne: false
            referencedRelation: "owner_payouts"
            referencedColumns: ["payout_id"]
          },
          {
            foreignKeyName: "bookings_parent_booking_id_fkey"
            columns: ["parent_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      car_features: {
        Row: {
          car_feature_id: string
          car_id: string
          feature_id: string
          is_archived: boolean | null
        }
        Insert: {
          car_feature_id?: string
          car_id: string
          feature_id: string
          is_archived?: boolean | null
        }
        Update: {
          car_feature_id?: string
          car_id?: string
          feature_id?: string
          is_archived?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "car_features_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "car_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["feature_id"]
          },
        ]
      }
      car_images: {
        Row: {
          car_id: string
          car_image_id: string
          created_at: string | null
          image_url: string
          is_archived: boolean | null
          is_primary: boolean | null
          storage_path: string | null
        }
        Insert: {
          car_id: string
          car_image_id?: string
          created_at?: string | null
          image_url: string
          is_archived?: boolean | null
          is_primary?: boolean | null
          storage_path?: string | null
        }
        Update: {
          car_id?: string
          car_image_id?: string
          created_at?: string | null
          image_url?: string
          is_archived?: boolean | null
          is_primary?: boolean | null
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
        ]
      }
      car_owner: {
        Row: {
          active_status: boolean
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_name: string
          car_owner_id: string
          contract_expiry_date: string | null
          created_at: string
          is_archived: boolean | null
          last_updated_at: string
          owner_notes: string | null
          revenue_share_percentage: number
          total_lifetime_earnings: number | null
          user_id: string
          verification_status: string
          wallet_balance: number | null
        }
        Insert: {
          active_status?: boolean
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name: string
          car_owner_id?: string
          contract_expiry_date?: string | null
          created_at?: string
          is_archived?: boolean | null
          last_updated_at?: string
          owner_notes?: string | null
          revenue_share_percentage: number
          total_lifetime_earnings?: number | null
          user_id: string
          verification_status?: string
          wallet_balance?: number | null
        }
        Update: {
          active_status?: boolean
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string
          car_owner_id?: string
          contract_expiry_date?: string | null
          created_at?: string
          is_archived?: boolean | null
          last_updated_at?: string
          owner_notes?: string | null
          revenue_share_percentage?: number
          total_lifetime_earnings?: number | null
          user_id?: string
          verification_status?: string
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "car_owner_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      car_specifications: {
        Row: {
          body_type: string
          created_at: string | null
          engine_type: string
          fuel_type: string
          is_archived: boolean | null
          last_updated_at: string | null
          luggage_capacity: number
          name: string
          passenger_capacity: number
          spec_id: string
          transmission: string
        }
        Insert: {
          body_type: string
          created_at?: string | null
          engine_type: string
          fuel_type: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          luggage_capacity?: number
          name?: string
          passenger_capacity: number
          spec_id?: string
          transmission: string
        }
        Update: {
          body_type?: string
          created_at?: string | null
          engine_type?: string
          fuel_type?: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          luggage_capacity?: number
          name?: string
          passenger_capacity?: number
          spec_id?: string
          transmission?: string
        }
        Relationships: []
      }
      cars: {
        Row: {
          availability_status: string | null
          brand: string
          car_id: string
          car_owner_id: string
          color: string
          created_at: string | null
          current_mileage: number | null
          default_buffer_hours: number | null
          is_archived: boolean | null
          last_updated_at: string | null
          model: string
          plate_number: string
          rental_rate_per_day: number
          spec_id: string
          vin: string | null
          year: number
        }
        Insert: {
          availability_status?: string | null
          brand: string
          car_id?: string
          car_owner_id: string
          color: string
          created_at?: string | null
          current_mileage?: number | null
          default_buffer_hours?: number | null
          is_archived?: boolean | null
          last_updated_at?: string | null
          model: string
          plate_number: string
          rental_rate_per_day: number
          spec_id: string
          vin?: string | null
          year: number
        }
        Update: {
          availability_status?: string | null
          brand?: string
          car_id?: string
          car_owner_id?: string
          color?: string
          created_at?: string | null
          current_mileage?: number | null
          default_buffer_hours?: number | null
          is_archived?: boolean | null
          last_updated_at?: string | null
          model?: string
          plate_number?: string
          rental_rate_per_day?: number
          spec_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_car_owner_id_fkey"
            columns: ["car_owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner"
            referencedColumns: ["car_owner_id"]
          },
          {
            foreignKeyName: "cars_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "car_specifications"
            referencedColumns: ["spec_id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          document_id: string
          expiry_date: string | null
          file_name: string
          file_path: string
          file_type: string | null
          internal_notes: string | null
          rejection_reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          document_id?: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          internal_notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          document_id?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          internal_notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drivers: {
        Row: {
          assigned_car_id: string | null
          created_at: string | null
          display_id: string | null
          driver_id: string
          driver_status: string | null
          is_archived: boolean | null
          is_verified: boolean | null
          last_updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_car_id?: string | null
          created_at?: string | null
          display_id?: string | null
          driver_id?: string
          driver_status?: string | null
          is_archived?: boolean | null
          is_verified?: boolean | null
          last_updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_car_id?: string | null
          created_at?: string | null
          display_id?: string | null
          driver_id?: string
          driver_status?: string | null
          is_archived?: boolean | null
          is_verified?: boolean | null
          last_updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_car_id_fkey"
            columns: ["assigned_car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_id: string
          is_archived: boolean | null
          last_updated_at: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_id?: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_id?: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          name?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          car_id: string | null
          category: string
          created_at: string | null
          notes: string | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          transaction_date: string | null
          transaction_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          car_id?: string | null
          category: string
          created_at?: string | null
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          car_id?: string | null
          category?: string
          created_at?: string | null
          notes?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "financial_transactions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          car_id: string
          cost: number
          created_at: string | null
          description: string
          end_date: string
          last_updated_at: string | null
          maintenance_id: string
          owner_payout_id: string | null
          owner_payout_status: string | null
          paid_by: string
          receipt_url: string | null
          service_type: string
          start_date: string
          status: string | null
        }
        Insert: {
          car_id: string
          cost?: number
          created_at?: string | null
          description: string
          end_date: string
          last_updated_at?: string | null
          maintenance_id?: string
          owner_payout_id?: string | null
          owner_payout_status?: string | null
          paid_by?: string
          receipt_url?: string | null
          service_type: string
          start_date: string
          status?: string | null
        }
        Update: {
          car_id?: string
          cost?: number
          created_at?: string | null
          description?: string
          end_date?: string
          last_updated_at?: string | null
          maintenance_id?: string
          owner_payout_id?: string | null
          owner_payout_status?: string | null
          paid_by?: string
          receipt_url?: string | null
          service_type?: string
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["car_id"]
          },
          {
            foreignKeyName: "maintenance_logs_owner_payout_id_fkey"
            columns: ["owner_payout_id"]
            isOneToOne: false
            referencedRelation: "owner_payouts"
            referencedColumns: ["payout_id"]
          },
        ]
      }
      owner_payouts: {
        Row: {
          car_owner_id: string
          commission_deducted: number
          created_at: string | null
          net_payout: number
          paid_at: string | null
          payout_id: string
          period_end: string
          period_start: string
          status: string | null
          total_revenue: number
          transaction_id: string | null
        }
        Insert: {
          car_owner_id: string
          commission_deducted?: number
          created_at?: string | null
          net_payout?: number
          paid_at?: string | null
          payout_id?: string
          period_end: string
          period_start: string
          status?: string | null
          total_revenue?: number
          transaction_id?: string | null
        }
        Update: {
          car_owner_id?: string
          commission_deducted?: number
          created_at?: string | null
          net_payout?: number
          paid_at?: string | null
          payout_id?: string
          period_end?: string
          period_start?: string
          status?: string | null
          total_revenue?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_payouts_car_owner_id_fkey"
            columns: ["car_owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner"
            referencedColumns: ["car_owner_id"]
          },
          {
            foreignKeyName: "owner_payouts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["transaction_id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: number
          key: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          account_status: string | null
          address: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          is_archived: boolean | null
          last_active_at: string | null
          last_name: string | null
          last_updated_at: string | null
          license_number: string | null
          phone_number: string | null
          profile_picture_url: string | null
          rejection_reason: string | null
          role: string | null
          trust_score: number | null
          user_id: string
        }
        Insert: {
          account_status?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          is_archived?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          last_updated_at?: string | null
          license_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          rejection_reason?: string | null
          role?: string | null
          trust_score?: number | null
          user_id: string
        }
        Update: {
          account_status?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          is_archived?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          last_updated_at?: string | null
          license_number?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          rejection_reason?: string | null
          role?: string | null
          trust_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_booking_v1: {
        Args: {
          p_base_rate_snapshot: number
          p_car_id: string
          p_charges_json: Json
          p_contract_html?: string
          p_dropoff_coordinates: string
          p_dropoff_loc: string
          p_dropoff_price: number
          p_dropoff_type: string
          p_end_date: string
          p_initial_payment_json: Json
          p_inspection_template?: Json
          p_is_with_driver: boolean
          p_pickup_coordinates: string
          p_pickup_loc: string
          p_pickup_price: number
          p_pickup_type: string
          p_security_deposit: number
          p_start_date: string
          p_user_id: string
        }
        Returns: string
      }
      admin_update_booking_v1: {
        Args: {
          p_base_rate_snapshot: number
          p_booking_id: string
          p_car_id: string
          p_charges_json: Json
          p_dropoff_coordinates: string
          p_dropoff_loc: string
          p_dropoff_price: number
          p_dropoff_type: string
          p_end_date: string
          p_is_with_driver: boolean
          p_new_payment_json: Json
          p_pickup_coordinates: string
          p_pickup_loc: string
          p_pickup_price: number
          p_pickup_type: string
          p_security_deposit: number
          p_start_date: string
          p_user_id: string
        }
        Returns: undefined
      }
      delete_unit_v1: { Args: { p_car_id: string }; Returns: undefined }
      generate_drv_id_v2: { Args: never; Returns: string }
      generate_owner_payout: {
        Args: { p_end_date: string; p_owner_id: string; p_start_date: string }
        Returns: string
      }
      get_chart_analytics: { Args: { p_timeframe: string }; Returns: Json }
      get_collection_queue: {
        Args: never
        Returns: {
          car: string
          customer: string
          due: number
          id: string
          is_overdue: boolean
          status: string
        }[]
      }
      get_dashboard_summary: { Args: never; Returns: Json }
      get_detailed_bookings: {
        Args: {
          p_page_number?: number
          p_page_size?: number
          p_status?: string
        }
        Returns: {
          booking_id: string
          car_image: string
          car_name: string
          car_plate: string
          created_at: string
          customer_avatar: string
          customer_email: string
          customer_name: string
          driver_name: string
          end_date: string
          payment_status: string
          start_date: string
          status: string
          total_price: number
        }[]
      }
      get_dispatch_availability: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      get_financial_kpis: { Args: never; Returns: Json }
      get_global_financial_kpis: { Args: never; Returns: Json }
      get_income_kpis: { Args: never; Returns: Json }
      get_master_report_data: {
        Args: {
          p_end_date: string
          p_partner_id?: string
          p_start_date: string
        }
        Returns: Json
      }
      get_quick_insights: { Args: never; Returns: Json }
      get_scheduler_view: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: Json
      }
      get_unsettled_fleet_revenue: {
        Args: never
        Returns: {
          est_owed: number
          owner_id: string
          owner_name: string
          unsettled_count: number
          vehicles: number
        }[]
      }
      log_manual_expense: {
        Args: {
          p_amount: number
          p_booking_id?: string
          p_car_id?: string
          p_category: string
          p_charge_to_owner?: boolean
          p_notes: string
        }
        Returns: string
      }
      mark_payout_paid: { Args: { p_payout_id: string }; Returns: undefined }
      process_early_return: {
        Args: {
          p_booking_id: string
          p_final_price: number
          p_new_end_date: string
          p_refund_amount: number
          p_should_refund: boolean
        }
        Returns: undefined
      }
      refund_security_deposit: {
        Args: {
          p_amount: number
          p_booking_id: string
          p_method: string
          p_reference: string
        }
        Returns: undefined
      }
      reject_document: {
        Args: { p_document_id: string; p_reason: string }
        Returns: undefined
      }
      revoke_document: { Args: { p_document_id: string }; Returns: undefined }
      save_booking_v1: {
        Args: {
          p_base_rate_snapshot?: number
          p_booking_id?: string
          p_booking_status?: string
          p_car_id?: string
          p_driver_id?: string
          p_dropoff_coordinates?: string
          p_dropoff_location?: string
          p_end_date?: string
          p_notes?: string
          p_payment_status?: string
          p_pickup_coordinates?: string
          p_pickup_location?: string
          p_security_deposit?: number
          p_start_date?: string
          p_total_price?: number
          p_user_id?: string
        }
        Returns: undefined
      }
      save_driver_v1: {
        Args: {
          p_driver_status: string
          p_first_name: string
          p_full_name: string
          p_is_verified: boolean
          p_last_name: string
          p_license_expiry_date: string
          p_license_number: string
          p_phone_number: string
          p_user_id: string
        }
        Returns: undefined
      }
      save_unit_v1: {
        Args: {
          p_availability_status: string
          p_brand: string
          p_car_id: string
          p_car_owner_id: string
          p_color: string
          p_current_mileage: number
          p_features: Json
          p_images: Json
          p_model: string
          p_plate_number: string
          p_rental_rate_per_day: number
          p_spec_id: string
          p_vin: string
          p_year: number
        }
        Returns: string
      }
      split_booking: {
        Args: { p_booking_id: string; p_split_date: string }
        Returns: undefined
      }
      sync_client_profile: {
        Args: {
          p_account_status: string
          p_address: string
          p_email: string
          p_first_name: string
          p_full_name: string
          p_last_name: string
          p_license_expiry: string
          p_license_number: string
          p_phone_number: string
          p_profile_picture_url: string
          p_role: string
          p_trust_score: number
          p_user_id: string
          p_valid_id_expiry: string
        }
        Returns: undefined
      }
      verify_document: {
        Args: { p_document_id: string; p_expiry_date?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
