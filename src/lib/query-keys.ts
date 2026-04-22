// lib/query-keys.ts

export const QUERY_KEYS = {
  // --- USERS & CLIENTS ---
  users: {
    customers: ["users", "customers"] as const,
    profile: ["customer-profile"] as const,
    clients: (params?: any) =>
      params ? (["clients", params] as const) : (["clients"] as const),
    clientsKpi: ["clients-kpi"] as const,
  },

  // --- FLEET & CARS ---
  fleet: {
    all: ["units"] as const,
    detailBase: ["unit"] as const,
    detail: (id: string) => ["unit", id] as const,
    specifications: (query?: string) => ["specifications", query] as const,
    features: (query?: string) => ["features", query] as const,
    customerFleet: (filters: any) =>
      ["customer-fleet-infinite", filters] as const,
    unavailableDates: (carId: string) =>
      ["car-unavailable-dates", carId] as const,
  },

  // --- BOOKINGS & SCHEDULER ---
  bookings: {
    all: ["bookings"] as const, // Invalidating this hits ALL booking lists (admin, customer, details)
    list: (page?: number, limit?: number, status?: string) =>
      ["bookings", page, limit, status] as const,
    customerList: ["customer-bookings"] as const,
    details: (id: string) => ["booking-details", id] as const,
    detailsBase: ["booking-details"] as const,
    folioBase: ["booking-folio"] as const,
    folio: (id: string) => ["booking-folio", id] as const,
    scheduler: (month?: string) => ["scheduler-data", month] as const,
    workflowDocs: (id: string) => ["booking-docs", id] as const,
  },

  // --- DRIVERS & DISPATCH ---
  drivers: {
    all: ["drivers"] as const,
    pending: ["pending-drivers"] as const,
    schedules: ["driver-schedules"] as const,
    performance: (id: string) => ["driver-performance", id] as const,
    documents: (id: string) => ["driver-documents", id] as const,
    availability: (start?: string, end?: string) =>
      ["driver-availability", start, end] as const,
    dispatch: (start?: string, end?: string) =>
      ["dispatch-availability", start, end] as const,
  },

  // --- FLEET PARTNERS (CAR OWNERS) ---
  partners: {
    all: ["fleet-partners"] as const,
    unassigned: ["unassigned-car-owners"] as const,
    pending: ["fleet-partners-pending"] as const,
    revenue: (id: string, months: number) =>
      ["partner-revenue-chart", id, months] as const,
    utilization: (id: string, days: number) =>
      ["partner-car-utilization", id, days] as const,
    fleetUnits: (id: string) => ["partner-fleet-units", id] as const,
    payouts: (id: string) => ["partner-payout-history", id] as const,
    documents: (id: string) => ["partner-documents", id] as const,
    auditLogs: (id: string) => ["partner-audit-logs", id] as const,
  },

  // --- FINANCIALS & PAYMENTS ---
  financials: {
    pendingPayments: ["pendingPayments"] as const,
    ledgerWidgets: ["master-ledger-widgets"] as const,
    ledgerTable: (params: any) => ["master-ledger-table", params] as const,
    expenseWidgets: ["expense-widgets"] as const,
    expenseTableBase: ["expense-table"] as const,
    expenseTable: (params: any) => ["expense-table", params] as const,
    payoutDetails: (id: string) => ["payout-details", id] as const,
    incomesDashboard: ["incomes-dashboard"] as const,
    incomesWidgets: ["incomes-widgets"] as const,
    incomesTable: (params: any) =>
      [
        "incomes-table",
        params.tab,
        params.page,
        params.search,
        params.sort,
        params.method,
      ] as const,
    masterLedger: ["master-ledger"] as const,
  },

  // --- DOCUMENTS (KYC, CONTRACTS, INSPECTIONS) ---
  documents: {
    all: ["documents"] as const,
    kyc: (page?: number, search?: string, filters?: any) =>
      ["documents", "kyc", "all", page, search, filters] as const,
    kycPending: ["documents", "kyc", "pending"] as const,
    kycExpiring: ["documents", "kyc", "expiring"] as const,
    contracts: ["documents", "contracts"] as const,
    inspections: ["documents", "inspections"] as const,
    inspectionTemplate: ["inspection-template"] as const,
  },

  // --- DASHBOARD & REPORTS ---
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    recentBookings: ["dashboard", "recent-bookings"] as const,
    charts: (timeframe: string) => ["dashboard", "charts", timeframe] as const,
    quickInsights: ["dashboard", "quick-insights"] as const,
    reportsMaster: (start: string, end: string, partnerId?: string) =>
      ["reports_master", start, end, partnerId] as const,
  },

  // --- MISC ---
  notifications: {
    all: ["notifications"] as const,
  },
  settings: {
    booking: ["settings", "booking"] as const,
  },
  dropdowns: {
    users: ["dropdown", "users"] as const,
    bookings: ["dropdown", "bookings"] as const,
  },
};
