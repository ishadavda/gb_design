import type { Result } from "@/shared/result";
import type { PayoutStatus } from "./types";

/**
 * THE PORT.
 *
 * This file describes what the payouts module NEEDS from a money-moving
 * provider. It is written entirely in our vocabulary.
 *
 * The test of a good port: this file would look exactly the same if we had
 * never heard of Aeropay. No vendor name, no vendor field names, no vendor
 * status strings, no vendor SDK import. If any of those appear here, we have
 * renamed the SDK rather than decoupled from it.
 *
 * Who implements it:  infra/providers/payouts/*  (the adapters)
 * Who consumes it:    ./service.ts               (the business logic)
 *
 * Note the direction. The domain declares the contract; vendors conform to it.
 * That is why `infra/providers/**` importing this file is the one permitted
 * exception to "infra never imports a module".
 */

export interface InitiatePayoutInput {
  /**
   * Providers retry on timeout. Without a stable key, a retry pays out twice.
   * It is in the signature rather than left to the caller's discretion for
   * exactly that reason - a payment API without idempotency is a money bug
   * waiting for a network blip.
   */
  idempotencyKey: string;
  accountId: string;
  /** Integer cents. Adapters convert if their provider wants something else. */
  amountCents: number;
}

export interface InitiatedPayout {
  providerRef: string;
  status: PayoutStatus;
}

/**
 * OUR error vocabulary, and it is deliberately finite.
 *
 * Adapters map every provider-specific failure onto one of these. This is the
 * half of a port that teams usually skip: they abstract the happy path, let
 * `"DECLINED_INSUFFICIENT_FUNDS"` leak into the service, and then discover at
 * swap time that the business logic was coupled to the vendor after all.
 *
 * If a provider invents a failure that genuinely does not fit, add a member
 * here on purpose - do not pass the vendor's string through.
 */
export type PayoutProviderError =
  | "provider_unavailable"
  | "rejected"
  | "insufficient_funds"
  | "invalid_destination";

export interface PayoutProvider {
  /**
   * Ask the provider to move money. Expected refusals come back as
   * `Result.fail`; genuine faults (network down, bad credentials) throw - see
   * shared/result.ts for that split.
   */
  initiatePayout(input: InitiatePayoutInput): Promise<Result<InitiatedPayout, PayoutProviderError>>;
}
