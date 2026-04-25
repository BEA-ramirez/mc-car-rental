import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, differenceInHours } from "date-fns";
import { formatDisplayId } from "@/lib/utils";

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

  // --- COMPACT KPI BANNER (4 in a row) ---
  doc.setDrawColor(220, 226, 230);
  doc.setFillColor(248, 250, 252);

  // Box Widths: 43mm each. Spacing: 3.3mm. Total Width: ~182mm (fits perfectly in A4)
  doc.roundedRect(14, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(60, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(106, 42, 43, 18, 2, 2, "FD");
  doc.roundedRect(152, 42, 43, 18, 2, 2, "FD");

  doc.setFontSize(7);
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
      `${car.vehicle}\n${car.plate}`,
      `${car.owner}\n(${car.share}% Share)`,
      `Day: P ${car.rate_day || 0}\n12H: P ${car.rate_12h || 0}`, // Added Base Rates
      car.trips?.toString() || "0",
      `P ${car.gross?.toLocaleString() || 0}`,
      car.maint < 0 ? `-P ${Math.abs(car.maint).toLocaleString()}` : "P 0",
      `P ${car.net?.toLocaleString() || 0}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Vehicle & Plate",
        "Fleet Partner",
        "Configured Rates",
        "Trips",
        "Gross Rev",
        "Maint. Deduct",
        "Net Yield",
      ],
    ],
    body: unitRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
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
      `${prt.name}\n${formatDisplayId(prt.id, "PRT")}`, // Fixed ID
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
        "Partner Name & Ref",
        "Business Entity",
        "Activity",
        "Gross Fleet Rev",
        "Platform Cut",
        "Net Payout",
      ],
    ],
    body: partnerRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right", textColor: [220, 38, 38] },
      5: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
    },
  });

  // ==========================================
  // PAGE 4: MASTER LEDGER (NEW)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Master Financial Ledger", 14, 20);

  const ledgerRows =
    reportData.master_ledger?.map((txn: any) => [
      format(new Date(txn.date), "MMM dd, yyyy\nhh:mm a"),
      `${txn.id}\nRef: ${txn.ref}`,
      txn.category.replace(/_/g, " "),
      txn.method,
      txn.amount < 0
        ? `-P ${Math.abs(txn.amount).toLocaleString()}`
        : `P ${txn.amount.toLocaleString()}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      ["Date & Time", "Transaction & Ref", "Category", "Method", "Amount"],
    ],
    body: ledgerRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      4: { halign: "right", fontStyle: "bold" },
    },
  });

  // ==========================================
  // PAGE 5: BOOKING MANIFEST (NEW)
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Booking Volume Manifest", 14, 20);

  const bookingRows =
    reportData.bookings?.map((bkg: any) => [
      `${bkg.id}\n${bkg.status.toUpperCase()}`,
      `${bkg.customer}\n${bkg.is_with_driver ? "w/ Driver" : "Self-Drive"}`,
      bkg.vehicle,
      bkg.dates.replace(" - ", "\n"), // Splits dates into two lines for fit
      `P ${bkg.total.toLocaleString()}`,
      `P ${bkg.due.toLocaleString()}`,
    ]) || [];

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Booking Ref & Status",
        "Customer",
        "Asset / Vehicle",
        "Rental Dates",
        "Total Billed",
        "Balance Due",
      ],
    ],
    body: bookingRows,
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold", textColor: [220, 38, 38] },
    },
  });

  // ==========================================
  // PAGE 6: CUSTOMER INSIGHTS
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Customer Insights & Lifetime Value", 14, 20);

  const customerRows =
    reportData.customers?.map((cus: any) => [
      cus.name,
      formatDisplayId(cus.id, "CUS"), // Fixed ID
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
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right", fontStyle: "bold", textColor: [5, 150, 105] },
      4: { textColor: [100, 116, 139] },
    },
  });

  // ==========================================
  // PAGE 7: DRIVER PERFORMANCE
  // ==========================================
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Driver Performance Logs", 14, 20);

  const driverRows =
    reportData.drivers?.map((drv: any) => [
      `${drv.name}\n${drv.display_id || formatDisplayId(drv.id, "DRV")}`, // Fixed ID
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
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: "center" },
      4: { halign: "right", fontStyle: "bold" },
    },
  });

  const fileName = `Fleet_Prospectus_${format(startDate, "MMM_dd")}-${format(endDate, "MMM_dd_yyyy")}.pdf`;
  doc.save(fileName);
}

export async function exportClientsToPDF(filteredUsers: any[]) {
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
    } catch {
      return "Invalid Date";
    }
  };

  const clientRows =
    filteredUsers?.map((user: any) => {
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

  // --- SAFE FALLBACKS ---
  const safeId = booking.booking_id || booking.id || "0000";
  const shortId = safeId.split("-")[0].toUpperCase();
  const safeStatus = booking.booking_status || booking.status || "UNKNOWN";
  const currentDate = format(new Date(), "MMM dd, yyyy");

  // Calculate Duration perfectly matching the UI Block Math
  const startDate = new Date(booking.start_date || Date.now());
  const endDate = new Date(booking.end_date || Date.now());
  const hours = differenceInHours(endDate, startDate);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let durationLabel = "";
  if (days > 0 && remHours > 0)
    durationLabel = `${days} Day(s) & ${remHours} Hr(s)`;
  else if (days > 0) durationLabel = `${days} Day(s)`;
  else durationLabel = `${hours} Hr(s)`;

  // --- 1. HEADER SECTION ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SEFFNE TRANSPORT SERVICES INC.", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Purok 2, Brgy. San Pablo, Ormoc City", 14, 28);
  doc.text("Leyte 6541, Philippines", 14, 33);
  doc.text("Phone: 09958930398", 14, 38);

  // Invoice Meta
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 197, 195);
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
  doc.line(14, 45, 195, 45);

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
    `Duration: ${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")} (${durationLabel})`,
    120,
    68,
  );

  let currentY = 78;

  // --- 3. LINE ITEMS (CHARGES) ---
  const chargeRows: any[] = [];
  let grandTotalCharges = 0;

  if (folio.charges && folio.charges.length > 0) {
    folio.charges.forEach((c: any) => {
      const amount = Number(c.amount);
      grandTotalCharges += amount;

      let description = c.category.replace(/_/g, " ");
      let qty = "1";
      let unitPrice = `P ${Math.abs(amount).toLocaleString()}`;

      // Handle the new Block Math Rates properly with safe fallbacks
      if (c.category === "BASE_RATE_24H" || c.category === "BASE_RATE") {
        description = "Base Rental (24H Block)";
        const rate24 = Number(
          booking.rate_snapshot_24h ||
            booking.base_rate_snapshot ||
            car?.rental_rate_per_day ||
            0,
        );

        unitPrice = `P ${rate24.toLocaleString()}`;

        // Safely calculate quantity to prevent infinite decimals
        if (rate24 > 0) {
          const rawQty = amount / rate24;
          qty = Number.isInteger(rawQty)
            ? rawQty.toString()
            : parseFloat(rawQty.toFixed(2)).toString();
        }
      } else if (c.category === "BASE_RATE_12H") {
        description = "Base Rental (12H Block)";
        const rate12 = Number(
          booking.rate_snapshot_12h || car?.rental_rate_per_12h || 0,
        );

        unitPrice = `P ${rate12.toLocaleString()}`;

        if (rate12 > 0) {
          const rawQty = amount / rate12;
          qty = Number.isInteger(rawQty)
            ? rawQty.toString()
            : parseFloat(rawQty.toFixed(2)).toString();
        }
      } else if (c.category === "DELIVERY_FEE") {
        description = "Custom Location Delivery Fee";
      }

      // If description exists, append it
      if (c.description && !c.category.includes("BASE_RATE")) {
        description += ` - ${c.description}`;
      }

      chargeRows.push([
        description,
        qty,
        unitPrice,
        `${amount < 0 ? "-" : ""} P ${Math.abs(amount).toLocaleString()}`,
      ]);
    });
  } else {
    chargeRows.push(["No charges recorded", "-", "-", "P 0"]);
  }

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
      // CRITICAL FIX: Ignore voided payments from the printed receipt
      if (p.status !== "COMPLETED") return;

      const amount = Number(p.amount);
      totalPaid += amount;

      const methodAndRef = `${p.payment_method} ${p.transaction_reference ? `(${p.transaction_reference})` : ""}`;

      paymentRows.push([
        format(new Date(p.paid_at || p.created_at), "MMM dd, yyyy"),
        p.title || "Payment",
        methodAndRef,
        `${amount < 0 ? "-" : ""} P ${Math.abs(amount).toLocaleString()}`,
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
    head: [["DATE", "PURPOSE", "METHOD / REF", "AMOUNT"]],
    body: paymentRows,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [100, 116, 139],
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 4, textColor: [71, 85, 105] },
    columnStyles: {
      3: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- 5. TOTALS, VAT & BALANCE DUE ---
  // INCLUSIVE VAT CALCULATION (12%)
  const vatRate = 0.12;
  const vatableSales = grandTotalCharges / (1 + vatRate);
  const vatAmount = grandTotalCharges - vatableSales;
  const balanceDue = grandTotalCharges - totalPaid;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  // VAT Breakdown
  doc.text("VATable Sales:", 130, currentY);
  doc.text(
    `P ${vatableSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    195,
    currentY,
    { align: "right" },
  );

  doc.text("VAT (12% Inclusive):", 130, currentY + 6);
  doc.text(
    `P ${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    195,
    currentY + 6,
    { align: "right" },
  );

  // Main Totals
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Charges:", 130, currentY + 14);
  doc.text(`P ${grandTotalCharges.toLocaleString()}`, 195, currentY + 14, {
    align: "right",
  });

  doc.text("Total Paid:", 130, currentY + 20);
  doc.text(`- P ${totalPaid.toLocaleString()}`, 195, currentY + 20, {
    align: "right",
  });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(130, currentY + 24, 195, currentY + 24);

  // Balance Due / Settled
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  if (balanceDue <= 0) {
    doc.setTextColor(16, 185, 129); // Green if paid
    doc.text("NET SETTLED:", 130, currentY + 31);
    doc.text(`P ${Math.abs(balanceDue).toLocaleString()}`, 195, currentY + 31, {
      align: "right",
    });
  } else {
    doc.setTextColor(220, 38, 38); // Red if balance due
    doc.text("BALANCE DUE:", 130, currentY + 31);
    doc.text(`P ${balanceDue.toLocaleString()}`, 195, currentY + 31, {
      align: "right",
    });
  }

  // --- 6. FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Prices shown are VAT Inclusive.", 105, 275, {
    align: "center",
  });
  doc.text("Thank you for your business!", 105, 280, { align: "center" });

  doc.save(`Invoice_${shortId}.pdf`);
};

export const generatePayoutPDF = (details: any) => {
  if (!details || !details.payout) return;

  const doc = new jsPDF();
  const { payout, bookings, maintenance } = details;

  // --- SAFE FALLBACKS ---
  const safeId = payout.payout_id || "0000";
  const shortId = safeId.split("-")[0].toUpperCase();
  const safeStatus = payout.status || "UNKNOWN";
  const currentDate = format(new Date(), "MMM dd, yyyy");

  const ownerName =
    payout.car_owner?.business_name ||
    payout.car_owner?.users?.full_name ||
    "Fleet Partner";
  const sharePct = payout.car_owner?.revenue_share_percentage || 0;
  const companyPct = 100 - sharePct;

  const periodStr = `${format(new Date(payout.period_start), "MMM dd, yyyy")} - ${format(
    new Date(payout.period_end),
    "MMM dd, yyyy",
  )}`;

  // --- 1. HEADER SECTION ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SEFFNE TRANSPORT SERVICES INC.", 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Purok 2, Brgy. San Pablo, Ormoc City", 14, 28);
  doc.text("Leyte 6541, Philippines", 14, 33);
  doc.text("Phone: 09958930398", 14, 38);

  // Statement Meta
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 197, 195);
  doc.text("STATEMENT", 195, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`REF #: ${shortId}`, 195, 28, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${currentDate}`, 195, 33, { align: "right" });

  if (safeStatus === "PAID" && payout.paid_at) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text(
      `PAID ON: ${format(new Date(payout.paid_at), "MMM dd, yyyy")}`,
      195,
      38,
      { align: "right" },
    );
  } else {
    doc.setTextColor(245, 158, 11); // Amber
    doc.text(`STATUS: ${safeStatus.toUpperCase()}`, 195, 38, {
      align: "right",
    });
  }

  // --- 2. PARTNER & PERIOD INFO ---
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 45, 195, 45);

  // Partner Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("FLEET PARTNER:", 14, 53);
  doc.setFont("helvetica", "normal");
  doc.text(ownerName, 14, 58);
  doc.text(`Revenue Share: ${sharePct}%`, 14, 63);

  // Settlement Details
  doc.setFont("helvetica", "bold");
  doc.text("SETTLEMENT PERIOD:", 120, 53);
  doc.setFont("helvetica", "normal");
  doc.text(periodStr, 120, 58);
  doc.text(`Total Trips: ${bookings?.length || 0}`, 120, 63);

  let currentY = 75;

  // --- 3. REVENUE SECTION (BOOKINGS) ---
  const bookingRows: any[] = [];
  if (bookings && bookings.length > 0) {
    bookings.forEach((b: any) => {
      const bShortId = b.booking_id.split("-")[0].toUpperCase();
      const carName = `${b.car?.brand} (${b.car?.plate_number})`;
      const dateRange = `${format(new Date(b.start_date), "MMM dd")} - ${format(new Date(b.end_date), "MMM dd")}`;

      bookingRows.push([
        dateRange,
        carName,
        bShortId,
        `P ${Number(b.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ]);
    });
  } else {
    bookingRows.push([
      "No settled bookings in this period",
      "-",
      "-",
      "P 0.00",
    ]);
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("GROSS REVENUE (COMPLETED TRIPS)", 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [["DATE", "VEHICLE", "REF", "GROSS AMOUNT"]],
    body: bookingRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      3: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129] }, // Green numbers
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- 4. DEDUCTIONS SECTION (MAINTENANCE) ---
  if (maintenance && maintenance.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("MAINTENANCE & DEDUCTIONS", 14, currentY);

    const maintRows = maintenance.map((m: any) => {
      const mShortId = m.maintenance_id.split("-")[0].toUpperCase();
      const carName = `${m.car?.brand} (${m.car?.plate_number})`;
      const serviceName = m.service_type.replace(/_/g, " ");

      return [
        serviceName,
        carName,
        mShortId,
        `- P ${Number(m.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: currentY + 4,
      head: [["SERVICE", "VEHICLE", "REF", "DEDUCTION"]],
      body: maintRows,
      theme: "plain",
      headStyles: {
        fillColor: [254, 226, 226], // Light red tint
        textColor: [153, 27, 27], // Dark red text
        fontSize: 8,
      },
      styles: { fontSize: 8, cellPadding: 4, textColor: [71, 85, 105] },
      columnStyles: {
        3: { halign: "right", fontStyle: "bold", textColor: [220, 38, 38] }, // Red numbers
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- 5. TOTALS & FINAL CALCULATION ---
  const grossRev = Number(payout.total_revenue) || 0;
  const commDed = Number(payout.commission_deducted) || 0;
  const maintDed =
    maintenance?.reduce((sum: number, m: any) => sum + Number(m.cost), 0) || 0;
  const netPayout = Number(payout.net_payout) || 0;

  // Check if we are too close to the bottom of the page. If so, add a new page.
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  // Breakdown
  doc.text("Gross Revenue:", 120, currentY);
  doc.text(
    `P ${grossRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    195,
    currentY,
    { align: "right" },
  );

  doc.text(`Company Share (${companyPct}%):`, 120, currentY + 6);
  doc.setTextColor(220, 38, 38); // Red
  doc.text(
    `- P ${commDed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    195,
    currentY + 6,
    { align: "right" },
  );

  if (maintDed > 0) {
    doc.setTextColor(100, 116, 139);
    doc.text("Total Maintenance:", 120, currentY + 12);
    doc.setTextColor(220, 38, 38);
    doc.text(
      `- P ${maintDed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      195,
      currentY + 12,
      { align: "right" },
    );
    currentY += 6;
  }

  // Draw Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(120, currentY + 10, 195, currentY + 10);

  // Net Settled
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("NET PAYOUT:", 120, currentY + 17);

  if (netPayout > 0) {
    doc.setTextColor(16, 185, 129); // Green
  } else {
    doc.setTextColor(220, 38, 38); // Red if they owe us!
  }

  doc.text(
    `P ${netPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    195,
    currentY + 17,
    { align: "right" },
  );

  // --- 6. FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This document serves as an official settlement breakdown.",
    105,
    275,
    { align: "center" },
  );
  doc.text(
    "For any disputes, please contact management within 5 business days.",
    105,
    280,
    { align: "center" },
  );

  doc.save(`Payout_Statement_${shortId}.pdf`);
};

// const getBase64ImageFromURL = (url: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "Anonymous"; // Crucial for Supabase CORS
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx?.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL("image/png"));
//     };
//     img.onerror = (error) => reject(error);
//     img.src = url;
//   });
// };

export const generateInspectionPDF = async (
  inspection: any,
  booking: any,
  containerElement: HTMLElement,
) => {
  if (!inspection || !booking || !containerElement) return;

  const shortId = booking.id.split("-")[0].toUpperCase();
  const currentDate = format(new Date(), "MMM dd, yyyy hh:mm a");

  // 1. Get the total dimensions of the container
  const scrollHeight = containerElement.scrollHeight;
  const scrollWidth = containerElement.scrollWidth;

  // 2. Create the A4 PDF Document
  const doc = new jsPDF("p", "mm", "a4");
  const pageHeight = doc.internal.pageSize.getHeight();
  const pdfWidth = doc.internal.pageSize.getWidth() - 28; // 14mm margins on left and right

  // --- NATIVE HEADER SECTION ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SEFFNE TRANSPORT SERVICES INC.", 14, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Purok 2, Brgy. San Pablo, Ormoc City", 14, 27);
  doc.text("Leyte 6541, Philippines", 14, 32);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${inspection.type.toUpperCase()} INSPECTION`, 195, 22, {
    align: "right",
  });

  // Booking & Customer Info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Booking Ref: ${shortId}`, 195, 28, { align: "right" });
  doc.text(`Date: ${currentDate}`, 195, 33, { align: "right" });
  doc.text(`Customer: ${booking.customer?.name || "N/A"}`, 195, 38, {
    align: "right",
  });
  doc.text(
    `Vehicle: ${booking.car?.brand} ${booking.car?.model} (${booking.car?.plate})`,
    195,
    43,
    { align: "right" },
  );

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, 195, 48);

  const startY = 52; // Where the snapshot starts printing on Page 1

  // --- CONTINUOUS SNAPSHOT SECTION ---
  const { toPng } = await import("html-to-image");

  try {
    const imgData = await toPng(containerElement, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: scrollWidth,
      height: scrollHeight,
      style: { overflow: "visible" },
    });

    const imgProps = doc.getImageProperties(imgData);
    const ratio = imgProps.height / imgProps.width;
    const totalPdfHeight = pdfWidth * ratio;

    // ==============================================================
    // PAGE GENERATION (Smooth Continuous Flow)
    // ==============================================================

    // Draw Page 1
    doc.addImage(imgData, "PNG", 14, startY, pdfWidth, totalPdfHeight);

    // Calculate how much of the image successfully printed on Page 1
    let printedHeight = pageHeight - startY;
    let heightLeft = totalPdfHeight - printedHeight;
    const topMargin = 14;

    // If the image overflows Page 1, generate subsequent pages naturally
    while (heightLeft > 0) {
      doc.addPage();

      // Shift the image UP by the exact amount we've already printed so it perfectly aligns
      const nextYPosition = topMargin - printedHeight;
      doc.addImage(imgData, "PNG", 14, nextYPosition, pdfWidth, totalPdfHeight);

      // Update counters for the next potential loop
      printedHeight += pageHeight - topMargin;
      heightLeft -= pageHeight - topMargin;
    }

    doc.save(`${inspection.type}_Inspection_${shortId}.pdf`);
  } catch (error) {
    console.error("Error creating snapshot:", error);
    throw new Error("Failed to capture inspection snapshot.");
  }
};
