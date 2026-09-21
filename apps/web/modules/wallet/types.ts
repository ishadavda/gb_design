/**
 * What the balance card and the cash-out screen both read.
 *
 * Integer cents throughout (ARCHITECTURE.md §15). `goalCents` is the payout
 * minimum, not a target the user set - the screens phrase it "Goal: $10.00 min
 * payout" because reaching it is what unlocks the button.
 */
export interface WalletSummary {
  availableCents: number;
  pendingCents: number;
  lifetimeCents: number;
  goalCents: number;
}
