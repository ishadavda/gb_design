import { describe, expect, it } from "vitest";
import { AeropayPayoutProvider } from "./aeropay";

/**
 * `fetch` is a constructor argument, so a canned Response is all it takes - no
 * network, no mocking library, consistent with the rest of the suite.
 */
const config = { baseUrl: "https://sandbox.example", apiKey: "key_123" };

const providerReturning = (payload: unknown, status = 200) => {
  const seen: { url: string; init: RequestInit }[] = [];
  const provider = new AeropayPayoutProvider(config, async (url, init) => {
    seen.push({ url: String(url), init: init ?? {} });
    return new Response(typeof payload === "string" ? payload : JSON.stringify(payload), {
      status,
    });
  });
  return { provider, seen };
};

const transfer = (status: string) => ({ transaction_uuid: "aeropay_tx_1", status });

const input = { idempotencyKey: "req_abc", accountId: "acc_123", amountCents: 2_550 };

describe("AeropayPayoutProvider", () => {
  it("posts to the transfers endpoint with auth and idempotency headers", async () => {
    const { provider, seen } = providerReturning(transfer("PENDING"));

    await provider.initiatePayout(input);

    expect(seen[0]?.url).toBe("https://sandbox.example/transfers");
    expect(seen[0]?.init.method).toBe("POST");
    expect(seen[0]?.init.headers).toMatchObject({
      authorization: "Bearer key_123",
      "content-type": "application/json",
      "idempotency-key": "req_abc",
    });
  });

  it("converts our integer cents into the dollars Aeropay expects", async () => {
    const { provider, seen } = providerReturning(transfer("PENDING"));

    await provider.initiatePayout(input);

    expect(JSON.parse(String(seen[0]?.init.body))).toMatchObject({
      user_uuid: "acc_123",
      amount: 25.5,
      transfer_type: "PUSH",
    });
  });

  it.each([
    ["COMPLETED", "paid"],
    ["PENDING", "pending"],
    ["PENDING_REVIEW", "pending"],
  ])("maps %s onto our %s status", async (vendorStatus, ourStatus) => {
    const { provider } = providerReturning(transfer(vendorStatus));

    const result = await provider.initiatePayout(input);

    expect(result).toMatchObject({
      ok: true,
      data: { providerRef: "aeropay_tx_1", status: ourStatus },
    });
  });

  it.each([
    ["DECLINED_INSUFFICIENT_FUNDS", "insufficient_funds"],
    ["DECLINED_INVALID_ACCOUNT", "invalid_destination"],
  ])("maps %s onto our %s error", async (vendorStatus, ourError) => {
    const { provider } = providerReturning(transfer(vendorStatus));

    const result = await provider.initiatePayout(input);

    expect(result).toMatchObject({ ok: false, error: ourError });
  });

  it("maps an unrecognised status to a generic rejection rather than passing it through", async () => {
    // A provider adding a status must not silently become a new domain concept.
    const { provider } = providerReturning(transfer("SOME_NEW_STATUS_THEY_ADDED"));

    const result = await provider.initiatePayout(input);

    expect(result).toMatchObject({ ok: false, error: "rejected" });
  });

  it("throws on a non-2xx response rather than inventing a status", async () => {
    const { provider } = providerReturning("upstream exploded", 503);

    await expect(provider.initiatePayout(input)).rejects.toThrow("HTTP 503");
  });

  it("throws on a transport fault, so a timeout is never read as a decline", async () => {
    const provider = new AeropayPayoutProvider(config, async () => {
      throw new Error("socket hang up");
    });

    await expect(provider.initiatePayout(input)).rejects.toThrow(
      "Aeropay POST /transfers failed",
    );
  });

  it("rejects a response whose shape it does not recognise", async () => {
    // Their field renamed, or a proxy returned something else entirely.
    const { provider } = providerReturning({ id: "aeropay_tx_1" });

    await expect(provider.initiatePayout(input)).rejects.toThrow("unrecognised payload");
  });
});
