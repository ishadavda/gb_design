import { describe, expect, it } from "vitest";
import { eventCount, filterLedger } from "./rules";
import type { LedgerEntry } from "./types";

const entry = (overrides: Partial<LedgerEntry> = {}): LedgerEntry => ({
  id: "GB-1",
  kind: "credit",
  tone: "credit",
  icon: "arrow-down-left",
  title: "Twenty Twenty Flower",
  tag: "Rebate",
  meta: "Bud & Rita's · Today",
  amountCents: 500,
  status: "Credited",
  ...overrides,
});

describe("filterLedger", () => {
  const entries = [
    entry({ id: "a", kind: "credit" }),
    entry({ id: "b", kind: "debit" }),
    entry({ id: "c", kind: "pending" }),
    entry({ id: "d", kind: "rejected" }),
    entry({ id: "e", kind: "credit" }),
  ];

  it("returns everything under 'all', including the same array contents", () => {
    expect(filterLedger(entries, "all")).toHaveLength(5);
  });

  it("keeps only rows of the chosen kind", () => {
    expect(filterLedger(entries, "credit").map((row) => row.id)).toEqual(["a", "e"]);
    expect(filterLedger(entries, "debit").map((row) => row.id)).toEqual(["b"]);
    expect(filterLedger(entries, "rejected").map((row) => row.id)).toEqual(["d"]);
  });

  it("returns an empty list rather than everything when nothing matches", () => {
    expect(filterLedger([entry({ kind: "credit" })], "pending")).toEqual([]);
  });

  it("does not mutate the list it was given", () => {
    const original = [...entries];

    filterLedger(entries, "credit");

    expect(entries).toEqual(original);
  });
});

describe("eventCount", () => {
  it("counts every row, whatever its kind", () => {
    expect(eventCount([entry(), entry({ kind: "rejected" })])).toBe(2);
  });
});
