"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { DriverFormValues, driverFormSchema } from "@/lib/schemas/driver";
import {
  sendDriverRejectionEmail,
  sendDriverVerificationEmail,
} from "./helper/mail";
import { getPublicUrl } from "./helper/upload-file";

export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function saveDriver(data: DriverFormValues): Promise<ActionState> {
  // server-side validation
  const validatedFields = driverFormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please check the form for errors.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const validData = validatedFields.data;

    // Safety check: user_id is absolutely required
    if (!validData.user_id) {
      return {
        success: false,
        message: "A user ID is required to save a driver.",
      };
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(); // <-- NEW: Import and create the Admin Client

    // 1. Save operational data and update public.users via RPC
    const { error } = await supabase.rpc("save_driver_v1", {
      p_user_id: validData.user_id,
      p_driver_status: validData.driver_status || "PENDING",
      p_is_verified: validData.is_verified || false,
    });

    if (error) {
      console.error("RPC Error (Save Driver):", error);
      return {
        success: false,
        message: "Failed to save driver.",
      };
    }

    // 2. --- NEW: Sync Auth Metadata for RLS ---
    // This explicitly tells Supabase Auth that this user is now a driver
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      validData.user_id,
      {
        app_metadata: { role: "driver" },
        user_metadata: { role: "driver" }, // Keep user_metadata matching just in case
      },
    );

    if (authError) {
      console.error(
        "Warning: Driver saved in DB, but Auth metadata sync failed:",
        authError,
      );
      // We log this, but don't fail the whole request since the DB update succeeded.
    }

    // Optional: Add a revalidatePath here if you need the UI to refresh immediately
    // revalidatePath("/admin/drivers");
    return {
      success: true,
      message: "Driver saved successfully!",
    };
  } catch (error) {
    console.error("Save Driver Error:", error);
    return {
      success: false,
      message: "A critical server error occurred while saving the driver.",
    };
  }
}

export async function saveDriverApplication(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User Error (Save Driver Application):", userError);
      return {
        success: false,
        message: "You must be logged in to apply as a driver.",
      };
    }
    const { error } = await supabase.from("drivers").insert({
      user_id: user.id,
      driver_status: "PENDING",
      is_verified: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          message: "You have already submitted a driver application.",
        };
      }
      console.error("Insert error:", error);
      return {
        success: false,
        message: "Failed to submit driver application. Please try again.",
      };
    }

    return {
      success: true,
      message: "Driver application submitted successfully",
    };
  } catch (error) {
    console.error("Save Driver Application Error:", error);
    return {
      success: false,
      message:
        "A critical server error occurred while submitting your driver application.",
    };
  }
}

export async function getDriverSchedulesAction() {
  try {
    const supabase = await createClient();

    // Call the RPC
    const { data: drivers, error } = await supabase.rpc("get_driver_schedules");

    if (error) {
      console.error("RPC Error (Schedules):", error);
      return { success: false, message: "Failed to load driver schedules." };
    }

    // Format the data precisely for the UI
    const formattedSchedules = (drivers || []).flatMap((driver: any) => {
      return (driver.assignments || []).map((assignment: any) => {
        const booking = assignment.bookings;
        const car = booking?.cars;
        const customer = booking?.customer;

        return {
          id: assignment.assignment_id,
          driver_id: driver.driver_id,
          driver_name: driver.profiles?.full_name || "Unknown Driver",
          start: new Date(assignment.shift_start),
          end: new Date(assignment.shift_end),
          car: car ? `${car.brand} ${car.model}` : "Unassigned Vehicle",
          plate: car?.plate_number || "N/A",
          location: booking?.pickup_location || "Unknown Location",
          status: assignment.status,
          customer: customer
            ? {
                name: customer.full_name || "Guest",
                phone: customer.phone_number || "No contact provided",
                avatar: customer.profile_picture_url || null,
              }
            : null,
        };
      });
    });

    return { success: true, data: formattedSchedules };
  } catch (error) {
    console.error("Get Driver Schedules Error:", error);
    return {
      success: false,
      message: "A critical error occurred while loading schedules.",
    };
  }
}

export async function getDriverPerformanceAction(driverId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_driver_performance", {
      p_driver_id: driverId,
    });

    if (error) {
      console.error("RPC Error (Performance):", error);
      return { success: false, message: "Failed to load performance metrics." };
    }

    // The RPC returns a neatly packaged object: { kpis: {...}, ledger: [...] }
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Get Driver Performance Error:", error);
    return {
      success: false,
      message: "Failed to load performance metrics. Please try again.",
    };
  }
}

export async function getDriverDocumentsAction(driverId: string) {
  try {
    const supabase = await createClient();

    // Call the RPC to get all documents associated with this driver's user account
    const { data: documents, error } = await supabase.rpc(
      "get_driver_all_documents",
      {
        p_driver_id: driverId,
      },
    );

    if (error) {
      console.error("RPC Error (Documents):", error);
      return { success: false, message: "Failed to load documents." };
    }

    if (!documents) {
      return { success: false, message: "Could not locate driver record." };
    }

    // Helper to format category strings into clean titles
    const formatCategoryName = (cat: string) => {
      if (cat === "license_id") return "Professional Driver's License";
      if (cat === "valid_id") return "Secondary Valid ID";
      return cat
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Map ALL the raw DB data to the format our UI expects
    const processedDocs = (documents || []).map((doc: any) => {
      let statusDisplay = "Pending Review";
      if (doc.status === "VERIFIED") statusDisplay = "Valid";
      if (doc.status === "REJECTED") statusDisplay = "Rejected";

      let dateDisplay = `Uploaded ${new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      if (doc.expiry_date) {
        dateDisplay = `Expires ${new Date(doc.expiry_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      }

      const fileUrl = doc.file_path
        ? getPublicUrl(doc.file_path) || null
        : null;

      return {
        id: doc.document_id,
        category: doc.category, // Passing raw category in case UI needs it for logic
        name: formatCategoryName(doc.category),
        fileName: doc.file_name,
        status: statusDisplay,
        date: dateDisplay,
        fileUrl: fileUrl,
        internalNotes: doc.internal_notes,
        rejectionReason: doc.rejection_reason,
      };
    });

    return { success: true, data: processedDocs };
  } catch (error) {
    console.error("Get Driver Documents Error:", error);
    return {
      success: false,
      message: "A critical error occurred while loading documents.",
    };
  }
}

export async function getPendingDriversAction() {
  try {
    const supabase = await createClient();

    // Call the RPC
    const { data: pendingDrivers, error } = await supabase.rpc(
      "get_pending_drivers",
    );

    if (error) {
      console.error("RPC Error (Pending Drivers):", error);
      return { success: false, message: "Failed to load driver applications." };
    }

    // Format the data for the UI
    const formattedData = (pendingDrivers || []).map((driver: any) => {
      const profile = driver.users;
      const userDocs = profile?.documents || [];

      // Find specific docs embedded by the RPC
      const licenseDoc = userDocs.find((d: any) => d.category === "license_id");
      const validIdDoc = userDocs.find((d: any) => d.category === "valid_id");

      return {
        driver_id: driver.driver_id,
        user_id: driver.user_id,
        full_name: profile?.full_name || "Unknown",
        email: profile?.email || "No email",
        phone_number: profile?.phone_number,
        trust_score: profile?.trust_score || 5.0,
        profile_picture_url: profile?.profile_picture_url,
        created_at: driver.created_at,
        // Resolve public URLs safely
        license_id_url: licenseDoc?.file_path
          ? getPublicUrl(licenseDoc.file_path)
          : null,
        valid_id_url: validIdDoc?.file_path
          ? getPublicUrl(validIdDoc.file_path)
          : null,
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Get Pending Drivers Error:", error);
    return {
      success: false,
      message: "A critical error occurred while loading applications.",
    };
  }
}

export async function verifyDriverAction(driverId: string) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(); // Needed for Auth metadata bypass

    // Call the RPC. It updates the DB, creates the notification, AND returns user info.
    const { data, error: rpcError } = await supabase.rpc(
      "verify_driver_application",
      { p_driver_id: driverId },
    );

    if (rpcError || !data) {
      console.error("RPC Error (Verify Driver):", rpcError);
      return {
        success: false,
        message: "Driver update failed. Driver was not verified.",
      };
    }

    const userId = data.user_id;

    // --- NEW: Sync the Auth Metadata so RLS allows them into the Driver portal ---
    if (userId) {
      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: "driver" },
          user_metadata: { role: "driver" },
        });

      if (authError) {
        console.error(
          "Warning: Driver verified in DB, but Auth metadata sync failed:",
          authError,
        );
      }
    }

    // Send the Email using the returned data
    try {
      if (data.email) {
        await sendDriverVerificationEmail(
          data.email,
          data.full_name || "Driver",
        );
      }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    revalidatePath("/admin/drivers");
    return { success: true, message: "Driver verified successfully!" };
  } catch (error) {
    console.error("Verify Driver Error:", error);
    return {
      success: false,
      message: "Failed to verify driver. Please try again.",
    };
  }
}

export async function rejectDriverAction(driverId: string, reason: string) {
  try {
    const supabase = await createClient();

    // Call the RPC. It updates the DB, creates the notification, AND returns user info.
    const { data, error: rpcError } = await supabase.rpc(
      "reject_driver_application",
      {
        p_driver_id: driverId,
        p_reason: reason,
      },
    );

    if (rpcError || !data) {
      console.error("RPC Error (Reject Driver):", rpcError);
      return {
        success: false,
        message: "Driver update failed. Driver was not rejected.",
      };
    }

    // Send the Email using the returned data
    try {
      if (data.email) {
        await sendDriverRejectionEmail(
          data.email,
          data.full_name || "Applicant",
          reason,
        );
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return { success: true, message: "Driver rejected successfully." };
  } catch (error) {
    console.error("Reject Driver Error:", error);
    return {
      success: false,
      message: "Failed to reject driver. Please try again.",
    };
  }
}

export async function deleteDriverAction(driverId: string) {
  try {
    const supabase = await createClient();

    // Call the RPC function
    const { error } = await supabase.rpc("delete_driver_v1", {
      p_driver_id: driverId,
    });

    if (error) {
      console.error("RPC Error (Delete Driver):", error);
      return { success: false, message: "Failed to delete driver." };
    }

    return { success: true, message: "Driver removed successfully." };
  } catch (error) {
    console.error("Delete Driver Error:", error);
    return {
      success: false,
      message: "Failed to delete driver. Please try again.",
    };
  }
}
