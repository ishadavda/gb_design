import type {
  InitiatePayoutInput,
  InitiatedPayout,
  PayoutProvider,
  PayoutProviderError,
} from "@/modules/payouts/port";
import { fail, ok, type Result } from "@/shared/result";

/**
 * AN ADAPTER - the in-memory one.
 *
 * This is not a second-class citizen or a test fixture bolted on afterwards; it
 * is the reason the port pays for itself on day one. With this in place the
 * whole payout flow is developable and testable with no Aeropay account, no API
 * key, no network and no money.
 *
 * `calls` is exposed so a test can assert what the service asked for - notably
 * that the same idempotency key is not sent twice.
 */
export class StubPayoutProvider implements PayoutProvider {
  readonly calls: InitiatePayoutInput[] = [];

  constructor(private readonly behaviour: { failWith?: PayoutProviderError } = {}) {}

  async initiatePayout(
    input: InitiatePayoutInput,
  ): Promise<Result<InitiatedPayout, PayoutProviderError>> {
    this.calls.push(input);

    if (this.behaviour.failWith) return fail(this.behaviour.failWith);

    // Deterministic ref derived from the idempotency key: replaying the same
    // request yields the same providerRef, which is how a real provider behaves
    // and what makes retry handling testable.
    return ok({ providerRef: `stub_${input.idempotencyKey}`, status: "pending" });
  }
}

/**
 * Created once at module load - safe, because there is no per-request state
 * here. Contrast infra/supabase/server.ts, which must be a function because it
 * carries the caller's session.
 */
export const stubPayoutProvider = new StubPayoutProvider();
