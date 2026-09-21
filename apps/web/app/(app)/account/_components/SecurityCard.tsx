"use client";

import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";

/** Security state, plus the two links out to support and legal. */
export function SecurityCard() {
  const showToast = useToast();

  return (
    <div className="mx-3.5 mt-3 rounded-2xl border border-border-light bg-white p-4">
      <div className="flex items-center gap-2 border-b border-border-light pb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-slate">
          <Icon name="shield" className="h-4 w-4 text-navy" />
        </span>
        <h4 className="text-xs font-extrabold text-navy">Security &amp; Compliance</h4>
      </div>

      <div className="mt-2.5 divide-y divide-border-light/60 text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] font-medium text-slate">2-Step SMS Passcode</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#1A8F50]">
            <Icon name="check-circle" className="h-3 w-3 text-[#1A8F50]" /> Enabled
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] font-medium text-slate">21+ Age Compliance Gate</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#1A8F50]">
            <Icon name="check-circle" className="h-3 w-3 text-[#1A8F50]" /> Certified
          </span>
        </div>

        <LinkRow
          label="Dispute a Receipt / Help Center"
          onClick={() => showToast("Dispute center: support@greenbackcash.com", "info")}
        />
        <LinkRow
          label="Terms of Service & Privacy"
          onClick={() => showToast("Greenback Terms of Service v2.4", "info")}
        />
      </div>
    </div>
  );
}

function LinkRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between py-2 text-left text-slate transition hover:text-navy"
    >
      <span className="text-[11px] font-medium">{label}</span>
      <Icon name="chevron-right" className="h-3.5 w-3.5 text-slate" />
    </button>
  );
}
