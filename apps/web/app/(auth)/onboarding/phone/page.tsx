import { requireStep } from "@/modules/onboarding";
import { Icon } from "@/shared/ui/Icon";
import { PhoneForm } from "../_components/PhoneForm";
import { SetupShell } from "../_components/SetupShell";

// STEP 2 of 6 - phone number. Same three-part shape as every other step.
export default async function PhonePage() {
  await requireStep("phone");

  return (
    <SetupShell step={2} totalSteps={6} backHref="/onboarding?resume=1">
      <div className="w-full space-y-5">
        <div className="px-2 text-center">
          <Icon name="smartphone" className="mx-auto mb-2.5 h-11 w-11 text-claire" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy md:text-base">
            Secure SMS Validation
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate md:text-sm">
            To keep transactions secure, we authenticate logins via verified phone passcodes.
          </p>
        </div>

        <PhoneForm />
      </div>
    </SetupShell>
  );
}
