/**
 * The nouns of the transaction ledger: one row per thing that moved, or failed
 * to move, money.
 *
 * `kind` is what the row *is*, and is what the filter tabs act on. `icon` is
 * which glyph the row draws - an id, the same standing as `OfferArt` in
 * `modules/offers`, because the approved screens give a rejected receipt a
 * different mark from a rejected scan and that difference is not a decision the
 * component should be inventing.
 *
 * Money is integer cents and always positive; `kind` decides the sign printed.
 */

export type LedgerKind = "credit" | "debit" | "pending" | "rejected";

export type LedgerIcon =
  | "arrow-down-left"
  | "arrow-up-right"
  | "sparkles"
  | "clock"
  | "x-circle"
  | "alert-triangle"
  | "alert-circle"
  | "scan-line"
  | "check-check";

/** Why a receipt was refused, and what the user can say about it. */
export interface LedgerRejection {
  /** "Automated Reject" or "Soft Reject" - the heading on the banner. */
  headline: string;
  reason: string;
  icon: LedgerIcon;
  /** Pre-filled into the dispute sheet. */
  receiptRef: string;
  store: string;
}

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  /** Which accent the row wears; `bonus` is a credit drawn in teal. */
  tone: "credit" | "debit" | "bonus" | "pending" | "rejected";
  icon: LedgerIcon;
  title: string;
  /** The small pill beside the title: "Rebate", "ACH", "Bonus"... */
  tag: string;
  /** "Bud & Rita's · Today, 1:15 PM · Receipt #GB-89211" */
  meta: string;
  amountCents: number;
  /** "Credited", "Paid Out", "Pending", "Rejected" */
  status: string;
  rejection?: LedgerRejection;
}

export type LedgerFilter = "all" | LedgerKind;
