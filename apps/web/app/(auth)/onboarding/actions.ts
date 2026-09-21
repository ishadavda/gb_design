"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import type { FormState } from "./formState";
import { OtpSchema, PhoneSchema, getSessionUser, sendLoginCode, verifyLoginCode } from "@/modules/auth";
import { CreateAccountSchema, createAccount, findAccountByUserId } from "@/modules/accounts";
import { grantRequiredConsents } from "@/modules/consent";
import {
  AGE_GATE_COOKIE,
  AgeGateSchema,
  STUB_PASSCODE,
  isOldEnough,
  isStubOnboarding,
  saveStubProgress,
} from "@/modules/onboarding";
import { createAdminClient } from "@/infra/supabase/admin";
import { AppError } from "@/shared/result";

/**
 * LAYER 4 - the boundary between browser and server.
 *
 * "use server" makes every export here callable from a client component; Next.js
 * turns the call into a network request, so there is no fetch() and no URL.
 *
 * Every action does the same four things and nothing else:
 *   1. work out who is calling   2. validate the input
 *   3. hand off to modules/          4. turn the result into something the UI shows
 *
 * No business rules live here. `isOldEnough` is imported, not written inline.
 */

/**
 * tsconfig sets noUncheckedIndexedAccess, so issues[0] is possibly undefined -
 * correctly, since a ZodError could in principle carry an empty issue list.
 * One helper beats four non-null assertions.
 */
function firstError(error: ZodError): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

// ---------------------------------------------------------------------------
// Step 1 - age gate
// ---------------------------------------------------------------------------
export async function confirmAgeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = AgeGateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: firstError(parsed.error) };
  }

  // The rule lives in modules/onboarding/rules.ts, not here.
  if (!isOldEnough(parsed.data.dateOfBirth)) {
    return { status: "error", message: "You must be 21 or older to use Greenback." };
  }

  // Only the ANSWER is stored, never the date of birth. We have no reason to keep
  // it, and data you do not hold cannot leak.
  const cookieStore = await cookies();
  cookieStore.set(AGE_GATE_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  redirect("/onboarding/phone");
}

// ---------------------------------------------------------------------------
// Step 2 - send the code
// ---------------------------------------------------------------------------
export async function sendCodeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = PhoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: firstError(parsed.error) };
  }

  // Nothing to send, and nothing that could fail: the verify screen prints the
  // one passcode the stub takes.
  if (isStubOnboarding()) {
    await saveStubProgress({ phone: parsed.data.phone });
    redirect(`/onboarding/verify?phone=${encodeURIComponent(parsed.data.phone)}`);
  }

  const result = await sendLoginCode(parsed.data);

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.error === "rate_limited"
          ? "Too many attempts. Try again in a few minutes."
          : "We couldn't send that code. Check the number and try again.",
    };
  }

  redirect(`/onboarding/verify?phone=${encodeURIComponent(parsed.data.phone)}`);
}

// ---------------------------------------------------------------------------
// Step 3 - check the code. Success sets the session cookie.
// ---------------------------------------------------------------------------
export async function verifyCodeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Ahead of the schema, not after it: OtpSchema requires the six digits Supabase
  // issues, and the mock passcode is four.
  if (isStubOnboarding()) return stubVerify(formData);

  const parsed = OtpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: firstError(parsed.error) };
  }

  const result = await verifyLoginCode(parsed.data);

  if (!result.ok) {
    return { status: "error", message: "That code isn't right. Check it and try again." };
  }

  redirect("/onboarding/profile");
}

// ---------------------------------------------------------------------------
// Step 4 - create the account
// ---------------------------------------------------------------------------
export async function createProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Ahead of the session check, not after it: the stub has no session to fail.
  if (isStubOnboarding()) return stubProfile(formData);

  // WHO. Re-derived from the session. Nothing about identity is read from the form.
  const user = await getSessionUser();
  if (!user) throw new AppError("Not authenticated");

  const parsed = CreateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: firstError(parsed.error) };
  }

  // Admin client: the schema has no customer-facing INSERT policy by design.
  await createAccount(createAdminClient(), user.userId, parsed.data);

  redirect("/onboarding/consent");
}

// ---------------------------------------------------------------------------
// Step 5 - record consent
// ---------------------------------------------------------------------------
export async function grantConsentAction(): Promise<void> {
  if (isStubOnboarding()) {
    await saveStubProgress({ hasConsented: true });
    redirect("/onboarding/done");
  }

  const user = await getSessionUser();
  if (!user) throw new AppError("Not authenticated");

  const supabase = createAdminClient();

  const account = await findAccountByUserId(supabase, user.userId);
  if (!account) throw new AppError("No account to consent for");

  await grantRequiredConsents(supabase, account.id);

  redirect("/onboarding/done");
}

// ---------------------------------------------------------------------------
// ONBOARDING_MODE=stub
// ---------------------------------------------------------------------------

/**
 * The verify step with Supabase taken out: one fixed passcode and no session.
 *
 * A wrong code is still rejected - a screen that always says yes is not the
 * screen being reviewed - and the wording is the prototype's, because under this
 * mode the simulated SMS at the top really is where the code came from.
 */
async function stubVerify(formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "").trim();

  if (token !== STUB_PASSCODE) {
    return { status: "error", message: "Passcode incorrect! Check the SMS simulation at the top." };
  }

  await saveStubProgress({ phoneVerified: true });

  redirect("/onboarding/profile");
}

/**
 * The account step with the account taken out. Validation is the live schema, so
 * the form behaves the same; only the row it would have written is missing, and
 * the name is kept because the last screen greets you by it.
 */
async function stubProfile(formData: FormData): Promise<FormState> {
  const parsed = CreateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: firstError(parsed.error) };
  }

  await saveStubProgress({ displayName: parsed.data.displayName, hasAccount: true });

  redirect("/onboarding/consent");
}
