"use client";

import { useState } from "react";
import { formatUsd } from "@/shared/money";
import { Icon } from "@/shared/ui/Icon";
import { useProfile } from "../../_components/ProfileProvider";
import { useWallet } from "../../_components/WalletProvider";
import { PayoutSheet } from "./PayoutSheet";

/**
 * Who you are, what you have, and the button that moves it.
 *
 * Reads the live balance and the live profile rather than the values the page
 * was rendered with, so a rebate verified on another screen and a name changed
 * in the edit sheet are both already correct when this one is reached.
 *
 * The reset link appears only once the balance has been paid out to zero - the
 * prototype's way back to a full demo without a reload.
 */
export function CashoutHero({ seedAvailableCents }: { seedAvailableCents: number }) {
  const wallet = useWallet();
  const profile = useProfile();
  const [payoutOpen, setPayoutOpen] = useState(false);

  return (
    <>
      <div className="relative mx-3.5 mt-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-hero p-4 text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-tr from-claire to-cta-green text-xl font-extrabold text-navy shadow-md">
              {profile.initials}
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
              <Icon name="shield-check" className="h-4 w-4 text-cta-green" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-extrabold leading-tight text-white">
                {profile.fullName}
              </h3>
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-300">{profile.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                <Icon name="award" className="h-3 w-3 text-white" />
                Gold VIP Member
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400">Joined July 2024</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
          <div className="rounded-xl border border-white/5 bg-white/5 p-2">
            <span className="block text-sm font-extrabold leading-tight text-[#4ecb58]">
              {formatUsd(wallet.availableCents)}
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              AVAILABLE
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-2">
            <span className="block text-sm font-extrabold leading-tight text-white">
              {formatUsd(wallet.pendingCents)}
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              PENDING
            </span>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-2">
            <span className="block text-sm font-extrabold leading-tight text-white">
              {formatUsd(wallet.lifetimeCents)}
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              LIFETIME
            </span>
          </div>
        </div>

        <div className="mt-3.5 space-y-2">
          <button
            type="button"
            onClick={() => setPayoutOpen(true)}
            className="btn-3d w-full py-3.5 text-xs tracking-wide"
          >
            <Icon name="banknote" className="relative z-10 h-4 w-4 text-navy" />
            <span className="relative z-10 font-extrabold uppercase">
              {wallet.availableCents === 0 ? "CASHED OUT " : "CASH OUT "}
              {formatUsd(wallet.availableCents)}
            </span>
          </button>

          {wallet.availableCents === 0 && (
            <button
              type="button"
              onClick={wallet.resetDemo}
              className="w-full cursor-pointer py-1 text-center text-[10px] font-bold text-lime transition hover:underline"
            >
              ↺ Reset Demo Balance ({formatUsd(seedAvailableCents)})
            </button>
          )}
        </div>
      </div>

      <PayoutSheet open={payoutOpen} onClose={() => setPayoutOpen(false)} />
    </>
  );
}
