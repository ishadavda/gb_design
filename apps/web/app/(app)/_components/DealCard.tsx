"use client";

import { useRouter } from "next/navigation";
import type { BrandId, OfferArt } from "@/modules/offers";
import { usePauseOffscreen } from "@/shared/hooks/usePauseOffscreen";
import { Icon } from "@/shared/ui/Icon";
import { BRAND_STYLES } from "./brandStyles";
import { CountdownReel } from "./CountdownReel";
import { DealArt } from "./DealArt";
import { useReceiptScanner } from "./ReceiptScannerProvider";

/**
 * A rebate offer as the home and deals screens list it: chasing lights along the
 * top, a tile flipping between the brand mark and the product, the amount back,
 * and a reel counting what is left.
 *
 * The card opens the product page; "Scan Now" opens the receipt sheet with this
 * deal attached and does not open the page - the prototype's
 * `event.stopPropagation()`, which here is simply two separate elements with two
 * separate handlers.
 */

/** Five lights, each a fifth of the way round the chase. */
const LIGHT_DELAYS = ["0s", ".15s", ".3s", ".45s", ".6s"];

export interface DealCardProps {
  id: string;
  title: string;
  brand: BrandId;
  brandShort: string;
  rebateLabel: string;
  rebateCents: number;
  dealsLeft: number;
  dispensary: string;
  art: OfferArt;
}

export function DealCard(deal: DealCardProps) {
  const router = useRouter();
  const { openScanner } = useReceiptScanner();
  const { ref, paused } = usePauseOffscreen<HTMLDivElement>();
  const style = BRAND_STYLES[deal.brand];

  const open = () => router.push(`/deals/${deal.id}`);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${deal.title}, ${deal.rebateLabel}. ${deal.dealsLeft} deals left. View deal details and rebate rules.`}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className={`deal-card relative flex cursor-pointer flex-col rounded-[18px] border border-[#e8edf5] bg-white p-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:border-[#4CAF50] active:scale-[0.99] ${
        paused ? "anim-paused" : ""
      }`}
    >
      <div className="marquee-lights">
        {LIGHT_DELAYS.map((delay) => (
          <span key={delay} style={{ animationDelay: delay }} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="border-2 border-[#f0f3f8] bg-[#f4f7fb] p-1.5">
          <div className={`deal-logo border border-border-light`}>
            <div className={`deal-logo-face ${style.logoBackground}`}>
              <span
                className={`font-sans text-[8px] font-extrabold uppercase leading-tight ${style.logoText}`}
              >
                {deal.brandShort.split("\n").map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </div>
            <div className="deal-logo-face product">
              <DealArt art={deal.art} />
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-[15px] font-extrabold tracking-[-0.03em] text-[#101826]">{deal.title}</h4>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg border-[2px] border-[rgb(220_38_38_/_var(--tw-text-opacity,1))] bg-white px-2 text-center text-[15px] font-extrabold text-[rgb(220_38_38_/_var(--tw-text-opacity,1))] md:flex-none">
              {deal.rebateLabel}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openScanner({
                  title: deal.title,
                  amountCents: deal.rebateCents,
                  storeName: deal.dispensary,
                });
              }}
              className="inline-flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0f1d3c] px-2.5 text-white shadow-sm transition hover:bg-[#16274f] active:scale-95 active:shadow-none md:flex-none"
            >
              <Icon name="scan-line" className="h-4 w-4 shrink-0 text-[#9fe7c4]" />
              <span className="text-right text-[11px] font-black leading-tight">Scan Now</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#e3e7ee] pt-2">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span>{deal.dispensary}</span>
          <span className="h-1 w-1 rounded-full bg-[#b8c0ce]" />
          <span>{deal.rebateLabel}</span>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <CountdownReel dealsLeft={deal.dealsLeft} />
          <span className="text-[8px] font-extrabold uppercase leading-tight text-[#101826]">
            Deals
            <br />
            left
          </span>
        </div>
      </div>
    </div>
  );
}
