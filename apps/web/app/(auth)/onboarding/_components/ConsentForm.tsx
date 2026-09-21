"use client";

import { useState } from "react";
import { grantConsentAction } from "../actions";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

export function ConsentForm() {
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const dataConsent = form.elements.namedItem("setup-consent-data");

    if (!(dataConsent instanceof HTMLInputElement) || !dataConsent.checked) {
      event.preventDefault();
      setShowError(true);
    }
  }

  return (
    <form action={grantConsentAction} onSubmit={handleSubmit} className="w-full">
      <div className="space-y-2.5 rounded-2xl border border-border-light bg-white p-3.5">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="setup-consent-sms"
            className="mt-1 h-4 w-4 cursor-pointer rounded accent-claire"
          />
          <span className="flex-1 text-[11px] leading-relaxed text-slate">
            Authorize localized <strong className="font-extrabold text-navy">SMS text messaging alerts</strong>{" "}
            regarding high-value dispensary rebate drops. <span className="ml-1 text-[10px] font-semibold text-slate-400">(Optional)</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="setup-consent-email"
            className="mt-1 h-4 w-4 cursor-pointer rounded accent-claire"
          />
          <span className="flex-1 text-[11px] leading-relaxed text-slate">
            Send weekly cashout receipts logs and NACHA direct deposit confirmations.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            name="setup-consent-data"
            onChange={(event) => {
              if (event.target.checked) setShowError(false);
            }}
            className="mt-1 h-4 w-4 cursor-pointer rounded accent-claire"
          />
          <span className="flex-1 text-[11px] leading-relaxed text-slate">
            Authorize Greenback Cash as the independent{" "}
            <strong className="font-extrabold text-navy">Data Controller</strong> of my rebate claims.{" "}
            <span className="ml-1 text-[10px] font-extrabold text-alert-red">(Required)</span>
          </span>
        </label>
      </div>

      <div
        role="alert"
        className={`mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-alert-red ${showError ? "" : "hidden"}`}
      >
        <Icon name="alert-circle" className="h-4 w-4 shrink-0 text-alert-red" />
        <span>You must authorize Greenback Cash as Data Controller to continue.</span>
      </div>

      <div className="mt-4 w-full">
        <Button type="submit">Create Account</Button>
      </div>
    </form>
  );
}
