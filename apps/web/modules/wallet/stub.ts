import type { WalletSummary } from "./types";

/**
 * The balance the approved screens show, in memory.
 *
 * Two screens print these numbers and a third animates them, so they live in one
 * place rather than being typed into each. Swap for `queries.ts` once there is a
 * ledger to read; nothing above this file changes shape when that happens.
 */
export const WALLET_SUMMARY: WalletSummary = {
  availableCents: 12_540,
  pendingCents: 2_450,
  lifetimeCents: 86_000,
  goalCents: 1_000,
};
