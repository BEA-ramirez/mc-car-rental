import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInCalendarDays } from "date-fns";
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

export const generateInvoicePDF = (folio: any) => {
  if (!folio || !folio.booking) return;

  const doc = new jsPDF();
  const booking = folio.booking;
  const customer = Array.isArray(booking.users)
    ? booking.users[0]
    : booking.users;
  const car = Array.isArray(booking.cars) ? booking.cars[0] : booking.cars;

  // --- SAFE FALLBACKS (Prevents crashes) ---
  const safeId = booking.booking_id || booking.id || "0000";
  const shortId = safeId.split("-")[0].toUpperCase();
  const safeStatus = booking.booking_status || booking.status || "UNKNOWN";
  const currentDate = format(new Date(), "MMM dd, yyyy");

  // Calculate Days
  const startDate = new Date(booking.start_date || Date.now());
  const endDate = new Date(booking.end_date || Date.now());
  const days = Math.max(1, differenceInCalendarDays(endDate, startDate));

  // --- FINANCIAL MATH ---
  const dailyRate = Number(car?.rental_rate_per_day || 0);
  // EXPLICIT MULTIPLICATION: Unit Price * Days
  const baseRental = dailyRate * days;
  const securityDeposit = Number(booking.security_deposit || 0);

  // --- 1. HEADER SECTION ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MC ORMOC CAR RENTAL", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Muted slate
  doc.text("Brgy. Cogon, Ormoc City", 14, 28);
  doc.text("Leyte 6541, Philippines", 14, 33);
  doc.text("Phone: 09958930398", 14, 38);

  // Invoice Meta (Right Aligned)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 197, 195); // Teal
  doc.text("INVOICE", 195, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`INVOICE #: ${shortId}`, 195, 28, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${currentDate}`, 195, 33, { align: "right" });
  doc.text(`Status: ${safeStatus.toUpperCase()}`, 195, 38, { align: "right" });

  // --- 2. BILLING & VEHICLE INFO ---
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 195, 45); // Horizontal divider

  // Bill To
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO:", 14, 53);
  doc.setFont("helvetica", "normal");
  doc.text(customer?.full_name || "Guest", 14, 58);
  doc.text(customer?.phone_number || "N/A", 14, 63);
  doc.text(customer?.email || "N/A", 14, 68);

  // Vehicle Details
  doc.setFont("helvetica", "bold");
  doc.text("VEHICLE DETAILS:", 120, 53);
  doc.setFont("helvetica", "normal");
  doc.text(`Unit: ${car?.brand} ${car?.model}`, 120, 58);
  doc.text(`Plate No: ${car?.plate_number || "N/A"}`, 120, 63);
  doc.text(
    `Duration: ${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")} (${days} Days)`,
    120,
    68,
  );

  let currentY = 78;

  // --- 3. LINE ITEMS (CHARGES) ---
  const chargeRows = [];

  // Base Rental Row (Now explicitly using the multiplied value)
  chargeRows.push([
    "Vehicle Base Rental",
    `${days} Day(s)`,
    `P ${dailyRate.toLocaleString()}`,
    `P ${baseRental.toLocaleString()}`,
  ]);

  // Additional Charges from DB
  let totalExtraCharges = 0;
  if (folio.charges && folio.charges.length > 0) {
    folio.charges.forEach((c: any) => {
      const amount = Number(c.amount);
      totalExtraCharges += amount;
      chargeRows.push([
        c.description || c.category.replace("_", " "),
        "1",
        `P ${Math.abs(amount).toLocaleString()}`,
        `P ${amount.toLocaleString()}`,
      ]);
    });
  }

  // Security Deposit Row
  if (securityDeposit > 0) {
    chargeRows.push([
      "Refundable Security Deposit",
      "1",
      `P ${securityDeposit.toLocaleString()}`,
      `P ${securityDeposit.toLocaleString()}`,
    ]);
  }

  const grandTotal = baseRental + totalExtraCharges + securityDeposit;

  autoTable(doc, {
    startY: currentY,
    head: [["DESCRIPTION", "QTY", "UNIT PRICE", "AMOUNT"]],
    body: chargeRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- 4. PAYMENTS SECTION ---
  const paymentRows: any[] = [];
  let totalPaid = 0;

  if (folio.payments && folio.payments.length > 0) {
    folio.payments.forEach((p: any) => {
      const amount = Number(p.amount);
      totalPaid += amount;

      // Format the method and reference nicely
      const methodAndRef = `${p.payment_method} ${p.transaction_reference ? `(${p.transaction_reference})` : ""}`;

      paymentRows.push([
        format(
          new Date(p.paid_at || p.created_at || Date.now()),
          "MMM dd, yyyy",
        ),
        p.title || "Payment", // <--- THE NEW PURPOSE/TITLE FIELD!
        methodAndRef,
        `P ${amount.toLocaleString()}`,
      ]);
    });
  } else {
    paymentRows.push(["No payments", "-", "-", "P 0"]);
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("PAYMENT HISTORY", 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["DATE", "PURPOSE", "METHOD / REF", "AMOUNT"]], // <--- UPDATED HEADERS
    body: paymentRows,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [100, 116, 139],
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 4, textColor: [71, 85, 105] },
    columnStyles: {
      3: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129] }, // Green for payments
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- 5. TOTALS & BALANCE DUE ---
  const balanceDue = grandTotal - totalPaid;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  // Layout the totals on the right side
  doc.text("Total Charges:", 130, currentY);
  doc.text(`P ${grandTotal.toLocaleString()}`, 195, currentY, {
    align: "right",
  });

  doc.text("Total Paid:", 130, currentY + 7);
  doc.text(`- P ${totalPaid.toLocaleString()}`, 195, currentY + 7, {
    align: "right",
  });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(130, currentY + 11, 195, currentY + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  if (balanceDue <= 0) {
    doc.setTextColor(16, 185, 129); // Green if paid
    doc.text("NET SETTLED:", 130, currentY + 18);
    doc.text(`P ${Math.abs(balanceDue).toLocaleString()}`, 195, currentY + 18, {
      align: "right",
    });
  } else {
    doc.setTextColor(220, 38, 38); // Red if balance due
    doc.text("BALANCE DUE:", 130, currentY + 18);
    doc.text(`P ${balanceDue.toLocaleString()}`, 195, currentY + 18, {
      align: "right",
    });
  }

  // --- 6. FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  // Download the PDF
  doc.save(`Invoice_${shortId}.pdf`);
};
