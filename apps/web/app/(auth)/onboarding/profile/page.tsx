import { requireStep } from "@/modules/onboarding";
import { Icon } from "@/shared/ui/Icon";
import { ProfileForm } from "../_components/ProfileForm";
import { SetupShell } from "../_components/SetupShell";

// STEP 3 of 6 - name. This is the step that creates the accounts row.
export default async function ProfilePage() {
  await requireStep("profile");

  return (
    <SetupShell step={3} totalSteps={6} backHref="/onboarding/phone">
      <div className="w-full space-y-5">
        <div className="px-2 text-center">
          <Icon name="user-check" className="mx-auto mb-2.5 h-11 w-11 text-claire" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy md:text-base">
            Profile Details
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate md:text-sm">
            Enter your information to configure your digital pass and unlock localized deals.
          </p>
        </div>

        <ProfileForm />
      </div>
    </SetupShell>
  );
}
