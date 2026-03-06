import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";

// --- HELPER FUNCTIONS FOR PROFESSIONAL STYLING ---
const styleHeaderRow = (row: ExcelJS.Row) => {
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  }; // Slate 900
  row.alignment = { vertical: "middle", horizontal: "left" };
};

const styleMasterRow = (row: ExcelJS.Row) => {
  row.font = { bold: true, color: { argb: "FF0F172A" }, size: 11 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  }; // Slate 100
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
  workbook.creator = "Car Rental ERP System";
  workbook.created = new Date();

  const dateRangeStr = `${format(startDate, "MMM dd, yyyy")} to ${format(endDate, "MMM dd, yyyy")}`;
  const currencyFormat = '"₱"#,##0.00';

  // ==========================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ==========================================
  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [
    { header: "Financial Metric", key: "metric", width: 35 },
    { header: "Total Value", key: "value", width: 25 },
  ];

  styleHeaderRow(summarySheet.getRow(1));

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

  for (let i = 2; i <= 5; i++) {
    summarySheet.getCell(`B${i}`).numFmt = currencyFormat;
    summarySheet.getCell(`B${i}`).font = { bold: true };
  }

  // ==========================================
  // SHEET 2: UNIT ECONOMICS (CARS & BREAKDOWN)
  // ==========================================
  const unitSheet = workbook.addWorksheet("Unit Economics");
  unitSheet.columns = [
    { header: "Asset / Plate No.", key: "asset", width: 35 },
    { header: "Fleet Partner", key: "partner", width: 25 },
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
        trips: car.trips,
        gross: car.gross,
        maint: car.maint,
        net: car.net,
      });
      styleMasterRow(masterRow);

      if (car.breakdown && car.breakdown.length > 0) {
        car.breakdown.forEach((trip: any) => {
          const childRow = unitSheet.addRow({
            asset: `      ↳ ${trip.id}`,
            partner: trip.dates,
            gross: trip.amount,
          });
          styleChildRow(childRow);
        });
      }
      unitSheet.addRow([]);
    });
    ["D", "E", "F"].forEach(
      (col) => (unitSheet.getColumn(col).numFmt = currencyFormat),
    );
  }

  // ==========================================
  // SHEET 3: PARTNER SETTLEMENTS
  // ==========================================
  const partnerSheet = workbook.addWorksheet("Partner Settlements");
  partnerSheet.columns = [
    { header: "Fleet Partner Info", key: "partner", width: 35 },
    { header: "Vehicle / Dates", key: "details", width: 30 },
    { header: "Gross Fleet Rev", key: "gross", width: 18 },
    { header: "Platform Cut", key: "comm", width: 18 },
    { header: "Maint. Deduct", key: "maint", width: 18 },
    { header: "Net Payout", key: "net", width: 18 },
  ];
  styleHeaderRow(partnerSheet.getRow(1));

  if (reportData.partners) {
    reportData.partners.forEach((prt: any) => {
      const masterRow = partnerSheet.addRow({
        partner: `💼 ${prt.name} (${prt.business})`,
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
            partner: `      ↳ ${tx.id}`,
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
  // SHEET 5: BOOKING VOLUME
  // ==========================================
  const bookingsSheet = workbook.addWorksheet("Booking Volume");
  bookingsSheet.columns = [
    { header: "Booking Ref", key: "id", width: 20 },
    { header: "Customer", key: "customer", width: 30 },
    { header: "Asset / Vehicle", key: "vehicle", width: 35 },
    { header: "Rental Dates", key: "dates", width: 25 },
    { header: "Status", key: "status", width: 15 },
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
        dates: bkg.dates,
        status: bkg.status.toUpperCase(),
        total: bkg.total,
        due: bkg.due,
      });
      // Highlight unpaid balances in red
      if (bkg.due > 0)
        row.getCell("due").font = { color: { argb: "FFDC2626" }, bold: true };
    });
    ["F", "G"].forEach(
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
        customer: `👤 ${cus.name} [${cus.id.split("-")[0].toUpperCase()}]`,
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
      const masterRow = driversSheet.addRow({
        driver: `🪪 ${drv.name} [${drv.id.split("-")[0].toUpperCase()}]`,
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
