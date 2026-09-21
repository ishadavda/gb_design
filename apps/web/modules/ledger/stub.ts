import type { LedgerEntry } from "./types";

/**
 * The nine events the approved cash-out screen lists, in order, verbatim.
 *
 * In memory for the same reason as the offers and the balance: there is no
 * ledger table yet, and inventing one is a schema decision rather than a UI one.
 * When `queries.ts` arrives beside this file the page imports that instead and
 * nothing above it changes shape.
 */
export const LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "GB-89211",
    kind: "credit",
    tone: "credit",
    icon: "arrow-down-left",
    title: "Twenty Twenty Flower",
    tag: "Rebate",
    meta: "Bud & Rita's · Today, 1:15 PM · Receipt #GB-89211",
    amountCents: 500,
    status: "Credited",
  },
  {
    id: "GB-89190",
    kind: "credit",
    tone: "credit",
    icon: "arrow-down-left",
    title: "Graffiti pre-rolls",
    tag: "Rebate",
    meta: "Sunnyside · Yesterday, 4:30 PM · Receipt #GB-89190",
    amountCents: 400,
    status: "Credited",
  },
  {
    id: "ACH-48291",
    kind: "debit",
    tone: "debit",
    icon: "arrow-up-right",
    title: "Direct Deposit Withdrawal",
    tag: "ACH",
    meta: "Chase ••••4892 · Sep 02, 2026 · Trx #ACH-48291",
    amountCents: 5_000,
    status: "Paid Out",
  },
  {
    id: "GB-88742",
    kind: "credit",
    tone: "credit",
    icon: "arrow-down-left",
    title: "Signature concentrates",
    tag: "Rebate",
    meta: "EarthMed · Aug 28, 2026 · Receipt #GB-88742",
    amountCents: 600,
    status: "Credited",
  },
  {
    id: "ACH-47120",
    kind: "debit",
    tone: "debit",
    icon: "arrow-up-right",
    title: "Direct Deposit Withdrawal",
    tag: "ACH",
    meta: "Chase ••••4892 · Jul 30, 2026 · Trx #ACH-47120",
    amountCents: 7_500,
    status: "Paid Out",
  },
  {
    id: "GB-WELCOME",
    kind: "credit",
    tone: "bonus",
    icon: "sparkles",
    title: "Welcome Credit Incentive",
    tag: "Bonus",
    meta: "Onboarding Pass Setup · Jul 23, 2026 · Ref #GB-WELCOME",
    amountCents: 500,
    status: "Credited",
  },
  {
    id: "GB-CHECKIN",
    kind: "pending",
    tone: "pending",
    icon: "clock",
    title: "Dispensary Check-in Ingest",
    tag: "Processing",
    meta: "Bud & Rita's Niles · Today, 1:10 PM · AI Reviewing",
    amountCents: 2_450,
    status: "Pending",
  },
  {
    id: "GB-87410",
    kind: "rejected",
    tone: "rejected",
    icon: "x-circle",
    title: "High Supply 14g Tub",
    tag: "Rejected",
    meta: "Sunnyside Elmwood Park · Aug 24, 2026 · Receipt #GB-87410",
    amountCents: 600,
    status: "Rejected",
    rejection: {
      headline: "Automated Reject:",
      reason: "Purchase date fell outside promo drop window (Aug 25–28).",
      icon: "alert-circle",
      receiptRef: "GB-87410",
      store: "Sunnyside Elmwood Park",
    },
  },
  {
    id: "GB-86902",
    kind: "rejected",
    tone: "rejected",
    icon: "alert-triangle",
    title: "Ozone Reserve Live Resin",
    tag: "Rejected",
    meta: "Ascend Logan Square · Aug 19, 2026 · Receipt #GB-86902",
    amountCents: 500,
    status: "Rejected",
    rejection: {
      headline: "Soft Reject:",
      reason: "Laplacian variance check failed (Var = 42 < 100) — text illegible.",
      icon: "scan-line",
      receiptRef: "GB-86902",
      store: "Ascend Logan Square",
    },
  },
];

/** The reason the dispute sheet quotes back, which is longer than the banner's. */
export const DISPUTE_REASONS: Record<string, string> = {
  "GB-87410": "Receipt date (Aug 24) fell outside brand promo drop window (Aug 25–28).",
  "GB-86902":
    "Laplacian focus check failed (Variance = 42 < 100) — dispensary slip text illegible.",
};
