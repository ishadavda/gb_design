import type { LedgerEntry, LedgerFilter } from "./types";

/**
 * PURE LOGIC - what each filter tab on the ledger means.
 *
 * The prototype read a `data-type` attribute off every row and hid the ones that
 * did not match. Same answer, decided here instead of in the DOM, which is why
 * it can be tested without a browser.
 */
export function filterLedger(entries: LedgerEntry[], filter: LedgerFilter): LedgerEntry[] {
  if (filter === "all") return entries;

  return entries.filter((entry) => entry.kind === filter);
}

/** "9 Events" - what the badge beside the ledger header counts. */
export function eventCount(entries: LedgerEntry[]): number {
  return entries.length;
}
