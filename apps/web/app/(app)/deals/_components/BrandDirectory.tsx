"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandId } from "@/modules/offers";
import { searchDispensaries } from "@/modules/offers";
import { Icon } from "@/shared/ui/Icon";
import { BRAND_STYLES } from "../../_components/brandStyles";

/**
 * Page one of Deals: every brand nearby, filtered as you type.
 *
 * The search runs in the browser over the list the server handed down, which is
 * what the prototype did and what the size of the list justifies - ten brands do
 * not need a round trip per keystroke. `searchDispensaries` decides what counts
 * as a match; this component only draws the result.
 */

export interface BrandRow {
  id: string;
  name: string;
  brand: BrandId;
  featuredProduct: string;
  distance: string;
  offers: { id: string; title: string }[];
}

export function BrandDirectory({ brands }: { brands: BrandRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => searchDispensaries(brands, query), [brands, query]);

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 border-b border-border-light bg-white/95 px-3.5 py-2.5 backdrop-blur-md">
        <div className="relative flex w-full items-center">
          <div className="pointer-events-none absolute left-3 flex items-center text-[#2E7D32]">
            <Icon name="search" className="h-4 w-4 text-[#2E7D32]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search brands or products..."
            autoComplete="off"
            aria-label="Search brands or products"
            className="w-full rounded-xl border border-border-light bg-slate-page py-2 pl-9 pr-8 text-xs font-bold text-navy outline-none transition placeholder:font-medium placeholder:text-slate-400 hover:bg-[#F1F5F9] focus:border-[#4CAF50] focus:bg-white focus:ring-1 focus:ring-[#4CAF50]"
          />
          {query !== "" && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 cursor-pointer p-1 text-slate-400 transition hover:text-navy"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-3.5 mt-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">Top Brands</h3>
            <p className="text-[10px] font-medium text-slate">
              Select a brand to view its exclusive offers
            </p>
          </div>
          <span className="rounded-full border border-[#C8E6C9] bg-[#E8F5E9] px-2.5 py-0.5 text-[9.5px] font-extrabold text-[#2E7D32]">
            {filtered.length} {filtered.length === 1 ? "offer" : "offers"} Nearby
          </span>
        </div>

        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border-light bg-white p-6 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                <Icon name="search" className="h-5 w-5" />
              </div>
              <h5 className="text-xs font-extrabold text-navy">No brands or products found</h5>
              <p className="mt-1 text-[10px] text-slate-400">
                Try searching with a different brand or product name
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 cursor-pointer text-xs font-extrabold text-[#2E7D32] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            filtered.map((brand) => <BrandRowCard key={brand.id} brand={brand} />)
          )}
        </div>
      </div>

      <div className="mx-3.5 mb-6 mt-4 text-center text-[10px] font-semibold uppercase tracking-wider text-slate">
        Click any brand to view its live exclusive offers
      </div>
    </div>
  );
}

function BrandRowCard({ brand }: { brand: BrandRow }) {
  const style = BRAND_STYLES[brand.brand];
  const count = brand.offers.length;

  return (
    <Link
      href={`/deals?brand=${brand.id}`}
      scroll
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-border-light bg-white p-3 text-left transition hover:border-[#4CAF50] hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-[52px] w-[52px] shrink-0 select-none items-center justify-center rounded-2xl border ${style.tile}`}
        >
          <Icon name="tag" className={`h-6 w-6 stroke-[2.2] ${style.badge}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-extrabold text-navy transition group-hover:text-[#2E7D32]">
            {brand.name}
          </h4>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate">
            {brand.featuredProduct}
          </p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="rounded-md border border-[#C8E6C9] bg-[#E8F5E9] px-2 py-0.5 text-xs font-extrabold text-[#2E7D32]">
              {count} {count === 1 ? "Live Offer" : "Live Offers"}
            </span>
            <div className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2E7D32] transition-transform group-hover:translate-x-0.5">
              <span>View Deals</span>
              <Icon name="chevron-right" className="h-4 w-4 text-[#2E7D32]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
