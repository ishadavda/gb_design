import { findAccountByUserId } from "@/modules/accounts";
import { getSessionUser } from "@/modules/auth";
import { isStubOnboarding, readStubProgress, requireStep } from "@/modules/onboarding";
import { createClient } from "@/infra/supabase/server";
import { OnboardingFinishFlow } from "../_components/OnboardingFinishFlow";

// STEP 6 complete. requireStep("done") only passes once every gate is cleared.
export default async function DonePage() {
  await requireStep("done");

  const displayName = await resolveDisplayName();
  const firstName = displayName?.trim().split(" ")[0] || "there";

  return (
    <OnboardingFinishFlow firstName={firstName} />
  );
}

/**
 * Only the greeting needs a name - the celebration sheet takes a plain string,
 * not an account - so a missing one costs nothing and falls back to "there".
 */
async function resolveDisplayName(): Promise<string | null> {
  if (isStubOnboarding()) return (await readStubProgress()).displayName ?? null;

  // Read on behalf of the signed-in user, so RLS scopes it.
  const user = await getSessionUser();
  if (!user) return null;

  const account = await findAccountByUserId(await createClient(), user.userId);

  return account?.displayName ?? null;
}
