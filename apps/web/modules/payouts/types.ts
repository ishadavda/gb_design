/**
 * The nouns. No infrastructure imports - see ARCHITECTURE.md §4.
 *
 * Everything here is OUR vocabulary. No provider's field names, no provider's
 * status strings. That is what makes the provider swappable: if Aeropay's terms
 * appear in this file, every module that reads a Payout is coupled to Aeropay.
 */

/**
 * Where a payout has got to, in our terms.
 *
 * Providers each have their own, longer list - "PENDING_REVIEW", "SETTLED",
 * "ACH_RETURNED" and so on. Mapping their vocabulary onto these three is the
 * adapter's job, not this module's.
 */
export type PayoutStatus = "pending" | "paid" | "failed";

export interface Payout {
  id: string;
  accountId: string;
  /**
   * Integer cents. Money is never a float - see ARCHITECTURE.md §15. Providers
   * that want dollars get the conversion done in their adapter.
   */
  amountCents: number;
  status: PayoutStatus;
  /**
   * The provider's own id for this transfer. Our only handle on their record,
   * so it is also what an inbound settlement webhook is matched on.
   */
  providerRef: string;
  createdAt: string;
}

/** Nobody may cash out less than this. */
export const MINIMUM_PAYOUT_CENTS = 1_000;
