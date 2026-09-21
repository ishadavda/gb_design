import "server-only";

import { serverEnv } from "@/infra/config/serverEnv";
import type { PayoutProvider } from "@/modules/payouts/port";
import { AppError } from "@/shared/result";
import { AeropayPayoutProvider } from "./aeropay";
import { stubPayoutProvider } from "./stub";

/**
 * THE COMPOSITION POINT - the only file in the app that names a payout vendor.
 *
 * No vendor SDK import, vendor field name or vendor status string exists outside
 * infra/providers/. The two deliberate exceptions are the `PAYOUT_PROVIDER`
 * enum in infra/config/serverEnv.ts - naming the choice is this layer's job -
 * and the comments in modules/payouts/, which cite Aeropay to explain the
 * pattern. Neither couples any logic to a vendor.
 *
 * That is the property worth protecting: it is what makes "swap the provider" a
 * one-line change here plus a sibling adapter, rather than an audit of every
 * file that touches money.
 *
 * `server-only` because a provider holds credentials. Importing this from a
 * client component is a build error rather than a leaked API key.
 *
 * Adapters are grouped by PORT (providers/payouts/) rather than by vendor, so
 * every candidate implementation of one interface sits side by side - that is
 * the view you want when swapping. If one vendor ever implements two ports,
 * lift the shared client setup out and keep the adapters where they are.
 */
export function getPayoutProvider(): PayoutProvider {
  switch (serverEnv.PAYOUT_PROVIDER) {
    case "aeropay":
      return createAeropayProvider();
    case "stub":
      return stubPayoutProvider;
  }
}

/**
 * The only place Aeropay's credentials are read.
 *
 * Kept here rather than in aeropay.ts so that the adapter and its transport
 * know nothing about environment variables - which is what makes both of them
 * testable with explicit values instead of a mutated `process.env`.
 *
 * Throws if the vendor is selected but unconfigured, so a bad deploy fails the
 * first time a provider is requested rather than midway through a payout.
 */
function createAeropayProvider(): PayoutProvider {
  const { PAYOUT_PROVIDER_API_KEY: apiKey, AEROPAY_BASE_URL: baseUrl } = serverEnv;

  if (!apiKey || !baseUrl) {
    throw new AppError(
      "PAYOUT_PROVIDER=aeropay requires PAYOUT_PROVIDER_API_KEY and AEROPAY_BASE_URL " +
        "- see apps/web/.env.example, or set PAYOUT_PROVIDER=stub for local work.",
    );
  }

  return new AeropayPayoutProvider({ baseUrl, apiKey });
}
