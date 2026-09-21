"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * The balance, and everything that moved it while the app is open.
 *
 * The prototype kept `userAvailableBalance` in a global and rewrote three
 * elements by id whenever a rebate landed or a payout queued, because every
 * screen lived in one document. Here the screens are separate routes, so the
 * shared value needs a home that survives navigation between them - this is it.
 *
 * It is seeded from the server (`modules/wallet`) and never writes anywhere:
 * there is no ledger table yet, so a verified receipt credits this and nothing
 * else. When one exists, the credit and the payout each become a Server Action
 * and this provider keeps only the animation state.
 */

export interface CreditedRebate {
  id: string;
  itemName: string;
  storeName: string;
  amountCents: number;
  receiptRef: string;
}

export interface QueuedPayout {
  id: string;
  amountCents: number;
  reference: string;
}

/** The batch id the approved screens print on a queued payout. */
export const PAYOUT_REFERENCE = "ACH-98214-QUEUED";

interface WalletState {
  availableCents: number;
  pendingCents: number;
  lifetimeCents: number;
  goalCents: number;
  /** Newest first. Rendered above the seeded ledger rows. */
  credits: CreditedRebate[];
  /** Newest first. Payouts waiting on the clearinghouse. */
  payouts: QueuedPayout[];
  /** The credit just added, so the ledger knows which row to animate. */
  latestCreditId: string | null;
  creditRebate: (rebate: Omit<CreditedRebate, "id" | "receiptRef">) => void;
  /** A queued payout, which is what empties the balance. */
  queuePayout: (amountCents: number) => void;
  resetDemo: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({
  availableCents,
  pendingCents,
  lifetimeCents,
  goalCents,
  children,
}: {
  availableCents: number;
  pendingCents: number;
  lifetimeCents: number;
  goalCents: number;
  children: ReactNode;
}) {
  const [credits, setCredits] = useState<CreditedRebate[]>([]);
  const [payouts, setPayouts] = useState<QueuedPayout[]>([]);
  const [latestCreditId, setLatestCreditId] = useState<string | null>(null);

  const creditRebate = useCallback((rebate: Omit<CreditedRebate, "id" | "receiptRef">) => {
    const id = `credit-${Date.now()}`;

    setCredits((current) => [
      {
        ...rebate,
        id,
        // The prototype minted a five-digit receipt number per credit; kept so
        // the ledger row reads like the ones already in it.
        receiptRef: `GB-${Math.floor(10_000 + Math.random() * 90_000)}`,
      },
      ...current,
    ]);
    setLatestCreditId(id);
  }, []);

  const queuePayout = useCallback((amountCents: number) => {
    setPayouts((current) => [
      { id: `payout-${Date.now()}`, amountCents, reference: PAYOUT_REFERENCE },
      ...current,
    ]);
  }, []);

  const resetDemo = useCallback(() => {
    setCredits([]);
    setPayouts([]);
    setLatestCreditId(null);
  }, []);

  const value = useMemo<WalletState>(() => {
    const creditedCents = credits.reduce((total, credit) => total + credit.amountCents, 0);
    const paidOutCents = payouts.reduce((total, payout) => total + payout.amountCents, 0);

    return {
      availableCents: Math.max(0, availableCents + creditedCents - paidOutCents),
      pendingCents,
      // What was earned, never what is left - a payout does not reduce it.
      lifetimeCents: lifetimeCents + creditedCents,
      goalCents,
      credits,
      payouts,
      latestCreditId,
      creditRebate,
      queuePayout,
      resetDemo,
    };
  }, [
    availableCents,
    pendingCents,
    lifetimeCents,
    goalCents,
    credits,
    payouts,
    latestCreditId,
    creditRebate,
    queuePayout,
    resetDemo,
  ]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const wallet = useContext(WalletContext);

  if (!wallet) throw new Error("useWallet must be used inside <WalletProvider>");

  return wallet;
}
