import { notFound } from "next/navigation";
import { STORE_DIRECTORY } from "@/modules/dispensaries";
import { findOffer } from "@/modules/offers";
import { formatUsd } from "@/shared/money";
import { Icon } from "@/shared/ui/Icon";
import { BRAND_STYLES } from "../../_components/brandStyles";
import { DealArt } from "../../_components/DealArt";
import { BackLink } from "./_components/BackLink";
import { DispensaryTable } from "./_components/DispensaryTable";
import { ProductTabs } from "./_components/ProductTabs";

/**
 * One rebate, in full: what it pays, the rules it pays under, and every store
 * that honours it.
 *
 * In the prototype this was a hidden panel filled in from nine positional
 * arguments. Here the offer id is the URL and the page looks it up, so the page
 * can be linked to, refreshed, and shared - and there is no way to open it
 * showing one deal's title above another's terms.
 */

/** The four terms every rebate carries. Copy is the approved screens', verbatim. */
const REBATE_RULES = [
  {
    title: "1 Redemption Per Item:",
    body: "Valid for 1 unit of the specified product SKU per verified itemized receipt line.",
  },
  {
    title: "Licensed Dispensary Network:",
    body: "Eligible at all 20 state-licensed Illinois adult-use dispensaries shown in the Dispensary List tab.",
  },
  {
    title: "Itemized Receipt Required:",
    body: "Must clearly show dispensary name, purchase date (within 14 days), product SKU/name, and total paid.",
  },
  {
    title: "Instant Clearing Settlement:",
    body: "Escrowed manufacturer funds are deposited directly into your available GreenBack cash ledger upon receipt verification.",
  },
];

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const offer = findOffer(offerId);

  if (!offer) notFound();

  const style = BRAND_STYLES[offer.brand];
  const storeCount = STORE_DIRECTORY.length;

  return (
    <div className="relative w-full flex-1 overflow-y-auto bg-slate-page pb-24 no-scrollbar">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border-light bg-white/95 px-3.5 py-2.5 backdrop-blur-md">
        <BackLink fallbackHref="/deals" />
      </div>

      <ProductTabs
        storeCount={storeCount}
        deal={{
          title: offer.title,
          amountCents: offer.rebateCents,
          storeName: offer.dispensary,
        }}
        dispensaries={<DispensaryTable stores={STORE_DIRECTORY} />}
        details={
          <>
            <div className="relative overflow-hidden rounded-2xl border border-border-light bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="deal-logo shrink-0 border border-border-light">
                  <div className={`deal-logo-face ${style.logoBackground}`}>
                    <span
                      className={`font-sans text-[8px] font-extrabold uppercase leading-tight ${style.logoText}`}
                    >
                      {offer.brandShort.split("\n").map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="deal-logo-face product">
                    <DealArt art={offer.art} />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-navy">
                      {offer.brandShort.replace("\n", " ")}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9.5px] font-medium text-slate">
                      <Icon name="check-circle-2" className="h-3 w-3 text-teal" /> Verified Brand
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold leading-snug text-navy">{offer.title}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-md border border-alert-red/30 bg-alert-red/10 px-2 py-0.5 text-xs font-extrabold text-alert-red">
                      {formatUsd(offer.rebateCents)} back
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cta-green" />
                      {offer.dealsLeft} deals left
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 truncate text-[10.5px] font-medium text-slate">
                    <Icon name="map-pin" className="h-3 w-3 shrink-0 text-teal" />
                    <span>Eligible at {storeCount} statewide licensed dispensaries</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border-light bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-light/70 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#101626] text-teal">
                    <Icon name="clipboard-check" className="h-3.5 w-3.5" />
                  </span>
                  <span>Rebate Rules &amp; Requirements</span>
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9.5px] font-bold text-slate">
                  Official Terms
                </span>
              </div>

              <div className="space-y-2.5 text-[11px] leading-relaxed text-slate">
                {REBATE_RULES.map((rule) => (
                  <div key={rule.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
                      <Icon name="check" className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                    <div>
                      <strong className="font-extrabold text-navy">{rule.title}</strong> {rule.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-[#101626] p-3.5 text-white shadow-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime/40 bg-lime/20 text-lime">
                <Icon name="lock" className="h-4 w-4 text-lime" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-extrabold text-white">
                  CPG Clearinghouse Escrow Guaranteed
                </h4>
                <p className="mt-0.5 text-[10px] text-slate-300">
                  Funds are pre-deposited by verified manufacturers in regulated clearinghouse
                  escrow.
                </p>
              </div>
            </div>
          </>
        }
      />
    </div>
  );
}
