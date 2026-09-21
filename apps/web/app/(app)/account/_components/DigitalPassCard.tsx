"use client";

import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { DEMO_PROFILE } from "../../_components/demoProfile";

/**
 * The loyalty pass, barcode and all.
 *
 * The bars are the prototype's fifteen fixed widths rather than a real barcode -
 * nothing scans this, and generating a Code 128 would imply it does.
 */
const BAR_WIDTHS = [
  "w-1",
  "w-2",
  "w-0.5",
  "w-1.5",
  "w-1",
  "w-2.5",
  "w-0.5",
  "w-2",
  "w-1",
  "w-2",
  "w-1",
  "w-0.5",
  "w-2",
  "w-1.5",
  "w-2",
];

export function DigitalPassCard() {
  const showToast = useToast();

  return (
    <div className="mx-3.5 mt-3 rounded-[20px] border border-border-light bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-border-light pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-[#1D7EE8]">
            <Icon name="wallet" className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs font-extrabold text-navy">Digital Loyalty Pass</h4>
            <p className="text-[10px] font-medium text-slate">Synced with Apple Wallet</p>
          </div>
        </div>
        <span className="rounded-md border border-[#B7F0C1] bg-[#E8F8EC] px-2 py-0.5 text-[9.5px] font-extrabold uppercase text-[#1a8f50]">
          Provisioned
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center rounded-xl border border-border-light bg-[#f8fafc] p-3">
        <div className="flex h-8 w-full items-center justify-between px-1">
          {BAR_WIDTHS.map((width, index) => (
            <span key={index} className={`${width} h-full rounded-sm bg-black`} />
          ))}
        </div>
        <div className="mt-2 flex w-full items-center justify-between font-mono text-[10px] font-bold text-slate">
          <span>ID: {DEMO_PROFILE.passId}</span>
          <span className="font-sans font-extrabold uppercase text-[#1D7EE8]">Linked</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => showToast("Opening Apple Wallet digital pass...", "info")}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#101626] py-2.5 text-xs font-extrabold text-white transition hover:bg-[#1b2541]"
      >
        <Icon name="smartphone" className="h-4 w-4" />
        <span>View Pass in Apple Wallet</span>
      </button>
    </div>
  );
}
