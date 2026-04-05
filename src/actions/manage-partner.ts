"use server";

import z from "zod";
import { carOwnerSchema } from "@/lib/schemas/car-owner";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  sendPartnerVerificationEmail,
  sendPartnerRejectionEmail,
} from "./helper/mail";

// define the state shape for useactionstate
export type ActionState = {
  message: string | null;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function managePartner(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());

  const processedData = {
    ...rawData,
    active_status: String(rawData.active_status) === "true",
    revenue_share_percentage: Number(rawData.revenue_share_percentage),
    owner_notes: rawData.owner_notes || null,
    contract_expiry_date: rawData.contract_expiry_date
      ? new Date(String(rawData.contract_expiry_date))
      : null,
  };

  const validateFields = carOwnerSchema
    .partial({ car_owner_id: true, created_at: true, last_updated_at: true })
    .safeParse(processedData);

  if (!validateFields.success) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { car_owner_id, ...dataToSave } = validateFields.data;
  const supabase = await createClient();
  const now = new Date().toISOString();

  try {
    if (car_owner_id) {
      // update
      const { error } = await supabase
        .from("car_owner")
        .update({ ...dataToSave, last_updated_at: now })
        .eq("car_owner_id", car_owner_id);
      if (error) throw error;
      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Fleet partner updated successfully." };
    } else {
      // create
      if (!dataToSave.user_id) {
        return {
          success: false,
          message: "User is required for new fleet partner.",
        };
      }

      const { error } = await supabase.from("car_owner").insert({
        ...dataToSave,
        created_at: now,
        last_updated_at: now,
      });
      if (error) throw error;
      revalidatePath("/admin/fleet-partners");
      return { success: true, message: "Fleet partner created successfully." };
    }
  } catch (error: any) {
    console.error("Error managing fleet partner:", error);
    return {
      success: false,
      message:
        error.message ||
        "An error occurred while saving the fleet partner. Please try again.",
    };
  }
}

export async function getUnassignedCarOwners(): Promise<any[]> {
  const supabase = await createClient();

  const { data: existingPartners, error: partnersError } = await supabase
    .from("car_owner")
    .select("user_id");

  if (partnersError) {
    console.error("Error fetching existing partners:", partnersError);
    return [];
  }

  const assignedUserIds = existingPartners?.map((p) => p.user_id) || [];

  let query = supabase
    .from("users")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: true });

  if (assignedUserIds.length > 0) {
    query = query.not("user_id", "in", `(${assignedUserIds.join(",")})`);
  }

  const { data: availableUsers, error: usersError } = await query;
  if (usersError) {
    console.error("Error fetching available users:", usersError);
    return [];
  }

  return availableUsers as any[];
}

export async function saveFleetPartnerApplication(
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User authentication error:", userError);
    return {
      success: false,
      message: "You must be logged in to apply as a fleet partner.",
    };
  }

  const businessName = formData.get("businessName") as string;
  const bankName = formData.get("bankName") as string;
  const bankAccountName = formData.get("bankAccountName") as string;
  const bankAccountNumber = formData.get("bankAccountNumber") as string;

  try {
    const { error } = await supabase.from("car_owner").insert({
      user_id: user.id,
      verification_status: "pending",
      active_status: false,
      revenue_share_percentage: 70,
      business_name: businessName,
      bank_name: bankName,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving fleet partner application:", error);
      return {
        success: false,
        message: "Failed to save fleet partner application.",
      };
    }
    return {
      success: true,
      message: "Fleet partner application submitted successfully.",
    };
  } catch (error) {
    console.error("Unexpected error saving fleet partner application:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getPendingFleetPartnersAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_pending_fleet_partners");

    if (error) {
      console.error("Error fetching pending partners:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Unexpected error fetching pending partners:", error);
    return { success: false, data: [] };
  }
}

export async function verifyFleetPartnerAction(
  carOwnerId: string,
  userId: string,
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("verify_fleet_partner", {
      p_car_owner_id: carOwnerId,
      p_user_id: userId,
    });

    if (error) {
      console.error("Partner Verification Error:", error);
      return { success: false, message: "Failed to verify partner." };
    }

    // Try to send the email notification
    if (data?.email) {
      try {
        await sendPartnerVerificationEmail(
          data.email,
          data.full_name || data.business_name,
        );
      } catch (mailError) {
        console.error(
          "Failed to send approval email, but partner was verified:",
          mailError,
        );
      }
    }

    revalidatePath("/admin/fleet-partners");
    return { success: true, message: "Partner verified successfully." };
  } catch (error: any) {
    console.error("Verification exception:", error);
    return {
      success: false,
      message: error.message || "Failed to verify partner.",
    };
  }
}

export async function rejectFleetPartnerAction(
  carOwnerId: string,
  userId: string,
  reason: string,
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("reject_fleet_partner", {
      p_car_owner_id: carOwnerId,
      p_user_id: userId,
      p_reason: reason,
    });

    if (error) {
      console.error("Partner Rejection Error:", error);
      return { success: false, message: "Failed to reject partner." };
    }

    // Try to send the email notification
    if (data?.email) {
      try {
        // Note: You might need to adjust your sendRejectionEmail signature if it currently expects booleans for document rejection
        await sendPartnerRejectionEmail(
          data.email,
          data.full_name || data.business_name,
          reason,
        );
      } catch (mailError) {
        console.error(
          "Failed to send rejection email, but partner was rejected:",
          mailError,
        );
      }
    }

    revalidatePath("/admin/fleet-partners");
    return { success: true, message: "Partner rejected successfully." };
  } catch (error: any) {
    console.error("Rejection exception:", error);
    return {
      success: false,
      message: error.message || "Failed to reject partner.",
    };
  }
}

export async function getPartnerRevenueChartData(
  ownerId: string,
  monthsBack: number = 6,
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_partner_monthly_revenue", {
      p_owner_id: ownerId,
      p_months_back: monthsBack,
    });

    if (error) {
      console.error("Error fetching partner revenue data:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching partner revenue data:", error);
    return [];
  }
}

export async function getPartnerCarUtilization(
  ownerId: string,
  daysBack: number = 30,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_partner_car_utilization", {
    p_owner_id: ownerId,
    p_days_back: daysBack,
  });

  if (error) {
    console.error("Error fetching car utilization:", error);
    return [];
  }

  return data;
}

export async function getPartnerFleetUnits(ownerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_partner_fleet_units", {
    p_owner_id: ownerId,
  });

  if (error) {
    console.error("Error fetching partner fleet units:", error);
    return [];
  }

  return data;
}

export async function getPartnerPayoutHistory(ownerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_partner_payout_history", {
    p_owner_id: ownerId,
  });

  if (error) {
    console.error("Error fetching partner payout history:", error);
    return [];
  }

  return data;
}

export async function getPartnerDocumentsAction(ownerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_partner_documents", {
    p_owner_id: ownerId,
  });

  if (error) {
    console.error("Error fetching partner documents:", error);
    return [];
  }

  // Generate public URLs for the UI to link to
  const docsWithUrls = data.map((doc: any) => {
    return {
      ...doc,
      file_url: doc.file_path
        ? supabase.storage.from("documents").getPublicUrl(doc.file_path).data
            .publicUrl
        : null,
    };
  });

  return docsWithUrls;
}

export async function getPartnerAuditLogsAction(ownerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_partner_audit_logs", {
    p_owner_id: ownerId,
  });

  if (error) {
    console.error("Error fetching partner audit logs:", error);
    return [];
  }

  return data;
}
