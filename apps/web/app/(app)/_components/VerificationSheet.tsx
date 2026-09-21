"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { formatUsd } from "@/shared/money";
import type { ScannedDeal } from "./ReceiptScannerProvider";
import { useWallet } from "./WalletProvider";

/**
 * Verification Complete - the sheet that pays the rebate out.
 *
 * Opening it is what credits the balance, as in the prototype: the receipt has
 * already passed diagnostics by the time this slides up, so the number is
 * counting to a total that is already true rather than predicting one.
 *
 * "View in Ledger" leaves the credit highlighted for the cash-out screen to
 * animate, which is why the ledger row's entrance is not written here.
 */

const CONFETTI_COLORS = [
  "#4CAF50",
  "#2E7D32",
  "#CEF646",
  "#FFC53D",
  "#38BDF8",
  "#8BC34A",
  "#F97316",
  "#FFFFFF",
];

const PARTICLE_COUNT = 28;

interface Particle {
  tx: number;
  ty: number;
  tr: number;
  color: string;
  width: number;
  height: number;
  delay: number;
}

/** The prototype's burst: a ring of particles, jittered, thrown up and out. */
function burst(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / PARTICLE_COUNT + (Math.random() * 0.4 - 0.2);
    const distance = 80 + Math.random() * 140;
    const size = 5 + Math.random() * 6;

    return {
      tx: Math.cos(angle) * distance,
      ty: -(40 + Math.random() * 120),
      tr: Math.random() * 720 - 360,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
      width: size,
      height: size * (Math.random() > 0.5 ? 1.5 : 1),
      delay: Math.random() * 0.2,
    };
  });
}

export function VerificationSheet({
  open,
  deal,
  onClose,
}: {
  open: boolean;
  deal: ScannedDeal;
  onClose: () => void;
}) {
  const router = useRouter();
  const wallet = useWallet();

  const [confetti, setConfetti] = useState<Particle[]>([]);
  const [previousCents, setPreviousCents] = useState(wallet.availableCents);

  // Credit once per opening. The sheet stays mounted, so without the latch a
  // re-render would pay the same rebate twice.
  const creditedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      creditedFor.current = null;
      setConfetti([]);
      return;
    }

    const key = `${deal.title}-${deal.amountCents}-${deal.storeName}`;

    if (creditedFor.current === key) return;

    creditedFor.current = key;
    setPreviousCents(wallet.availableCents);
    setConfetti(burst());
    wallet.creditRebate({
      itemName: deal.title,
      storeName: deal.storeName,
      amountCents: deal.amountCents,
    });
  }, [open, deal, wallet]);

  const counter = useCountUp(0, deal.amountCents, { durationMs: 1100, delayMs: 250, run: open });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[92%] overflow-y-auto no-scrollbar rounded-t-[32px] border-t border-slate-700/80 bg-[#101626] p-5 text-center text-white"
    >
      <div className="relative flex flex-col">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-700" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((piece, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={
                {
                  left: "50%",
                  top: "22%",
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  backgroundColor: piece.color,
                  animationDelay: `${piece.delay}s`,
                  "--tx": `${piece.tx}px`,
                  "--ty": `${piece.ty}px`,
                  "--tr": `${piece.tr}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative mx-auto mb-2 flex size-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#4CAF50]/30" />
          <div className="animate-check-spring relative flex size-16 items-center justify-center rounded-full border-2 border-[#CEF646] bg-gradient-to-tr from-[#2E7D32] to-[#4CAF50] shadow-[0_0_30px_rgba(76,175,80,0.65)]">
            <Icon name="check" className="h-9 w-9 stroke-[3] text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4CAF50]/35 bg-[#4CAF50]/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#CEF646]">
            <Icon name="shield-check" className="h-3.5 w-3.5 text-[#CEF646]" />
            Instant Clearinghouse Match
          </span>
          <h3 className="pt-1 text-xl font-black tracking-tight text-white">
            Verification Complete!
          </h3>
          <p className="text-xs font-medium text-slate-300">
            Rebate confirmed and instantly credited
          </p>
        </div>

        <div className="relative my-3.5 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0B1120] px-4 py-4 shadow-inner">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#4CAF50]/15 via-transparent to-transparent" />
          <span className="mb-1 block text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400">
            CASHBACK ADDED TO LEDGER
          </span>
          <div
            className={`flex items-center justify-center gap-0.5 font-mono text-4xl font-black tracking-tight text-[#CEF646] drop-shadow-[0_2px_16px_rgba(206,246,70,0.5)] ${
              counter.done ? "animate-counter-finish" : ""
            }`}
          >
            <span>+$</span>
            <span>{(counter.value / 100).toFixed(2)}</span>
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <Icon name="sparkles" className="h-3.5 w-3.5 animate-pulse text-[#CEF646]" />
            <span>+{formatUsd(deal.amountCents)} rebate added to your ledger!</span>
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-xl border border-slate-700/70 bg-[#161F33] p-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32]">
                <Icon name="receipt" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-extrabold text-white">
                  {deal.storeName} · {deal.title}
                </div>
                <div className="truncate text-[10px] font-medium text-slate-400">
                  Rebate SKU #IL-78921 · Direct CPG Credit
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-md border border-[#4CAF50]/40 bg-[#4CAF50]/20 px-2 py-0.5 text-xs font-black text-[#CEF646]">
              +{formatUsd(deal.amountCents)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 text-[11px]">
            <span className="font-medium text-slate-400">Available Ledger Balance:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold">
              <span className="text-slate-400 line-through">{formatUsd(previousCents)}</span>
              <Icon name="arrow-right" className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-extrabold text-[#CEF646]">
                {formatUsd(previousCents + deal.amountCents)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/cashout");
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#4CAF50] py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#0F172A] shadow-[0_0_20px_rgba(76,175,80,0.35)] transition hover:bg-[#43A047] active:scale-95"
          >
            <Icon name="landmark" className="h-4 w-4 text-[#0F172A]" />
            <span>View in Ledger</span>
            <Icon name="arrow-right" className="h-3.5 w-3.5 text-[#0F172A]" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-xl bg-slate-800 py-2.5 text-xs font-extrabold text-slate-300 transition hover:bg-slate-700"
          >
            Done / Back to Home
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
