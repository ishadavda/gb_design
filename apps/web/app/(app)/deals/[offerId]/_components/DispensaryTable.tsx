"use client";

import { useMemo, useState } from "react";
import type { Store } from "@/modules/dispensaries";
import { searchStores } from "@/modules/dispensaries";
import { Icon } from "@/shared/ui/Icon";

/**
 * Tab two: every licensed store the rebate is good at, searchable.
 *
 * Twenty rows, filtered in the browser over the list the page handed down -
 * `searchStores` is the rule about what a match means, and it matches on any
 * field, so a zip code and a county name both find something.
 *
 * "Get Direction" is deliberately inert, as in the approved screens: wiring it
 * to a maps URL is a product decision nobody has made yet.
 */
export function DispensaryTable({ stores }: { stores: Store[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => searchStores(stores, query), [stores, query]);

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-border-light bg-white p-3.5">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy">
            Eligible Dispensary List
          </h3>
          <p className="mt-0.5 text-[10.5px] font-medium text-slate">
            {stores.length} State-Licensed Dispensary Locations
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-black text-navy">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
          <span>{filtered.length} Dispensaries</span>
        </span>
      </div>

      <div className="relative flex w-full items-center">
        <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
          <Icon name="search" className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search dispensary, address, city, zip, county..."
          autoComplete="off"
          aria-label="Search dispensaries"
          className="w-full rounded-xl border border-border-light bg-white py-2.5 pl-9 pr-8 text-xs font-bold text-navy outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-teal focus:ring-1 focus:ring-teal"
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

      <div className="space-y-2.5 pb-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border-light bg-white p-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="search" className="h-5 w-5 text-teal" />
            </div>
            <h5 className="text-xs font-extrabold text-navy">No dispensaries found</h5>
            <p className="mt-1 text-[10px] text-slate-400">
              Try searching by dispensary name, city, county, or zip code
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 cursor-pointer text-xs font-extrabold text-teal hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          filtered.map((store) => (
            <div
              key={store.id}
              className="flex flex-col gap-2.5 rounded-2xl border border-border-light bg-white p-3.5 transition hover:border-teal/40"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-gradient-to-br from-[#101626] to-[#1E2A45] text-teal">
                  <Icon name="store" className="h-4 w-4 stroke-[2.2]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-extrabold leading-tight text-navy">
                    {store.name}
                  </h4>

                  <div className="mt-1 space-y-0.5">
                    <div className="truncate text-[11.5px] font-bold text-navy">{store.address}</div>
                    <div className="flex items-center gap-1 truncate text-[10.5px] font-medium text-slate-500">
                      <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0 text-teal" />
                      <span>
                        {store.city}, {store.zip}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{store.county} County</span>
                      <span className="text-slate-300">·</span>
                      <span>{store.country}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border-light/70 pt-2">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Icon name="shield-check" className="h-3.5 w-3.5 text-teal" />
                  <span>State Licensed</span>
                </span>
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-navy px-3.5 py-1.5 text-[11px] font-extrabold text-white transition hover:bg-navy-mid active:scale-95"
                >
                  <Icon name="navigation" className="h-3.5 w-3.5 stroke-[2.2] text-teal" />
                  <span>Get Direction</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
