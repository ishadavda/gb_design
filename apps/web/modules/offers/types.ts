/**
 * The nouns of the deals screens: a rebate offer, and the dispensary carrying it.
 *
 * Money is integer cents, per the currency rule in ARCHITECTURE.md §15 - the
 * screens print "$5 back", which is a rendering of 500, not a value to store.
 *
 * `brand` and `art` are ids, not CSS. The approved screens give every brand its
 * own tile colour, type treatment and product illustration, but that mapping is
 * presentation and lives beside the components that draw it. A domain type
 * carrying `"bg-[#1E1A38] text-teal"` would make a palette change a change to
 * the domain.
 */

export type BrandId =
  | "graffiti"
  | "mozey"
  | "revolution"
  | "night-phantom"
  | "paul-bunyan"
  | "roam"
  | "twenty-twenty"
  | "kanha"
  | "signature"
  | "joos";

/** Which product illustration the tile flips to. */
export type OfferArt =
  | "flower"
  | "flower2"
  | "preroll"
  | "edible"
  | "resin"
  | "wax"
  | "cart"
  | "vape";

export interface Offer {
  id: string;
  title: string;
  brand: BrandId;
  /** The brand mark as printed on the tile; "\n" is a line break in the design. */
  brandShort: string;
  rebateCents: number;
  dealsLeft: number;
  /** Where it can be claimed, as the card prints it: "Graffiti · 0.4 mi away". */
  dispensary: string;
  art: OfferArt;
}

export interface Dispensary {
  id: string;
  name: string;
  brand: BrandId;
  featuredProduct: string;
  monogram: string;
  distance: string;
  offers: Offer[];
}
