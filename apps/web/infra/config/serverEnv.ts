import "server-only";

import { z } from "zod";

/**
 * SECRET environment. Never importable from a client component - the
 * `server-only` import above turns that into a build error.
 *
 * Parsed once, at module load. A missing service-role key crashes the process on
 * boot with a readable message, instead of surfacing as `undefined` inside a
 * payout at 3am. That trade - fail early, fail loudly - is the whole point.
 */
const ServerEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Optional until the integrations are provisioned. Make them required as each
  // one ships, so a misconfigured deploy fails at boot rather than mid-flow.
  APPLE_PASS_TYPE_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  GOOGLE_WALLET_ISSUER_ID: z.string().optional(),
  PAYOUT_PROVIDER_API_KEY: z.string().optional(),
  // Sandbox and production differ, so the host is configuration, not a constant.
  AEROPAY_BASE_URL: z.string().url().optional(),

  // Which payout adapter infra/providers/payouts/ hands out. Defaults to the
  // in-memory stub so local dev and CI need no vendor credentials; a deploy
  // that means to move real money has to say so explicitly.
  PAYOUT_PROVIDER: z.enum(["stub", "aeropay"]).default("stub"),

  // How onboarding runs. "live" is Supabase Auth plus the accounts and consents
  // tables. "stub" keeps the five screens working with none of that - see
  // modules/onboarding/stub.ts. Defaults to live, so only a machine that says so
  // gets a flow that lets anyone in.
  ONBOARDING_MODE: z.enum(["live", "stub"]).default("live"),
});

const parsed = ServerEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid server environment: ${missing} - see .env.example`);
}

export const serverEnv = parsed.data;
