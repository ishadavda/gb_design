"use client";

import { Icon } from "@/shared/ui/Icon";
import { useReceiptScanner } from "../../_components/ReceiptScannerProvider";

/** The gold CTA under the balance card. Opens the receipt sheet with no deal attached. */
export function ScanReceiptButton() {
  const { openScanner } = useReceiptScanner();

  return (
    <div className="mx-3.5 mt-3">
      <button
        type="button"
        onClick={() => openScanner()}
        className="btn-gold-3d flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-extrabold uppercase tracking-wide transition active:scale-[0.98]"
      >
        <Icon name="scan-line" className="h-5 w-5 stroke-[2.2] text-navy" />
        <span>Scan Receipt</span>
      </button>
    </div>
  );
}
