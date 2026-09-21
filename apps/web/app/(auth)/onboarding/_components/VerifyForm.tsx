"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { sendCodeAction, verifyCodeAction } from "../actions";
import { idleState } from "../formState";
import { formatUsNumber, toSubscriberDigits } from "./phoneFormat";

const RESEND_SECONDS = 60;

/**
 * The passcode half of the phone panel.
 *
 * On the approved screen this is not a step of its own: the number stays where
 * it was, the passcode box opens underneath it, and the same button changes from
 * "Request Access Passcode" to "Verify Passcode & Enter". The route is separate
 * because the code has to be requested from the server in between - so the field
 * is rebuilt here, read-only, to keep the screen the person sees unbroken.
 *
 * `phone` arrives as a prop from the server page; the client does not look it up.
 * It rides along in a hidden input so the action gets both values together, which
 * is safe because the phone is only matched against a code already issued - it is
 * not an identity claim. Anything that IS one gets re-derived from the session
 * inside the action.
 *
 * `codeLength` and `defaultToken` differ by mode: six digits from Supabase, four
 * from the mock in modules/onboarding/stub.ts, which prefills because there is no
 * text message to read it off.
 *
 * Resend lives in its own <form> after this one and is reached through the HTML
 * `form` attribute. Forms cannot nest, and the alternative - one form with two
 * submit paths - would mean a second action just to re-shape the arguments.
 */
export function VerifyForm({
  phone,
  codeLength,
  codeHint,
  defaultToken,
}: {
  phone: string;
  codeLength: number;
  codeHint: string;
  defaultToken?: string;
}) {
  const [state, action, pending] = useActionState(verifyCodeAction, idleState);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const tick = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(tick);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;
  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <>
      <form id="verify-form" action={action} noValidate className="w-full space-y-5">
        <input type="hidden" name="phone" value={phone} />

        <div className="space-y-3.5">
          {/*
            Read-only: the code went to this number, so editing it here would
            check the passcode against a number that was never sent one. Back
            goes to the phone screen, which is where changing it belongs.
          */}
          <Field
            id="phone-display"
            type="tel"
            label="Mobile Number"
            prefix="+1"
            value={formatUsNumber(toSubscriberDigits(phone))}
            readOnly
          />

          <div className="space-y-2">
            <label
              htmlFor="token"
              className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate"
            >
              <span>{codeLength}-Digit Passcode</span>
              <span className="text-[10px] font-bold text-slate">{codeHint}</span>
            </label>

            <input
              id="token"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={codeLength}
              placeholder={`Enter ${codeLength}-digit code`}
              defaultValue={defaultToken}
              required
              className="w-full rounded-xl border border-border-light bg-white px-4 py-3.5 text-center text-base font-extrabold tracking-widest text-claire transition focus:border-cta-green focus:outline-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate">Didn&apos;t receive code?</span>
              <button
                type="submit"
                form="resend-form"
                disabled={!canResend}
                className={`flex items-center gap-1.5 text-xs transition focus:outline-none ${
                  canResend
                    ? "cursor-pointer font-extrabold text-claire hover:underline"
                    : "cursor-not-allowed font-bold text-slate"
                }`}
              >
                <Icon name="rotate-cw" className="h-3.5 w-3.5" />
                <span>{canResend ? "Resend Passcode" : `Resend in ${countdown}`}</span>
              </button>
            </div>
          </div>
        </div>

        <FormMessage status={state.status} message={state.message} />

        <div className="mt-4 w-full">
          <Button type="submit" disabled={pending}>
            {pending ? "Checking…" : "Verify Passcode & Enter"}
          </Button>
        </div>
      </form>

      <ResendForm phone={phone} />
    </>
  );
}

function ResendForm({ phone }: { phone: string }) {
  const [, action] = useActionState(sendCodeAction, idleState);

  return (
    <form id="resend-form" action={action} className="hidden">
      <input type="hidden" name="phone" value={phone} />
    </form>
  );
}
