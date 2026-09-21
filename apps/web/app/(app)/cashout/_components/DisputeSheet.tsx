"use client";

import { formatUsd } from "@/shared/money";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";

/**
 * Challenge a rejected receipt.
 *
 * Nothing is filed - there is no dispute service - so submitting marks the row
 * "Under Review" and says so, which is what the approved screens do. The grounds
 * list and the pre-filled note are theirs, verbatim.
 */

export interface DisputeTarget {
  receiptRef: string;
  itemName: string;
  amountCents: number;
  store: string;
  reason: string;
}

const GROUNDS = [
  { value: "date", label: "Receipt date and purchase timestamp are within promotional terms" },
  { value: "sku", label: "Brand SKU matches the featured manufacturer rebate offer" },
  { value: "ocr", label: "Receipt text is legible upon human manual inspection" },
  { value: "dispensary", label: "Dispensary is an authorized partner retailer" },
  { value: "other", label: "Other factual discrepancy / manual audit request" },
];

const DEFAULT_NOTE =
  "The printed receipt from the dispensary has an order completion timestamp that qualifies for the promotion.";

export function DisputeSheet({
  target,
  onClose,
  onSubmitted,
}: {
  target: DisputeTarget | null;
  onClose: () => void;
  onSubmitted: (receiptRef: string) => void;
}) {
  const showToast = useToast();

  return (
    <BottomSheet
      open={target !== null}
      onClose={onClose}
      panelClassName="max-h-[90%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/20 text-amber-400">
            <Icon name="scale" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold text-white">Challenge Transaction Decision</h3>
            <p className="text-[10px] font-medium text-slate-400">
              Request independent clearinghouse arbitration
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <Icon name="x" className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="mt-3.5 space-y-2 rounded-xl border border-slate-700/60 bg-[#161F33] p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-400">Item / Brand</span>
          <span className="font-extrabold text-white">{target?.itemName}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
          <span className="font-medium text-slate-400">Dispensary &amp; Receipt</span>
          <span className="font-medium text-slate-300">
            {target?.store} · #{target?.receiptRef}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
          <span className="font-medium text-slate-400">Contested Rebate</span>
          <span className="font-extrabold text-claire">
            +{formatUsd(target?.amountCents ?? 0)} Rebate
          </span>
        </div>
        <div className="border-t border-slate-700/50 pt-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-alert-red">
            <Icon name="alert-circle" className="h-3.5 w-3.5" /> Clearinghouse Rejection Reason
          </div>
          <p className="rounded-lg border border-alert-red/20 bg-alert-red/10 p-2.5 text-[11px] leading-relaxed text-slate-200">
            {target?.reason}
          </p>
        </div>
      </div>

      <form
        className="mt-3.5 space-y-3 text-left"
        onSubmit={(event) => {
          event.preventDefault();

          if (!target) return;

          onSubmitted(target.receiptRef);
          onClose();
          showToast(
            `⚖️ Challenge submitted for Receipt #${target.receiptRef}! Human auditor assigned.`,
            "success",
          );
        }}
      >
        <div className="space-y-1">
          <label
            htmlFor="dispute-ground"
            className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-300"
          >
            Grounds for Challenge
          </label>
          <select
            id="dispute-ground"
            name="ground"
            required
            defaultValue="date"
            className="w-full cursor-pointer rounded-xl border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-xs font-semibold text-white transition focus:border-cta-green focus:outline-none"
          >
            {GROUNDS.map((ground) => (
              <option key={ground.value} value={ground.value}>
                {ground.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="dispute-context"
            className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-300"
          >
            Additional Context / Notes
          </label>
          <textarea
            id="dispute-context"
            name="context"
            rows={2}
            defaultValue={DEFAULT_NOTE}
            placeholder="Provide any additional details or clarification for the audit team..."
            className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] px-3.5 py-2 text-xs font-medium text-white transition placeholder:text-slate-500 focus:border-cta-green focus:outline-none"
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-teal/30 bg-teal/10 p-2.5 text-[10.5px] leading-relaxed text-teal-100">
          <Icon name="shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-cta-green" />
          <span>
            <strong>Clearinghouse Guarantee:</strong> Challenges are arbitrated by human compliance
            auditors within 24 hours. Approved claims are automatically credited to your balance.
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700"
          >
            CANCEL
          </button>
          <button type="submit" className="btn-3d flex-1 py-3 text-xs tracking-wide">
            <Icon name="scale" className="relative z-10 h-4 w-4 text-navy" />
            <span className="relative z-10 font-extrabold uppercase">SUBMIT CHALLENGE</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
