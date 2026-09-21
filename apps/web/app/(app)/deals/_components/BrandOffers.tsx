import Link from "next/link";
import type { BrandId, Offer } from "@/modules/offers";
import { formatRebate } from "@/shared/money";
import { Icon } from "@/shared/ui/Icon";
import { BRAND_STYLES } from "../../_components/brandStyles";
import { DealCard } from "../../_components/DealCard";
import { ScanToClaimButton } from "./ScanToClaimButton";

/**
 * Page two of Deals: one brand, its rebates, and the way to claim them.
 *
 * A server component - nothing on it reacts to anything except the two buttons,
 * which are islands of their own. The prototype rebuilt this panel in JavaScript
 * every time a brand was tapped; here the brand is in the URL, so the back
 * button and a shared link both work.
 */
export function BrandOffers({
  name,
  brand,
  distance,
  offers,
}: {
  name: string;
  brand: BrandId;
  distance: string;
  offers: Offer[];
}) {
  const style = BRAND_STYLES[brand];
  const count = offers.length;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border-light bg-white/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/deals"
          className="flex cursor-pointer items-center gap-2 text-xs font-extrabold text-navy transition hover:text-[#2E7D32] active:scale-95"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-navy transition hover:bg-[#E8F5E9] hover:text-[#2E7D32]">
            <Icon name="arrow-left" className="h-4 w-4" />
          </span>
          <span>Back to Brands</span>
        </Link>
        <div className="flex items-center gap-1.5 rounded-full border border-[#C8E6C9] bg-[#E8F5E9] px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase text-[#2E7D32]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
          <span>{count} Offers</span>
        </div>
      </div>

      <div className="relative mx-3.5 mt-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-navy-hero p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${style.tile}`}
          >
            <Icon name="tag" className={`h-6 w-6 stroke-[2.2] ${style.badge}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-extrabold text-white">{name}</h3>
              <span className="shrink-0 rounded border border-cta-green/40 bg-cta-green/20 px-1.5 text-[9px] font-extrabold text-lime">
                Brand Partner
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-300">{distance}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
          <span className="text-[11px] font-medium text-slate-300">
            {count} Active Rebate Deals Available
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-lime">
            <Icon name="shield-check" className="h-3.5 w-3.5 text-lime" /> Verified Brand
          </span>
        </div>
      </div>

      <div className="mx-3.5 mt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
            Exclusive Rebates
          </h3>
          <span className="rounded-full border border-cta-green/30 bg-cta-green/10 px-2 py-0.5 text-[10px] font-extrabold text-claire">
            {count} Active {count === 1 ? "Deal" : "Deals"}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {offers.map((offer) => (
            <DealCard
              key={offer.id}
              id={offer.id}
              title={offer.title}
              brand={offer.brand}
              brandShort={offer.brandShort}
              rebateLabel={`${formatRebate(offer.rebateCents)} back`}
              rebateCents={offer.rebateCents}
              dealsLeft={offer.dealsLeft}
              dispensary={offer.dispensary}
              art={offer.art}
            />
          ))}
        </div>
      </div>

      <div className="mx-3.5 mt-4">
        <ScanToClaimButton />
      </div>

      <div className="mx-3.5 mb-6 mt-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate">
        Direct CPG Manufacturer Clearinghouse Network
      </div>
    </div>
  );
}
