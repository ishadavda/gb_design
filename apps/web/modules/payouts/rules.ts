import { MINIMUM_PAYOUT_CENTS } from "./types";

/**
 * Pure logic. No I/O, no async, no database, no provider - give it two numbers,
 * get an answer. This is the most heavily tested kind of file in the codebase.
 *
 * Note what is NOT here: any mention of a provider. Whether Aeropay would also
 * decline this payout is irrelevant to whether OUR rules allow it. Keeping the
 * two separate is why swapping providers cannot change our policy by accident.
 */

export type PayoutRefusal = "not_positive" | "below_minimum" | "insufficient_balance";

/**
 * Returns the reason this payout must be refused, or `null` when it may go
 * ahead.
 *
 * Returning the reason rather than a boolean lets the action layer write the
 * copy for each case; a `false` would force the caller to re-derive why.
 */
export function payoutRefusal(availableCents: number, amountCents: number): PayoutRefusal | null {
  if (amountCents <= 0) return "not_positive";
  if (amountCents < MINIMUM_PAYOUT_CENTS) return "below_minimum";
  if (amountCents > availableCents) return "insufficient_balance";
  return null;
}
