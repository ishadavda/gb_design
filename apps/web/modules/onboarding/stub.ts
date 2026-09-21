import "server-only";

import { cookies } from "next/headers";
import { serverEnv } from "@/infra/config/serverEnv";
import type { OnboardingState } from "./types";

/**
 * ONBOARDING WITHOUT A BACKEND - the stub half of ONBOARDING_MODE.
 *
 * Same bargain as infra/providers/payouts/stub.ts: a flow you cannot run is a
 * flow you cannot finish building. Sending a passcode needs an SMS provider
 * enabled on the Supabase project; until one is, every number entered fails on
 * the phone screen, which leaves the four screens behind it unreachable.
 *
 * So this keeps all of onboarding in one cookie and accepts a fixed passcode. No
 * SMS, no session, no database - which is also precisely why ONBOARDING_MODE
 * defaults to "live": switched on, this lets anyone through every gate.
 *
 * It is a store, not a fake Supabase. The live path keeps its own reads; this
 * one is short-circuited in front of them, in getOnboardingState and in each
 * action, so neither path has to know about the other.
 */

/**
 * The one code the stub accepts, four digits as on the approved screen - which
 * is also why it cannot go through modules/auth/schema.ts, where a passcode is
 * six digits because that is what Supabase issues. Shown on screen: there is
 * nowhere to send it.
 */
export const STUB_PASSCODE = "4821";

const STUB_COOKIE = "gb_stub_onboarding";

export function isStubOnboarding(): boolean {
  return serverEnv.ONBOARDING_MODE === "stub";
}

/** What the live flow would have spread across a session and two tables. */
export interface StubProgress {
  phone?: string;
  displayName?: string;
  phoneVerified?: boolean;
  hasAccount?: boolean;
  hasConsented?: boolean;
}

export async function readStubProgress(): Promise<StubProgress> {
  const raw = (await cookies()).get(STUB_COOKIE)?.value;
  if (!raw) return {};

  try {
    return JSON.parse(raw) as StubProgress;
  } catch {
    // A truncated or hand-edited cookie restarts the flow instead of crashing it.
    return {};
  }
}

/** Merges, so each step writes only the fact it just learned. */
export async function saveStubProgress(patch: StubProgress): Promise<void> {
  const next: StubProgress = { ...(await readStubProgress()), ...patch };

  (await cookies()).set(STUB_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

/**
 * The same four booleans rules.ts runs on, read from the cookie rather than from
 * Supabase. The age gate is excluded on purpose: it was already only a cookie,
 * so it works identically in both modes.
 */
export function stubOnboardingState(
  progress: StubProgress,
  ageConfirmed: boolean,
): OnboardingState {
  return {
    ageConfirmed,
    phoneVerified: progress.phoneVerified === true,
    hasAccount: progress.hasAccount === true,
    hasConsented: progress.hasConsented === true,
  };
}
