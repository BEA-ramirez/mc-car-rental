"use server";
import { createClient } from "@/utils/supabase/server";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { getPublicUrl } from "./helper/upload-file";
import {
  sendDriverRejectionEmail,
  sendDriverVerificationEmail,
} from "./helper/mail";

export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function saveDriver(
  data: CompleteDriverType,
): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("save_driver_v1", {
    // Map zod data to the SQL parameters
    p_user_id: data.user_id,
    p_full_name: data.profiles.full_name,
    p_first_name: data.profiles.first_name,
    p_last_name: data.profiles.last_name,
    p_phone_number: data.profiles.phone_number,
    p_license_number: data.profiles.license_number,
    p_license_expiry_date: data.profiles.license_expiry_date,
    p_driver_status: data.driver_status,
    p_is_verified: data.is_verified,
  });

  if (error) {
    console.error("RPC Error:", error);
    throw new Error("Failed to save driver");
  }

  return { success: true, message: "Driver saved successfully" };
}

export async function getDriverById(
  driverId: string,
): Promise<CompleteDriverType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drivers")
    .select(
      "*, profiles: users(full_name, phone_number, license_number, license_expiry_date)",
    )
    .eq("driver_id", driverId)
    .eq("is_archived", false)
    .single();

  if (error) {
    console.error("Error fetching driver:", error);
    throw new Error("Failed to fetch driver");
  }
  return data as CompleteDriverType;
}

export async function deleteDriver(driverId: string): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("drivers")
    .update({ is_archived: true })
    .eq("driver_id", driverId);

  if (error) {
    console.error("Error deleting driver:", error);
    throw new Error("Failed to delete driver");
  }
  return { success: true, message: "Driver deleted successfully" };
}

export async function saveDriverApplication(): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User authentication error:", userError);
    throw new Error("Unauthorized");
  }
  try {
    const { error } = await supabase.from("drivers").insert({
      user_id: user.id,
      driver_status: "pending",
      is_verified: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving driver application:", error);
      throw new Error("Failed to save driver application");
    }

    return {
      success: true,
      message: "Driver application submitted successfully",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new Error(
      "An unexpected error occurred while submitting your application. Please try again later.",
    );
  }
}

export async function getDriverSchedulesAction() {
  const supabase = await createClient();

  const { data: drivers, error } = await supabase
    .from("drivers")
    .select(
      `
      driver_id,
      display_id,
      driver_status,
      profiles:users ( full_name, phone_number ),
      assignments:booking_driver_assignments (
        assignment_id,
        shift_start,
        shift_end,
        status,
        bookings (
          booking_id,
          pickup_location,
          dropoff_location,
          booking_status,
          cars ( brand, model, plate_number ),
          customer:users!bookings_user_id_fkey ( 
            full_name, 
            phone_number, 
            profile_picture_url 
          )
        )
      )
    `,
    )
    .eq("is_archived", false)
    .eq("is_verified", true);

  if (error) {
    console.error("Error fetching driver schedules:", error);
    return { success: false, message: "Failed to fetch schedules" };
  }

  const formattedSchedules = drivers.flatMap((driver: any) => {
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
}

export async function getDriverPerformanceAction(driverId: string) {
  const supabase = await createClient();

  // Call the new, all-in-one RPC function
  const { data, error } = await supabase.rpc("get_driver_performance", {
    p_driver_id: driverId,
  });

  if (error) {
    console.error("Error fetching driver performance data:", error);
    return { success: false, message: "Failed to load performance metrics." };
  }

  // The RPC returns a neatly packaged object: { kpis: {...}, ledger: [...] }
  return {
    success: true,
    data: data,
  };
}

export async function getDriverDocumentsAction(driverId: string) {
  // Initialize the client once for the entire action
  const supabase = await createClient();

  // 1. Get the user_id associated with this driver
  const { data: driverData, error: driverError } = await supabase
    .from("drivers")
    .select("user_id")
    .eq("driver_id", driverId)
    .single();

  if (driverError || !driverData) {
    console.error("Error fetching driver user_id:", driverError);
    return { success: false, message: "Could not locate driver record." };
  }

  const userId = driverData.user_id;

  // 2. Fetch ALL documents linked to this user
  const { data: documents, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (docsError) {
    console.error("Error fetching documents:", docsError);
    return { success: false, message: "Failed to load documents." };
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

  // 3. Map the raw DB data to the format our UI expects
  const processedDocs = documents.map((doc: any) => {
    let statusDisplay = "Pending Review";
    if (doc.status === "VERIFIED") statusDisplay = "Valid";
    if (doc.status === "REJECTED") statusDisplay = "Rejected";

    let dateDisplay = `Uploaded ${new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    if (doc.expiry_date) {
      dateDisplay = `Expires ${new Date(doc.expiry_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }

    // Generate the public URL instantly using the already-initialized client
    const fileUrl = doc.file_path
      ? supabase.storage.from("documents").getPublicUrl(doc.file_path).data
          .publicUrl
      : null;

    return {
      id: doc.document_id,
      name: formatCategoryName(doc.category),
      fileName: doc.file_name,
      status: statusDisplay,
      date: dateDisplay,
      fileUrl: fileUrl, // <--- Now returning the fully resolved public URL
    };
  });

  return { success: true, data: processedDocs };
}

export async function getPendingDriversAction() {
  const supabase = await createClient();

  // Fetch drivers who are NOT verified AND NOT archived
  // We join with the users table to get their profile info
  const { data, error } = await supabase
    .from("drivers")
    .select(
      `
      driver_id,
      user_id,
      created_at,
      users!drivers_user_id_fkey (
        full_name,
        email,
        phone_number,
        trust_score,
        profile_picture_url
      )
    `,
    )
    .eq("is_verified", false)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending drivers:", error);
    return { success: false, message: "Failed to load driver applications." };
  }

  // Next, we need to fetch their uploaded documents to check if they are ready
  // We extract all user_ids from the pending drivers
  const userIds = data.map((d: any) => d.user_id);

  let docsData: any[] = [];
  if (userIds.length > 0) {
    const { data: docs } = await supabase
      .from("documents")
      .select("user_id, category, file_path")
      .in("user_id", userIds);

    docsData = docs || [];
  }

  // Format the data for the UI
  const formattedData = data.map((driver: any) => {
    const profile = Array.isArray(driver.users)
      ? driver.users[0]
      : driver.users;
    const userDocs = docsData.filter((d) => d.user_id === driver.user_id);

    // Find specific docs
    const licenseDoc = userDocs.find((d) => d.category === "license_id");
    const validIdDoc = userDocs.find((d) => d.category === "valid_id");

    return {
      driver_id: driver.driver_id,
      user_id: driver.user_id,
      full_name: profile?.full_name || "Unknown",
      email: profile?.email || "No email",
      phone_number: profile?.phone_number,
      trust_score: profile?.trust_score || 5.0,
      profile_picture_url: profile?.profile_picture_url,
      created_at: driver.created_at,
      // Resolve public URLs if the doc exists
      license_id_url: licenseDoc?.file_path
        ? supabase.storage.from("documents").getPublicUrl(licenseDoc.file_path)
            .data.publicUrl
        : null,
      valid_id_url: validIdDoc?.file_path
        ? supabase.storage.from("documents").getPublicUrl(validIdDoc.file_path)
            .data.publicUrl
        : null,
    };
  });

  return { success: true, data: formattedData };
}

export async function verifyDriverAction(driverId: string) {
  const supabase = await createClient();

  // 1. Call the RPC. It updates the DB, creates the notification, AND returns user info.
  const { data, error: rpcError } = await supabase.rpc(
    "verify_driver_application",
    {
      p_driver_id: driverId,
    },
  );

  if (rpcError || !data) {
    console.error("Error executing verify RPC:", rpcError);
    return { success: false, message: "Database update failed." };
  }

  // 2. Send the Email using the returned data
  try {
    if (data.email) {
      await sendDriverVerificationEmail(data.email, data.full_name || "Driver");
    }
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  return { success: true };
}

export async function rejectDriverAction(driverId: string, reason: string) {
  const supabase = await createClient();

  // 1. Call the RPC. It updates the DB, creates the notification, AND returns user info.
  const { data, error: rpcError } = await supabase.rpc(
    "reject_driver_application",
    {
      p_driver_id: driverId,
      p_reason: reason,
    },
  );

  if (rpcError || !data) {
    console.error("Error executing reject RPC:", rpcError);
    return { success: false, message: "Database update failed." };
  }

  // 2. Send the Email using the returned data
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

  return { success: true };
}
