import type { BrandId } from "@/modules/offers";

/**
 * How each brand is dressed on screen.
 *
 * `modules/offers` deliberately carries brand *ids* and no CSS - a palette
 * change should not be a change to the domain - so the mapping from id to tile
 * colour and type treatment lives here, next to the components that draw it.
 *
 * `tile` is the square on the dispensary list; `logoBackground` and `logoText`
 * are the front face of the flipping deal tile. All values are the approved
 * screens', class for class.
 */

export interface BrandStyle {
  tile: string;
  badge: string;
  logoBackground: string;
  logoText: string;
}

export const BRAND_STYLES: Record<BrandId, BrandStyle> = {
  graffiti: {
    tile: "bg-[#1E1A38] text-teal border-purple-950",
    badge: "text-teal",
    logoBackground: "bg-navy-mid",
    logoText: "text-teal font-sans italic -rotate-6",
  },
  mozey: {
    tile: "bg-[#3B0716] text-rose-300 border-rose-950",
    badge: "text-rose-300",
    logoBackground: "bg-[#4C0519]",
    logoText: "text-rose-200 font-bold tracking-tight",
  },
  revolution: {
    tile: "bg-[#042F2E] text-teal-200 border-teal-950",
    badge: "text-teal-200",
    logoBackground: "bg-[#042F2E]",
    logoText: "text-teal-200 font-sans tracking-widest",
  },
  "night-phantom": {
    tile: "bg-[#1E1B4B] text-indigo-300 border-indigo-950",
    badge: "text-indigo-300",
    logoBackground: "bg-[#1E1B4B]",
    logoText: "text-indigo-200 font-sans tracking-tight",
  },
  "paul-bunyan": {
    tile: "bg-[#064E3B] text-emerald-200 border-emerald-950",
    badge: "text-emerald-200",
    logoBackground: "bg-[#064E3B]",
    logoText: "text-emerald-200 font-sans tracking-wide",
  },
  roam: {
    tile: "bg-[#18181B] text-white border-zinc-800",
    badge: "text-white",
    logoBackground: "bg-[#18181B]",
    logoText: "text-white font-sans tracking-widest",
  },
  "twenty-twenty": {
    tile: "bg-[#101626] text-lime border-slate-700/70",
    badge: "text-lime",
    logoBackground: "bg-slate-page",
    logoText: "text-navy font-black",
  },
  kanha: {
    tile: "bg-[#31103F] text-amber-300 border-purple-950",
    badge: "text-amber-300",
    logoBackground: "bg-[#31103F]",
    logoText: "text-amber-300 font-bold",
  },
  signature: {
    tile: "bg-[#2D2006] text-amber-300 border-amber-950",
    badge: "text-amber-300",
    logoBackground: "bg-[#FAF7EF]",
    logoText: "text-[#8A6A1F] font-serif",
  },
  joos: {
    tile: "bg-[#431407] text-orange-300 border-orange-950",
    badge: "text-orange-300",
    logoBackground: "bg-orange-950",
    logoText: "text-orange-300 font-black tracking-wider",
  },
};
