import type { Store } from "./types";

/**
 * PURE LOGIC - what the directory search means.
 *
 * The prototype matched the typed text against every field of the row, so "60018"
 * and "Cook" and "Mint" all find something. Kept here rather than inside the
 * component, because "what counts as a match" is a decision and decisions are
 * testable without a browser.
 */
export function searchStores(stores: Store[], term: string): Store[] {
  const needle = term.trim().toLowerCase();
  if (needle === "") return stores;

  return stores.filter((store) =>
    [store.name, store.address, store.city, store.zip, store.county]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
