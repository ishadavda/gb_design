"use client";

import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";

/**
 * The two cards at the foot of the home screen: the survey bonus and the
 * referral link.
 *
 * Copying falls back to showing the link in the toast, as the prototype did -
 * the clipboard is refused often enough (insecure origin, older iOS, denied
 * permission) that the user still has to be able to read it off the screen.
 */
export function PromoGrid({ referralLink }: { referralLink: string }) {
  const showToast = useToast();

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast("📋 Referral link copied to clipboard!", "success");
    } catch {
      showToast("📋 Referral link: app.greenbackcash.com/join?ref=CLAIRE2026", "info");
    }
  }

  return (
    <div className="mx-3.5 mt-3.5 grid grid-cols-2 gap-2.5">
      <div className="flex flex-col justify-between rounded-2xl border border-border-light bg-white p-3">
        <div>
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-tint text-sm font-extrabold text-teal">
            <Icon name="plus" className="h-4 w-4" />
          </div>
          <h5 className="text-xs font-extrabold text-navy">Earn an extra $1</h5>
          <p className="mt-1 text-[11px] font-medium leading-snug text-slate">
            Tell us your preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast("Quick preference survey loaded (+ $1.00 bonus)", "info")}
          className="mt-3 w-full rounded-lg border border-border-light bg-slate-page py-2 text-center text-[10.5px] font-extrabold text-navy transition hover:bg-slate-100"
        >
          Quick survey
        </button>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-border-light bg-white p-3">
        <div>
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-tint text-teal">
            <Icon name="users" className="h-4 w-4 text-teal" />
          </div>
          <h5 className="text-xs font-extrabold text-navy">Refer a friend</h5>
          <p className="mt-1 text-[11px] font-medium leading-snug text-slate">
            Get $2 when they check in.
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-1 rounded-lg border border-border-light bg-slate-page p-1">
          <span className="truncate pl-1 font-mono text-[10px] text-slate">app.greenback...</span>
          <button
            type="button"
            onClick={copyReferralLink}
            className="shrink-0 rounded-md bg-cta-green px-2.5 py-1 text-[9.5px] font-extrabold text-navy transition hover:bg-cta-green/90 active:scale-95"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
