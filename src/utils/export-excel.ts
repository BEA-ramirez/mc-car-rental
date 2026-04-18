import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { formatDisplayId } from "@/lib/utils";

// --- HELPER FUNCTIONS FOR PROFESSIONAL STYLING ---
const styleHeaderRow = (row: ExcelJS.Row) => {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Slate 900
  };
  row.alignment = { vertical: "middle", horizontal: "left" };
};

const styleMasterRow = (row: ExcelJS.Row) => {
  row.font = { bold: true, color: { argb: "FF0F172A" }, size: 11 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" }, // Slate 100
  };
  row.alignment = { vertical: "middle", horizontal: "left" };
};

const styleChildRow = (row: ExcelJS.Row) => {
  row.font = { color: { argb: "FF475569" }, size: 10 }; // Slate 600
};

export async function generateExcelReport(
  reportData: any,
  startDate: Date,
  endDate: Date,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MC Ormoc Car Rental ERP";
  workbook.created = new Date();

  const dateRangeStr = `${format(startDate, "MMM dd, yyyy")} to ${format(endDate, "MMM dd, yyyy")}`;
  const generatedStr = format(new Date(), "MMM dd, yyyy hh:mm a");
  const currencyFormat = '"₱"#,##0.00';

  // ==========================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ==========================================
  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [
    { header: "Report Metadata", key: "metric", width: 35 },
    { header: "Details / Value", key: "value", width: 35 },
  ];

  styleHeaderRow(summarySheet.getRow(1));

  summarySheet.addRow({ metric: "Report Period", value: dateRangeStr });
  summarySheet.addRow({ metric: "Generated On", value: generatedStr });
  summarySheet.addRow({});

  const kpiHeader = summarySheet.addRow({
    metric: "Financial Metrics",
    value: "",
  });
  kpiHeader.font = { bold: true, size: 12 };
  kpiHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  summarySheet.addRow({
    metric: "Gross Fleet Revenue",
    value: reportData.kpis?.gross_revenue || 0,
  });
  summarySheet.addRow({
    metric: "Net Platform Profit",
    value: reportData.kpis?.platform_profit || 0,
  });
  summarySheet.addRow({
    metric: "Maintenance Costs Deducted",
    value: reportData.kpis?.maintenance_costs || 0,
  });
  summarySheet.addRow({
    metric: "Total Owner Payouts",
    value: reportData.kpis?.owner_payouts || 0,
  });
  summarySheet.addRow({
    metric: "Total Completed Trips",
    value: reportData.kpis?.total_trips || 0,
  });

  for (let i = 6; i <= 9; i++) {
    summarySheet.getCell(`B${i}`).numFmt = currencyFormat;
    summarySheet.getCell(`B${i}`).font = { bold: true };
  }
  summarySheet.getCell(`B10`).font = { bold: true };

  // ==========================================
  // SHEET 2: UNIT ECONOMICS (CARS & BREAKDOWN)
  // ==========================================
  const unitSheet = workbook.addWorksheet("Unit Economics");
  unitSheet.columns = [
    { header: "Asset / Plate No.", key: "asset", width: 35 },
    { header: "Fleet Partner", key: "partner", width: 25 },
    { header: "Configured Rates", key: "rates", width: 25 },
    { header: "Trips", key: "trips", width: 12 },
    { header: "Gross Rev", key: "gross", width: 18 },
    { header: "Maint. Deduct", key: "maint", width: 18 },
    { header: "Net Yield", key: "net", width: 18 },
  ];
  styleHeaderRow(unitSheet.getRow(1));

  if (reportData.unit_economics) {
    reportData.unit_economics.forEach((car: any) => {
      const masterRow = unitSheet.addRow({
        asset: `🚘 ${car.vehicle} [${car.plate}]`,
        partner: `${car.owner} (${car.share}%)`,
        rates: `Day: ₱${car.rate_day || 0} | 12H: ₱${car.rate_12h || 0}`,
        trips: car.trips,
        gross: car.gross,
        maint: car.maint,
        net: car.net,
      });
      styleMasterRow(masterRow);

      if (car.breakdown && car.breakdown.length > 0) {
        car.breakdown.forEach((trip: any) => {
          const type = trip.with_driver ? "w/ Driver" : "Self-Drive";
          const childRow = unitSheet.addRow({
            asset: `      ↳ ${trip.id}`,
            partner: trip.dates,
            rates: `[${type}] Payout: ${trip.payout_status}`,
            gross: trip.amount,
          });
          styleChildRow(childRow);
        });
      }
      unitSheet.addRow([]);
    });
    ["E", "F", "G"].forEach(
      (col) => (unitSheet.getColumn(col).numFmt = currencyFormat),
    );
  }

  // ==========================================
  // SHEET 3: PARTNER SETTLEMENTS
  // ==========================================
  const partnerSheet = workbook.addWorksheet("Partner Settlements");
  partnerSheet.columns = [
    { header: "Fleet Partner Info", key: "partner", width: 35 },
    { header: "Vehicle / Dates", key: "details", width: 35 },
    { header: "Gross Fleet Rev", key: "gross", width: 18 },
    { header: "Platform Cut", key: "comm", width: 18 },
    { header: "Maint. Deduct", key: "maint", width: 18 },
    { header: "Net Payout", key: "net", width: 18 },
  ];
  styleHeaderRow(partnerSheet.getRow(1));

  if (reportData.partners) {
    reportData.partners.forEach((prt: any) => {
      const masterRow = partnerSheet.addRow({
        partner: `💼 ${prt.name} [${formatDisplayId(prt.id, "PRT")}]`,
        details: `${prt.active_cars} Cars | ${prt.total_trips} Trips`,
        gross: prt.gross,
        comm: prt.platform_cut,
        maint: prt.maint,
        net: prt.net_payout,
      });
      styleMasterRow(masterRow);

      if (prt.breakdown && prt.breakdown.length > 0) {
        prt.breakdown.forEach((tx: any) => {
          const childRow = partnerSheet.addRow({
            partner: `      ↳ ${tx.id} (${tx.payout_status})`,
            details: `${tx.vehicle} | ${tx.dates}`,
            gross: tx.gross,
            comm: tx.comm,
            maint: tx.maint,
            net: tx.net,
          });
          styleChildRow(childRow);
        });
      }
      partnerSheet.addRow([]);
    });
    ["C", "D", "E", "F"].forEach(
      (col) => (partnerSheet.getColumn(col).numFmt = currencyFormat),
    );
  }

  // ==========================================
  // SHEET 4: MASTER LEDGER (Raw Cash Flow)
  // ==========================================
  const ledgerSheet = workbook.addWorksheet("Master Ledger");
  ledgerSheet.columns = [
    { header: "Date & Time", key: "date", width: 22 },
    { header: "Transaction Ref", key: "ref", width: 25 },
    { header: "Category", key: "category", width: 30 },
    { header: "Method", key: "method", width: 15 },
    { header: "Amount", key: "amount", width: 20 },
  ];
  styleHeaderRow(ledgerSheet.getRow(1));

  if (reportData.master_ledger) {
    reportData.master_ledger.forEach((txn: any) => {
      const row = ledgerSheet.addRow({
        date: format(new Date(txn.date), "MMM dd, yyyy hh:mm a"),
        ref: `${txn.id} | ${txn.ref}`,
        category: txn.category.replace(/_/g, " "),
        method: txn.method,
        amount: txn.amount,
      });
      if (txn.amount > 0)
        row.getCell("amount").font = { color: { argb: "FF059669" } };
      if (txn.amount < 0)
        row.getCell("amount").font = { color: { argb: "FFDC2626" } };
    });
    ledgerSheet.getColumn("E").numFmt = currencyFormat;
  }

  // ==========================================
  // SHEET 5: BOOKING VOLUME (MASSIVELY EXPANDED)
  // ==========================================
  const bookingsSheet = workbook.addWorksheet("Booking Manifest");
  bookingsSheet.columns = [
    { header: "Booking Ref", key: "id", width: 18 },
    { header: "Customer Name", key: "customer", width: 25 },
    { header: "Asset / Vehicle", key: "vehicle", width: 30 },
    { header: "Driver Assignment", key: "driver", width: 25 },
    { header: "Start Date & Time", key: "start", width: 25 },
    { header: "End Date & Time", key: "end", width: 25 },
    { header: "Pickup Details", key: "pickup", width: 35 },
    { header: "Dropoff Details", key: "dropoff", width: 35 },
    { header: "Booking Status", key: "status", width: 15 },
    { header: "Payment Status", key: "pay_status", width: 15 },
    { header: "Owner Payout Ref", key: "payout_ref", width: 20 },
    { header: "Base Rate Locked", key: "base_rate", width: 18 },
    { header: "Security Deposit", key: "deposit", width: 18 },
    { header: "Total Billed", key: "total", width: 18 },
    { header: "Balance Due", key: "due", width: 18 },
  ];
  styleHeaderRow(bookingsSheet.getRow(1));

  if (reportData.bookings) {
    reportData.bookings.forEach((bkg: any) => {
      const row = bookingsSheet.addRow({
        id: bkg.id,
        customer: bkg.customer,
        vehicle: bkg.vehicle,
        driver: bkg.is_with_driver ? bkg.driver_name : "Self-Drive",
        start: bkg.full_start,
        end: bkg.full_end,
        pickup: `[${bkg.pickup_type.toUpperCase()}] ${bkg.pickup_location}`,
        dropoff: `[${bkg.dropoff_type.toUpperCase()}] ${bkg.dropoff_location}`,
        status: bkg.status.toUpperCase(),
        pay_status: bkg.payment_status.toUpperCase(),
        payout_ref: `${bkg.payout_ref} (${bkg.owner_payout_status})`,
        base_rate: bkg.base_rate_snapshot,
        deposit: bkg.security_deposit,
        total: bkg.total,
        due: bkg.due,
      });

      if (bkg.due > 0) {
        row.getCell("due").font = { color: { argb: "FFDC2626" }, bold: true };
      }
    });
    // Apply currency formatting to the financial columns
    ["L", "M", "N", "O"].forEach(
      (col) => (bookingsSheet.getColumn(col).numFmt = currencyFormat),
    );
  }

  // ==========================================
  // SHEET 6: CUSTOMER INSIGHTS (LTV)
  // ==========================================
  const customerSheet = workbook.addWorksheet("Customer LTV");
  customerSheet.columns = [
    { header: "Customer Identity", key: "customer", width: 35 },
    { header: "Vehicle / Dates", key: "details", width: 30 },
    { header: "Transaction Type", key: "type", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Total Value / Amount", key: "amount", width: 22 },
  ];
  styleHeaderRow(customerSheet.getRow(1));

  if (reportData.customers) {
    reportData.customers.forEach((cus: any) => {
      const masterRow = customerSheet.addRow({
        customer: `👤 ${cus.name} [${formatDisplayId(cus.id, "CUS")}]`,
        details: `Total Bookings: ${cus.bookings}`,
        type: "",
        status:
          cus.flags && cus.flags.length > 0
            ? cus.flags.join(", ")
            : "Clean Record",
        amount: cus.ltv,
      });
      styleMasterRow(masterRow);

      if (cus.breakdown && cus.breakdown.length > 0) {
        cus.breakdown.forEach((tx: any) => {
          const childRow = customerSheet.addRow({
            customer: `      ↳ ${tx.id}`,
            details: `${tx.vehicle} | ${tx.dates}`,
            type: tx.type,
            status: tx.status,
            amount: tx.amount,
          });
          styleChildRow(childRow);
        });
      }
      customerSheet.addRow([]);
    });
    customerSheet.getColumn("E").numFmt = currencyFormat;
  }

  // ==========================================
  // SHEET 7: DRIVER PERFORMANCE & LOGS
  // ==========================================
  const driversSheet = workbook.addWorksheet("Driver Performance");
  driversSheet.columns = [
    { header: "Driver Identity", key: "driver", width: 35 },
    { header: "Dates / Shifts", key: "dates", width: 30 },
    { header: "Booking Ref", key: "ref", width: 15 },
    { header: "Assigned Vehicle", key: "vehicle", width: 35 },
    { header: "Est. Income / Fee", key: "fee", width: 20 },
  ];
  styleHeaderRow(driversSheet.getRow(1));

  if (reportData.drivers) {
    reportData.drivers.forEach((drv: any) => {
      const drvId = drv.display_id || formatDisplayId(drv.id, "DRV");
      const masterRow = driversSheet.addRow({
        driver: `🪪 ${drv.name} [${drvId}]`,
        dates: `Total Shifts: ${drv.shifts} | Status: ${drv.status}`,
        ref: "",
        vehicle: `Primary: ${drv.vehicle}`,
        fee: drv.income,
      });
      styleMasterRow(masterRow);

      if (drv.breakdown && drv.breakdown.length > 0) {
        drv.breakdown.forEach((shift: any) => {
          const childRow = driversSheet.addRow({
            driver: `      ↳ ${shift.shift}`,
            dates: shift.date,
            ref: shift.ref,
            vehicle: shift.vehicle,
            fee: shift.fee,
          });
          styleChildRow(childRow);
        });
      }
      driversSheet.addRow([]);
    });
    driversSheet.getColumn("E").numFmt = currencyFormat;
  }

  // ==========================================
  // GENERATE & DOWNLOAD FILE
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Fleet_Intelligence_${format(startDate, "MMM_dd")}-${format(endDate, "MMM_dd_yyyy")}.xlsx`;
  saveAs(blob, fileName);
}

export async function exportClientsToExcel(filteredUsers: any[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Car Rental ERP System";
  workbook.created = new Date();

  const clientSheet = workbook.addWorksheet("Client Directory");
  clientSheet.columns = [
    { header: "ID", key: "id", width: 20 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Address", key: "address", width: 40 },
    { header: "Role", key: "role", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Trust Score", key: "trustScore", width: 15 },
    { header: "License No.", key: "licenseNo", width: 20 },
    { header: "License Expiry", key: "licenseExpiry", width: 18 },
    { header: "Sec. ID Expiry", key: "secIdExpiry", width: 18 },
    { header: "Joined Date", key: "joinedDate", width: 20 },
  ];

  styleHeaderRow(clientSheet.getRow(1));

  if (filteredUsers && filteredUsers.length > 0) {
    filteredUsers.forEach((user: any) => {
      const formatDateSafe = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        try {
          return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
          return "Invalid Date";
        }
      };

      const row = clientSheet.addRow({
        id: user.user_id?.split("-")[0].toUpperCase() || "N/A", // Cleaner ID
        name:
          user.full_name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "N/A",
        email: user.email,
        phone: user.phone_number || "N/A",
        address: user.address || "N/A",
        role: (user.role || "N/A").toUpperCase(),
        status: (user.account_status || "N/A").toUpperCase(),
        trustScore: user.trust_score || 0,
        licenseNo: user.license_number || "N/A",
        licenseExpiry: formatDateSafe(user.license_expiry_date),
        secIdExpiry: formatDateSafe(user.valid_id_expiry_date),
        joinedDate: formatDateSafe(user.created_at),
      });
      styleChildRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Client_Directory_Export_${format(new Date(), "MMM_dd_yyyy")}.xlsx`;
  saveAs(blob, fileName);
}
