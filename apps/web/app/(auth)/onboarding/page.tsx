import { requireStep } from "@/modules/onboarding";
import { AgeGateScreen } from "./_components/AgeGateScreen";

// =============================================================================
// STEP 1 of 6 - age gate
//
// THE SHAPE EVERY ONBOARDING PAGE FOLLOWS:
//
//   1. await requireStep("<this step>")   guard - redirects if they can't be here
//   2. fetch anything the screen needs    via modules/, if applicable
//   3. render a client form               plain props down, Server Action up
//
// The page is a Server Component. It never has "use client", never fetches over
// HTTP, and never contains a business rule - the rule about being 21 lives in
// modules/onboarding/rules.ts.
// =============================================================================

export default async function AgeGatePage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string }>;
}) {
  await requireStep("age-gate");

  // searchParams is a Promise in Next 15 - it must be awaited.
  const { resume } = await searchParams;

  return <AgeGateScreen resumed={resume === "1"} />;
}
