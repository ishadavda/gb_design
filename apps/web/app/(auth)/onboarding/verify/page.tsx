import { redirect } from "next/navigation";
import { STUB_PASSCODE, isStubOnboarding, requireStep } from "@/modules/onboarding";
import { Icon } from "@/shared/ui/Icon";
import { SetupShell } from "../_components/SetupShell";
import { SmsAlertBanner } from "../_components/SmsAlertBanner";
import { VerifyForm } from "../_components/VerifyForm";

/**
 * STEP 2 of 5, still - entering a number and typing the code are two screens but
 * one gate, and the approved design counts gates: the number stays on screen, the
 * passcode box opens under it, the step indicator does not move. The guard says
 * the same thing in code, which is why it asks for "phone" here. See the note in
 * modules/onboarding/types.ts.
 *
 * searchParams is a Promise in Next 15 - it must be awaited.
 */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  await requireStep("phone");

  const { phone } = await searchParams;

  // Reached directly without a number to verify - send them back a step.
  if (!phone) redirect("/onboarding/phone");

  // Supabase issues six digits; the stub's mock is the prototype's four. Nothing
  // was texted in that mode, so the screen has to supply the code itself.
  const stub = isStubOnboarding();

  return (
    <SetupShell step={2} totalSteps={6} backHref="/onboarding/phone">
      <SmsAlertBanner passcode={stub ? STUB_PASSCODE : undefined} />

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

        <VerifyForm
          phone={phone}
          codeLength={stub ? STUB_PASSCODE.length : 6}
          codeHint={stub ? "Mock OTP Code Sent" : `Sent to ${phone}`}
          defaultToken={stub ? STUB_PASSCODE : undefined}
        />
      </div>
    </SetupShell>
  );
}
