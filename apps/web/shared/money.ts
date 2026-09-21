/**
 * Cents in, the string the screens print out.
 *
 * Money is integer cents everywhere above this file (ARCHITECTURE.md §15);
 * formatting is the last thing that happens to it, and it happens here so that
 * "$125.40" and "$5 back" cannot drift apart between two screens.
 */

/** "$125.40" - always two decimals, for balances and ledger rows. */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** "$5" for a whole dollar rebate, "$4.50" when it is not. Used on deal badges. */
export function formatRebate(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : formatUsd(cents);
}
