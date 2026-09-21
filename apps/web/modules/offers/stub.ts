import type { Dispensary, Offer } from "./types";

/**
 * THE OFFERS THE SCREENS SHOW, IN MEMORY.
 *
 * Same standing as infra/providers/payouts/stub.ts and modules/onboarding/stub.ts:
 * a screen you cannot run is a screen you cannot finish building. There is no
 * offers table yet, and putting one behind these screens is a schema decision, not
 * a UI one - so the approved content lives here, unchanged, until `queries.ts`
 * arrives beside it and the pages import that instead.
 *
 * Every value is the prototype's. Nothing here is invented, because a screen
 * reviewed against different copy has not been reviewed.
 */

function offer(
  id: string,
  title: string,
  brand: Offer["brand"],
  brandShort: string,
  rebateCents: number,
  dealsLeft: number,
  dispensary: string,
  art: Offer["art"],
): Offer {
  return { id, title, brand, brandShort, rebateCents, dealsLeft, dispensary, art };
}

/** The three cards on the home screen, in order. */
export const FEATURED_OFFERS: Offer[] = [
  offer(
    "deal-home-1",
    "Twenty Twenty Flower",
    "twenty-twenty",
    "TWENTY\nTWENTY",
    500,
    14,
    "Bud & Rita's · 0.4 mi",
    "flower",
  ),
  offer(
    "deal-home-2",
    "Graffiti pre-rolls",
    "graffiti",
    "GRAFFITI",
    400,
    3,
    "Sunnyside · 0.9 mi",
    "preroll",
  ),
  offer(
    "deal-home-3",
    "Signature concentrates",
    "signature",
    "SIGNATURE",
    600,
    42,
    "EarthMed · 1.2 mi",
    "wax",
  ),
];

/** The deals screen: every dispensary nearby, each with its own offers. */
export const DISPENSARY_DIRECTORY: Dispensary[] = [
  {
    id: "graffiti",
    name: "Graffiti",
    brand: "graffiti",
    featuredProduct: "Sour Banana Sherbet",
    monogram: "GRAF",
    distance: "0.4 mi away",
    offers: [
      offer("deal-graffiti-1", "Sour Banana Sherbet", "graffiti", "GRAFFITI", 500, 14, "Graffiti · 0.4 mi away", "preroll"),
      offer("deal-graffiti-2", "Graffiti Diamond Infused 1g", "graffiti", "GRAFFITI", 400, 9, "Graffiti · 0.4 mi away", "preroll"),
    ],
  },
  {
    id: "mozey",
    name: "Mozey",
    brand: "mozey",
    featuredProduct: "Razzle Dazzle Berry",
    monogram: "MOZEY",
    distance: "0.9 mi away",
    offers: [
      offer("deal-mozey-1", "Razzle Dazzle Berry", "mozey", "MOZEY", 400, 18, "Mozey · 0.9 mi away", "edible"),
      offer("deal-mozey-2", "Mozey Berry Blast Gummies 100mg", "mozey", "MOZEY", 300, 22, "Mozey · 0.9 mi away", "edible"),
    ],
  },
  {
    id: "revolution",
    name: "Revolution",
    brand: "revolution",
    featuredProduct: "Gorilla'd Cheese",
    monogram: "REV",
    distance: "1.2 mi away",
    offers: [
      offer("deal-revolution-1", "Gorilla'd Cheese", "revolution", "REVO\nLUTION", 600, 9, "Revolution · 1.2 mi away", "flower"),
      offer("deal-revolution-2", "Revolution Live Terp Tank 0.5g", "revolution", "REVO\nLUTION", 500, 15, "Revolution · 1.2 mi away", "cart"),
    ],
  },
  {
    id: "night-phantom",
    name: "Night Phantom",
    brand: "night-phantom",
    featuredProduct: "Dawn: Conjure",
    monogram: "NIGHT",
    distance: "1.8 mi away",
    offers: [
      offer("deal-nightphantom-1", "Dawn: Conjure", "night-phantom", "NIGHT\nPHANTOM", 500, 12, "Night Phantom · 1.8 mi away", "resin"),
      offer("deal-nightphantom-2", "Dusk: Spectre Live Rosin 1g", "night-phantom", "NIGHT\nPHANTOM", 600, 8, "Night Phantom · 1.8 mi away", "wax"),
    ],
  },
  {
    id: "paul-bunyan",
    name: "Paul Bunyan",
    brand: "paul-bunyan",
    featuredProduct: "Sunshine Geisha (APF X FMB)",
    monogram: "BUNYAN",
    distance: "2.1 mi away",
    offers: [
      offer("deal-paulbunyan-1", "Sunshine Geisha (APF X FMB)", "paul-bunyan", "PAUL\nBUNYAN", 500, 20, "Paul Bunyan · 2.1 mi away", "flower2"),
      offer("deal-paulbunyan-2", "Paul Bunyan Big Sativa Pre-Rolls", "paul-bunyan", "PAUL\nBUNYAN", 400, 16, "Paul Bunyan · 2.1 mi away", "preroll"),
    ],
  },
  {
    id: "roam",
    name: "ROAM",
    brand: "roam",
    featuredProduct: "Blackberry Kush",
    monogram: "ROAM",
    distance: "2.7 mi away",
    offers: [
      offer("deal-roam-1", "Blackberry Kush", "roam", "ROAM", 600, 15, "ROAM · 2.7 mi away", "vape"),
      offer("deal-roam-2", "ROAM Citrus All-In-One Vape 1g", "roam", "ROAM", 500, 11, "ROAM · 2.7 mi away", "vape"),
    ],
  },
  {
    id: "twenty-twenty",
    name: "Twenty Twenty",
    brand: "twenty-twenty",
    featuredProduct: "Goon Berries",
    monogram: "20/20",
    distance: "3.5 mi away",
    offers: [
      offer("deal-twentytwenty-1", "Goon Berries", "twenty-twenty", "TWENTY\nTWENTY", 500, 22, "Twenty Twenty · 3.5 mi away", "flower"),
      offer("deal-twentytwenty-2", "Twenty Twenty 3.5g Cured Flower", "twenty-twenty", "TWENTY\nTWENTY", 500, 14, "Twenty Twenty · 3.5 mi away", "flower"),
    ],
  },
  {
    id: "kanha",
    name: "KANHA",
    brand: "kanha",
    featuredProduct: "Grape Limeade",
    monogram: "KANHA",
    distance: "4.2 mi away",
    offers: [
      offer("deal-kanha-1", "Grape Limeade", "kanha", "KANHA", 400, 17, "KANHA · 4.2 mi away", "edible"),
      offer("deal-kanha-2", "KANHA Nano Fast-Acting Gummies 100mg", "kanha", "KANHA", 400, 25, "KANHA · 4.2 mi away", "edible"),
    ],
  },
  {
    id: "signature",
    name: "SIGNATURE",
    brand: "signature",
    featuredProduct: "BOGEYMAN",
    monogram: "SIGN",
    distance: "4.8 mi away",
    offers: [
      offer("deal-signature-1", "BOGEYMAN", "signature", "SIGNATURE", 600, 31, "SIGNATURE · 4.8 mi away", "wax"),
      offer("deal-signature-2", "Signature Cold Cure Live Rosin 1g", "signature", "SIGNATURE", 700, 19, "SIGNATURE · 4.8 mi away", "wax"),
    ],
  },
  {
    id: "joos",
    name: "Joos",
    brand: "joos",
    featuredProduct: "Pineapple Express",
    monogram: "JOOS",
    distance: "5.5 mi away",
    offers: [
      offer("deal-joos-1", "Pineapple Express", "joos", "JOOS", 500, 11, "Joos · 5.5 mi away", "vape"),
      offer("deal-joos-2", "Joos Live Resin Disposable 300mg", "joos", "JOOS", 400, 16, "Joos · 5.5 mi away", "cart"),
    ],
  },
];

/** Every offer in the directory, flattened - how the product page finds one by id. */
export const ALL_OFFERS: Offer[] = [
  ...FEATURED_OFFERS,
  ...DISPENSARY_DIRECTORY.flatMap((dispensary) => dispensary.offers),
];

export function findOffer(id: string): Offer | null {
  return ALL_OFFERS.find((candidate) => candidate.id === id) ?? null;
}

export function findDispensary(id: string): Dispensary | null {
  return DISPENSARY_DIRECTORY.find((candidate) => candidate.id === id) ?? null;
}
