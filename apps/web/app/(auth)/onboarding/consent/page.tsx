import { requireStep } from "@/modules/onboarding";
import { ConsentForm } from "../_components/ConsentForm";
import { SetupShell } from "../_components/SetupShell";

// STEP 4 of 6 - consent.
export default async function ConsentPage() {
  await requireStep("consent");

  return (
    <SetupShell step={4} totalSteps={6} backHref="/onboarding/profile">
      <div className="w-full space-y-4">
        <div className="px-2 text-center">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy md:text-base">
            Terms &amp; Data Consent
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate md:text-sm">
            Accept our privacy policy below to securely activate your profile
          </p>
        </div>

        <ConsentForm />
      </div>
    </SetupShell>
  );
}
