/**
 * PURE LOGIC - what the brand search on the deals screen means.
 *
 * The prototype matched the typed text against the brand name, the product it
 * features, and the title of every offer it carries, so "gummies" finds KANHA
 * and "Graffiti" finds Graffiti. Kept here rather than in the component because
 * "what counts as a match" is a decision, and decisions are testable without a
 * browser.
 *
 * Typed by the fields it reads rather than by `Dispensary`, so the screen can
 * pass the view rows it already has instead of the whole entity.
 */
export interface SearchableBrand {
  name: string;
  featuredProduct: string;
  offers: { title: string }[];
}

export function searchDispensaries<T extends SearchableBrand>(brands: T[], term: string): T[] {
  const needle = term.trim().toLowerCase();
  if (needle === "") return brands;

  return brands.filter((brand) =>
    [brand.name, brand.featuredProduct, ...brand.offers.map((offer) => offer.title)]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
