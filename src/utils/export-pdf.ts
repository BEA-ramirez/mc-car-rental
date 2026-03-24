import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ClientRow } from "../../hooks/use-clients";
import { toTitleCase } from "@/actions/helper/format-text";

export async function generatePDFReport(
  reportData: any,
  startDate: Date,
  endDate: Date,
  chartImageURI?: string,
) {
  const doc = new jsPDF("p", "mm", "a4");
  const dateStr = `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;

  // ==========================================
  // PAGE 1: THE EXECUTIVE DASHBOARD
  // ==========================================
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FLEET PERFORMANCE REPORT", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 28);
  doc.text(`Reporting Period: ${dateStr}`, 14, 34);

  // --- NEW COMPACT KPI BANNER (4 in a row) ---
  doc.setDrawColor(220, 226, 230);
  doc.setFillColor(248, 250, 252);

  // Box Widths: 43mm each. Spacing: 3.3mm. Total Width: ~182mm (fits perfectly in A4)
  doc.roundedRect(14, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(60, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(106, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(152, 42, 43, 18, 2, 2, "FD");

  doc.setFontSize(7); // Smaller, sleeker label font
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);

  // Box 1: Gross
  doc.text("GROSS REVENUE", 17, 48);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `P ${(reportData.kpis?.gross_revenue || 0).toLocaleString()}`,
    17,
    55,
  );

  // Box 2: Profit
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("PLATFORM PROFIT", 63, 48);
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(
    `P ${(reportData.kpis?.platform_profit || 0).toLocaleString()}`,
    63,
    55,
  );

  // Box 3: Maintenance
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("MAINTENANCE", 109, 48);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(
    `- P ${(reportData.kpis?.maintenance_costs || 0).toLocaleString()}`,
    109,
    55,
  );

  // Box 4: Payouts
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("OWNER PAYOUTS", 155, 48);
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(
    `P ${(reportData.kpis?.owner_payouts || 0).toLocaleString()}`,
    155,
    55,
  );

  // --- INJECT DUAL CHARTS ---
  if (chartImageURI) {
    // Because the KPIs are smaller, we can push the charts way up to y: 68
    // We make the image wide (180mm) and properly proportioned (65mm tall)
    doc.addImage(chartImageURI, "PNG", 14, 68, 180, 65);
  }

  // ==========================================
  // PAGE 2: UNIT ECONOMICS TABLE
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Unit Economics & Asset Yield", 14, 20);

  const unitRows =
    reportData.unit_economics?.map((car: any) => [
      car.vehicle,
      car.plate,
      car.owner,
      car.trips?.toString() || "0",
      `P ${car.gross?.toLocaleString() || 0}`,
      car.maint < 0 ? `-P ${Math.abs(car.maint).toLocaleString()}` : "P 0",
      `P ${car.net?.toLocaleString() || 0}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Vehicle",
        "Plate No.",
        "Fleet Partner",
        "Trips",
        "Gross Rev",
        "Maint. Deduct",
        "Net Yield",
      ],
    ],
    body: unitRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "right", textColor: [220, 38, 38] },
      6: { halign: "right", fontStyle: "bold" },
    },
  });

  // ==========================================
  // PAGE 3: PARTNER SETTLEMENTS
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Partner Settlement Ledger", 14, 20);

  const partnerRows =
    reportData.partners?.map((prt: any) => [
      prt.name,
      prt.business,
      `${prt.active_cars} Cars / ${prt.total_trips} Trips`,
      `P ${prt.gross?.toLocaleString() || 0}`,
      `-P ${Math.abs(prt.platform_cut || 0).toLocaleString()}`,
      `P ${prt.net_payout?.toLocaleString() || 0}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Partner Name",
        "Business Entity",
        "Activity",
        "Gross Fleet Rev",
        "Platform Cut",
        "Net Payout",
      ],
    ],
    body: partnerRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right", textColor: [220, 38, 38] },
      5: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
    },
  });

  // ==========================================
  // PAGE 4: CUSTOMER INSIGHTS
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Customer Insights & Lifetime Value", 14, 20);

  const customerRows =
    reportData.customers?.map((cus: any) => [
      cus.name,
      cus.id.split("-")[0].toUpperCase(),
      cus.bookings?.toString() || "0",
      `P ${cus.ltv?.toLocaleString() || 0}`,
      cus.flags?.length > 0 ? cus.flags.join(", ") : "Clean Record",
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Customer Name",
        "Account Ref",
        "Total Bookings",
        "Lifetime Value (LTV)",
        "Account Flags",
      ],
    ],
    body: customerRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right", fontStyle: "bold", textColor: [5, 150, 105] },
      4: { textColor: [100, 116, 139] },
    },
  });

  // ==========================================
  // PAGE 5: DRIVER PERFORMANCE
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Driver Performance Logs", 14, 20);

  const driverRows =
    reportData.drivers?.map((drv: any) => [
      drv.name,
      drv.shifts?.toString() || "0",
      drv.status,
      drv.vehicle || "None",
      `P ${drv.income?.toLocaleString() || 0}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Driver Identity",
        "Deployed Shifts",
        "Current Status",
        "Primary Vehicle Assigned",
        "Est. Income / Fee",
      ],
    ],
    body: driverRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: "center" },
      4: { halign: "right", fontStyle: "bold" },
    },
  });

  const fileName = `Fleet_Prospectus_${format(startDate, "MMM_dd")}-${format(endDate, "MMM_dd_yyyy")}.pdf`;
  doc.save(fileName);
}

export async function exportClientsToPDF(filteredUsers: ClientRow[]) {
  const doc = new jsPDF("p", "mm", "a4");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT DIRECTORY REPORT", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 28);
  doc.text(`Total Clients: ${filteredUsers.length}`, 14, 34);

  const formatDateSafe = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const clientRows =
    filteredUsers?.map((user: ClientRow) => {
      const name =
        user.full_name ||
        [user.first_name, user.last_name].filter(Boolean).join(" ") ||
        "N/A";
      const contactArr = [];
      if (user.email) contactArr.push(user.email.toLowerCase());
      if (user.phone_number) contactArr.push(user.phone_number);
      const contact = contactArr.length > 0 ? contactArr.join("\n") : "N/A";

      return [
        name,
        contact,
        user.role?.toUpperCase() || "N/A",
        user.account_status?.toUpperCase() || "N/A",
        `${user.trust_score || "0.0"} / 5.0`,
        formatDateSafe(user.created_at),
      ];
    }) || [];

  autoTable(doc, {
    startY: 42, //Pushed down slightly to accommodate the second header line
    head: [["Client", "Contact", "Role", "Status", "Trust Score", "Joined"]],
    body: clientRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 }, // Added white text
    bodyStyles: { fontSize: 8, textColor: [71, 85, 105] }, // Slate 600 text
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      2: { halign: "center" }, // Center Role
      3: { halign: "center" },
      4: { halign: "center", fontStyle: "bold", textColor: [5, 150, 105] }, // Center & Green Trust Score
      5: { halign: "right" }, // Right align dates
    },
  });

  const fileName = `Client_Directory_Export_${format(new Date(), "MMM_dd_yyyy")}.pdf`;
  doc.save(fileName);
}
