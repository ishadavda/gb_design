"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@/shared/ui/Icon";
import { useReceiptScanner } from "../../../_components/ReceiptScannerProvider";

/**
 * The segmented control on the product page, and the two panels under it.
 *
 * Both panels are rendered on the server and handed in as children - this
 * component owns which one is showing and nothing else, so the rules copy and
 * the twenty store rows cost no JavaScript.
 *
 * The claim CTA and the "view all dispensaries" link live here rather than in
 * the details panel because both of them act on this state or on the scanner.
 */
export function ProductTabs({
  details,
  dispensaries,
  storeCount,
  deal,
}: {
  details: ReactNode;
  dispensaries: ReactNode;
  storeCount: number;
  deal: { title: string; amountCents: number; storeName: string };
}) {
  const [tab, setTab] = useState<"details" | "dispensaries">("details");
  const { openScanner } = useReceiptScanner();

  const active =
    "flex-1 py-2 px-2 text-xs font-extrabold rounded-xl bg-white text-navy shadow-sm border border-slate-200/80 transition text-center flex items-center justify-center gap-1.5 cursor-pointer";
  const inactive =
    "flex-1 py-2 px-2 text-xs font-bold rounded-xl text-slate hover:text-navy transition text-center flex items-center justify-center gap-1.5 cursor-pointer";

  return (
    <>
      <div className="mx-3.5 mt-3">
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-300/60 bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setTab("details")}
            className={tab === "details" ? active : inactive}
          >
            <Icon
              name="tag"
              className={
                tab === "details"
                  ? "h-3.5 w-3.5 stroke-[2.2] text-teal"
                  : "h-3.5 w-3.5 stroke-2 text-slate-400"
              }
            />
            <span>Rebate Details</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("dispensaries")}
            className={tab === "dispensaries" ? active : inactive}
          >
            <Icon
              name="store"
              className={
                tab === "dispensaries"
                  ? "h-3.5 w-3.5 stroke-[2.2] text-teal"
                  : "h-3.5 w-3.5 stroke-2 text-slate-400"
              }
            />
            <span>Dispensary List</span>
            <span className="rounded-full bg-navy px-2 py-0.5 text-[9px] font-black text-white">
              {storeCount}
            </span>
          </button>
        </div>
      </div>

      {tab === "details" ? (
        <div className="mx-3.5 mt-3 flex flex-col space-y-3">
          {details}

          <div className="pb-2 pt-1">
            <button
              type="button"
              onClick={() => openScanner(deal)}
              className="btn-gold-3d flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wide transition active:scale-[0.98]"
            >
              <Icon name="scan-line" className="h-5 w-5 stroke-[2.2] text-navy" />
              <span>Scan Receipt</span>
            </button>
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={() => setTab("dispensaries")}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-extrabold text-navy transition hover:text-teal hover:underline"
              >
                <span>View All {storeCount} Eligible Dispensaries</span>
                <Icon name="arrow-right" className="h-3.5 w-3.5 text-teal" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-3.5 mt-3 flex flex-col space-y-3">{dispensaries}</div>
      )}
    </>
  );
}
