import { fail, ok, type Result } from "@/shared/result";
import type { InitiatedPayout, PayoutProvider, PayoutProviderError } from "./port";
import { payoutRefusal, type PayoutRefusal } from "./rules";

/**
 * Writes. The standard shape: read, decide, refuse, write.
 *
 * The whole point of this file is what it does NOT contain: no vendor SDK
 * import, no vendor field names, no vendor status strings. It talks to a
 * `PayoutProvider` - an interface this module owns. Swapping Aeropay for
 * something else does not change one line here.
 *
 * The provider arrives as an ARGUMENT, exactly like the Supabase client does
 * elsewhere (ARCHITECTURE.md §4, the client-as-parameter rule). Two reasons,
 * and they are the same two: tests pass a stub instead of mocking module
 * imports, and the caller has to choose a provider on purpose.
 *
 * REFERENCE SLICE - this deliberately takes no Supabase client, because there
 * is no ledger table yet. A real payouts service would take one as its FIRST
 * argument, read the balance itself rather than being handed `availableCents`,
 * and record the payout row after the provider call. Everything about the
 * provider boundary is real; only the persistence is missing.
 */

export interface RequestPayoutInput {
  accountId: string;
  amountCents: number;
  /** Would be read from the ledger by this function. See the note above. */
  availableCents: number;
  idempotencyKey: string;
}

/** Our refusals and the provider's, unioned. The action layer maps these to copy. */
export type PayoutError = PayoutRefusal | PayoutProviderError;

export async function requestPayout(
  provider: PayoutProvider,
  input: RequestPayoutInput,
): Promise<Result<InitiatedPayout, PayoutError>> {
  // 1. Decide, using the pure rule. Our policy, checked before we spend a
  //    network call - and before the provider gets a chance to be the one
  //    enforcing our business rules.
  const refusal = payoutRefusal(input.availableCents, input.amountCents);
  if (refusal) return fail(refusal);

  // 2. Hand off across the port. We have no idea who is on the other side.
  const initiated = await provider.initiatePayout({
    idempotencyKey: input.idempotencyKey,
    accountId: input.accountId,
    amountCents: input.amountCents,
  });

  // 3. The provider refused. Pass our own error vocabulary upward - note there
  //    is nothing vendor-shaped to translate here, because the adapter already
  //    did it.
  if (!initiated.ok) return fail(initiated.error);

  // 4. A real implementation records the payout row here, keyed on
  //    `providerRef` so an inbound settlement webhook can find it and so a
  //    retry cannot insert it twice.
  return ok(initiated.data);
}
