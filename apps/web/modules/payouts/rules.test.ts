import { describe, expect, it } from "vitest";
import { MINIMUM_PAYOUT_CENTS, payoutRefusal } from "@/modules/payouts";

/**
 * What pure logic costs to test: no mocks, no database, no provider, no async.
 * Two numbers in, an answer out.
 */
describe("payoutRefusal", () => {
  it("allows a payout at or above the minimum that is covered by the balance", () => {
    expect(payoutRefusal(5_000, MINIMUM_PAYOUT_CENTS)).toBeNull();
  });

  it("refuses a zero amount", () => {
    expect(payoutRefusal(5_000, 0)).toBe("not_positive");
  });

  it("refuses a negative amount", () => {
    expect(payoutRefusal(5_000, -100)).toBe("not_positive");
  });

  it("refuses an amount below the minimum", () => {
    expect(payoutRefusal(5_000, MINIMUM_PAYOUT_CENTS - 1)).toBe("below_minimum");
  });

  it("refuses an amount larger than the balance", () => {
    expect(payoutRefusal(2_000, 2_001)).toBe("insufficient_balance");
  });

  it("allows spending the balance down to exactly zero", () => {
    expect(payoutRefusal(2_000, 2_000)).toBeNull();
  });

  it("reports the amount problem before the balance problem", () => {
    // A negative amount is always "not_positive", never "insufficient_balance" -
    // the order of the guards is a decision, so it gets a test.
    expect(payoutRefusal(0, -1)).toBe("not_positive");
  });
});
