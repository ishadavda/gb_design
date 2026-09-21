"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ReceiptScannerSheet } from "./ReceiptScannerSheet";
import { VerificationSheet } from "./VerificationSheet";

/**
 * Who opens the receipt sheet, and with which deal attached.
 *
 * Four places ask for it - the Scan tab, the home CTA, a deal card and the
 * product page - and none of them are near it in the tree. The prototype called
 * a global `openReceiptScannerDrawer(title, cashback, dispensary)`; this is the
 * same affordance without the global, and it carries the deal through the scan
 * into the celebration that follows it.
 */

export interface ScannedDeal {
  title: string;
  amountCents: number;
  storeName: string;
}

/** What Scan opens with when nothing was selected first, as the prototype did. */
const DEFAULT_DEAL: ScannedDeal = {
  title: "Twenty Twenty Flower",
  amountCents: 500,
  storeName: "Bud & Rita's",
};

interface ScannerApi {
  openScanner: (deal?: Partial<ScannedDeal>) => void;
}

const ScannerContext = createContext<ScannerApi | null>(null);

export function ReceiptScannerProvider({ children }: { children: ReactNode }) {
  const [deal, setDeal] = useState<ScannedDeal>(DEFAULT_DEAL);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [verifiedOpen, setVerifiedOpen] = useState(false);

  const openScanner = useCallback((next?: Partial<ScannedDeal>) => {
    setDeal({ ...DEFAULT_DEAL, ...next });
    setVerifiedOpen(false);
    setScannerOpen(true);
  }, []);

  const api = useMemo<ScannerApi>(() => ({ openScanner }), [openScanner]);

  return (
    <ScannerContext.Provider value={api}>
      {children}

      <ReceiptScannerSheet
        open={scannerOpen}
        deal={deal}
        onClose={() => setScannerOpen(false)}
        onVerified={() => {
          setScannerOpen(false);
          // The prototype let the sheet finish sliding out before the next one
          // started in. Overlapping them reads as one shape changing shape.
          window.setTimeout(() => setVerifiedOpen(true), 250);
        }}
      />

      <VerificationSheet open={verifiedOpen} deal={deal} onClose={() => setVerifiedOpen(false)} />
    </ScannerContext.Provider>
  );
}

export function useReceiptScanner(): ScannerApi {
  const api = useContext(ScannerContext);

  if (!api) throw new Error("useReceiptScanner must be used inside <ReceiptScannerProvider>");

  return api;
}
