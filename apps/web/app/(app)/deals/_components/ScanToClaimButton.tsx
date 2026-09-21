"use client";

import { Icon } from "@/shared/ui/Icon";
import { useReceiptScanner } from "../../_components/ReceiptScannerProvider";

/** The gold banner at the foot of a brand's offers. */
export function ScanToClaimButton() {
  const { openScanner } = useReceiptScanner();

  return (
    <button
      type="button"
      onClick={() => openScanner()}
      className="btn-gold-3d flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wide transition active:scale-[0.98]"
    >
      <Icon name="scan-line" className="h-5 w-5 stroke-[2.2] text-navy" />
      <span>Scan Receipt to Claim Rebate</span>
    </button>
  );
}
