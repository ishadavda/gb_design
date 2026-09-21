import { z } from "zod";
import { logger } from "@/infra/observability/logger";
import type {
  InitiatePayoutInput,
  InitiatedPayout,
  PayoutProvider,
  PayoutProviderError,
} from "@/modules/payouts/port";
import { AppError, fail, ok, type Result } from "@/shared/result";

/**
 * AN ADAPTER - the Aeropay one.
 *
 * Everything Aeropay-shaped in this codebase lives in this file: their field
 * names, their dollars-instead-of-cents, their status strings, their endpoint
 * paths. That is the deal the port buys us. Swapping providers means writing a
 * sibling of this file and changing one line in ./index.ts - no business logic
 * moves.
 *
 * Config arrives as a constructor argument and `fetch` is injectable, so this
 * is testable with explicit values and no network. Reading env stays at the
 * composition point in ./index.ts.
 *
 * UNVERIFIED, check against Aeropay's API reference before going live:
 *   - endpoint paths and the auth header scheme
 *   - whether a business DECLINE arrives as HTTP 200 with a declined status, or
 *     as a 4xx. This assumes the former; see the note on `request`.
 */

const DEFAULT_TIMEOUT_MS = 10_000;

/** Parsed at the boundary - a provider's JSON is untrusted input like any other. */
const TransferResponseSchema = z.object({
  transaction_uuid: z.string().min(1),
  status: z.string().min(1),
});

export class AeropayPayoutProvider implements PayoutProvider {
  constructor(
    private readonly config: { baseUrl: string; apiKey: string; timeoutMs?: number },
    private readonly fetchImpl: typeof globalThis.fetch = globalThis.fetch,
  ) {}

  async initiatePayout(
    input: InitiatePayoutInput,
  ): Promise<Result<InitiatedPayout, PayoutProviderError>> {
    const response = await this.request("POST", "/transfers", TransferResponseSchema, {
      headers: { "idempotency-key": input.idempotencyKey },
      body: {
        user_uuid: input.accountId,
        // Aeropay wants dollars. We hold cents. The conversion happens here, once.
        amount: input.amountCents / 100,
        transfer_type: "PUSH",
      },
    });

    return this.mapStatus(response.status, response.transaction_uuid);
  }

  /**
   * Translate their vocabulary into ours. This is the half of a port that teams
   * skip, and skipping it is why their abstraction fails at swap time: if
   * "DECLINED_INSUFFICIENT_FUNDS" ever reaches service.ts, the business logic
   * is coupled to Aeropay no matter how clean the interface looked.
   *
   * An unrecognised status maps to "rejected" rather than being passed through.
   * A provider adding a status must not silently become a new domain concept.
   */
  private mapStatus(
    status: string,
    transactionUuid: string,
  ): Result<InitiatedPayout, PayoutProviderError> {
    switch (status) {
      case "COMPLETED":
        return ok({ providerRef: transactionUuid, status: "paid" });
      case "PENDING":
      case "PENDING_REVIEW":
        return ok({ providerRef: transactionUuid, status: "pending" });
      case "DECLINED_INSUFFICIENT_FUNDS":
        return fail("insufficient_funds");
      case "DECLINED_INVALID_ACCOUNT":
        return fail("invalid_destination");
      default:
        return fail("rejected", `Unmapped Aeropay status: ${status}`);
    }
  }

  /**
   * Every call to Aeropay goes through here: auth, timeout, failure handling
   * and response parsing in one place. Another endpoint is one more call, not
   * another copy of this.
   *
   * Faults THROW rather than returning a Result, because a network error is
   * unexpected - shared/result.ts draws that line. The caller must not read a
   * throw as "declined": on a timeout the request may well have succeeded and
   * we simply never heard back. That is what the idempotency key is for, and
   * why a retry must reuse it rather than mint a new one.
   *
   * If declines turn out to arrive as 4xx, let those specific codes fall
   * through to parsing instead of throwing - 5xx and faults should still throw.
   */
  private async request<T>(
    method: "GET" | "POST",
    path: string,
    schema: z.ZodType<T>,
    init: { body?: unknown; headers?: Record<string, string> } = {},
  ): Promise<T> {
    let response: Response;

    try {
      response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          ...(init.body === undefined ? {} : { "content-type": "application/json" }),
          ...init.headers,
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        // fetch has no default timeout. Without this, a hung provider ties up
        // the function until the platform kills it.
        signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });
    } catch (cause) {
      throw new AppError(`Aeropay ${method} ${path} failed`, cause);
    }

    if (!response.ok) {
      // Status and path only. A payment response body carries account and
      // routing detail - logger.ts's rule is "log identifiers".
      logger.error("aeropay_http_error", { method, path, status: response.status });
      throw new AppError(`Aeropay returned HTTP ${response.status} for ${method} ${path}`);
    }

    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw new AppError(`Aeropay returned an unrecognised payload for ${method} ${path}`);
    }

    return parsed.data;
  }
}
