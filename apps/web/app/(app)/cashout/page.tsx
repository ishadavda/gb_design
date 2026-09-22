import { LEDGER_ENTRIES } from "@/modules/ledger";
import { WALLET_SUMMARY } from "@/modules/wallet";
import { Icon } from "@/shared/ui/Icon";
import { CashoutHero } from "./_components/CashoutHero";
import { LedgerCard } from "./_components/LedgerCard";

/**
 * Cash Out & Ledger - the money screen.
 *
 * A server component: the ledger history and the seed balance are read here and
 * handed down, so only the two pieces that actually move at runtime - the hero's
 * payout sheet and the ledger's filters - are client components.
 */
export default function CashoutPage() {
  return (
    <div className="no-scrollbar relative min-h-0 w-full flex-1 overflow-y-auto pb-24">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-light bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-tint text-teal">
            <Icon name="coins" className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-navy">
            Cash Out &amp; Ledger
          </h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-teal/20 bg-teal-tint px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase text-teal">
          <Icon name="shield-check" className="h-3 w-3 text-cta-green" />
          <span>Secure Ledger</span>
        </div>
      </div>

      <CashoutHero seedAvailableCents={WALLET_SUMMARY.availableCents} />

      <LedgerCard entries={LEDGER_ENTRIES} />

      <div className="mx-3.5 mb-6 mt-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate">
        Direct CPG Manufacturer Clearinghouse Ledger
      </div>
    </div>
  );
}
