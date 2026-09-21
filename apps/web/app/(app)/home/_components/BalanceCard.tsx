"use client";

import Link from "next/link";
import { formatUsd } from "@/shared/money";
import { Icon } from "@/shared/ui/Icon";
import { useWallet } from "../../_components/WalletProvider";

/**
 * The hero card: what is withdrawable, what is still clearing, and the way out.
 *
 * It reads the live balance rather than the number the page was rendered with,
 * because a rebate verified two screens ago has to be showing here when the user
 * comes back - the prototype rewrote `#home-available-balance` for the same
 * reason.
 */
export function BalanceCard({ progressPercent }: { progressPercent: number }) {
  const wallet = useWallet();

  return (
    <div className="relative mx-3.5 mt-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-hero p-4 text-white shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-tight text-slate-300">
          Available to withdraw
        </span>
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[9.5px] font-extrabold text-slate-200">
          <Icon name="shield-check" className="h-3 w-3 text-cta-green" />
          Secure ledger
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-cta-green">
          {formatUsd(wallet.availableCents)}
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="block text-xs font-extrabold leading-tight text-white">
              {formatUsd(wallet.pendingCents)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Pending
            </span>
          </div>
          <div>
            <span className="block text-xs font-extrabold leading-tight text-white">
              {formatUsd(wallet.lifetimeCents)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Lifetime
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 border-t border-white/10 pt-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-300">
          <span>Goal: {formatUsd(wallet.goalCents)} min payout</span>
          <span className="text-white">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 pt-1">
        <Link href="/cashout" className="btn-3d w-full py-3 text-xs tracking-wide">
          <Icon name="banknote" className="relative z-10 h-4 w-4 text-navy" />
          <span className="relative z-10 font-extrabold">Cash Out</span>
        </Link>
      </div>
    </div>
  );
}
