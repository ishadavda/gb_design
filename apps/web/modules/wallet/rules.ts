import type { WalletSummary } from "./types";

/**
 * PURE LOGIC. No I/O, no async - the whole of it is arithmetic the two screens
 * showing a balance must agree on.
 */

/** How full the progress bar is, clamped, as a whole percent. */
export function payoutProgressPercent(summary: WalletSummary): number {
  if (summary.goalCents <= 0) return 100;

  const ratio = summary.availableCents / summary.goalCents;

  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

/** Whether cashing out is possible at all. Below the minimum, nothing moves. */
export function canCashOut(summary: WalletSummary): boolean {
  return summary.availableCents >= summary.goalCents;
}
