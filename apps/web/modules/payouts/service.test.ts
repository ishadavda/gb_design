import { describe, expect, it } from "vitest";
import { StubPayoutProvider } from "@/infra/providers/payouts/stub";
import { requestPayout, type RequestPayoutInput } from "@/modules/payouts";

/**
 * THE PAYOFF.
 *
 * This file tests real money-movement logic with no network, no API key, no
 * vendor SDK and no mocking library - just the stub adapter passed in as an
 * argument. That is what the port bought.
 *
 * Compare the alternative: if service.ts imported the Aeropay SDK directly,
 * every one of these tests would need `vi.mock("@aeropay/sdk")` and would break
 * whenever their SDK's shape changed.
 */

const input = (overrides: Partial<RequestPayoutInput> = {}): RequestPayoutInput => ({
  accountId: "acc_123",
  amountCents: 5_000,
  availableCents: 10_000,
  idempotencyKey: "req_abc",
  ...overrides,
});

describe("requestPayout", () => {
  it("initiates the payout when our rules allow it", async () => {
    const provider = new StubPayoutProvider();

    const result = await requestPayout(provider, input());

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({ data: { providerRef: "stub_req_abc", status: "pending" } });
  });

  it("passes the idempotency key through to the provider unchanged", async () => {
    const provider = new StubPayoutProvider();

    await requestPayout(provider, input({ idempotencyKey: "req_xyz" }));

    expect(provider.calls).toHaveLength(1);
    expect(provider.calls[0]?.idempotencyKey).toBe("req_xyz");
  });

  it("refuses on our own rules WITHOUT calling the provider", async () => {
    const provider = new StubPayoutProvider();

    const result = await requestPayout(provider, input({ amountCents: 1 }));

    expect(result).toMatchObject({ ok: false, error: "below_minimum" });
    // The important assertion: our policy is enforced before we spend a network
    // call, and the provider never gets to be the one deciding our rules.
    expect(provider.calls).toHaveLength(0);
  });

  it("refuses when the amount exceeds the available balance", async () => {
    const provider = new StubPayoutProvider();

    const result = await requestPayout(provider, input({ amountCents: 20_000 }));

    expect(result).toMatchObject({ ok: false, error: "insufficient_balance" });
    expect(provider.calls).toHaveLength(0);
  });

  it("surfaces a provider refusal in our own error vocabulary", async () => {
    // The stub stands in for any provider declining. Note the error is ours -
    // no vendor status string reaches this assertion, which is the whole point.
    const provider = new StubPayoutProvider({ failWith: "insufficient_funds" });

    const result = await requestPayout(provider, input());

    expect(result).toMatchObject({ ok: false, error: "insufficient_funds" });
    expect(provider.calls).toHaveLength(1);
  });

  it("surfaces an unavailable provider without changing our rules", async () => {
    const provider = new StubPayoutProvider({ failWith: "provider_unavailable" });

    const result = await requestPayout(provider, input());

    expect(result).toMatchObject({ ok: false, error: "provider_unavailable" });
  });
});
