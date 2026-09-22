import { notFound } from "next/navigation";
import { DISPENSARY_DIRECTORY, findDispensary } from "@/modules/offers";
import { BrandDirectory } from "./_components/BrandDirectory";
import { BrandOffers } from "./_components/BrandOffers";

/**
 * Exclusive Deals. Two panels in the prototype, two states of one URL here:
 * `/deals` lists the brands, `/deals?brand=graffiti` lists that brand's offers.
 *
 * Keeping it one route rather than two mirrors the approved screens - the tab
 * does not change, the header does not move - while still giving the second
 * panel an address, which the prototype's hidden `<div>` never had.
 */
export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;

  if (brand) {
    const dispensary = findDispensary(brand);

    if (!dispensary) notFound();

    return (
      <div className="relative min-h-0 w-full flex-1 overflow-y-auto pb-24 no-scrollbar">
        <BrandOffers
          name={dispensary.name}
          brand={dispensary.brand}
          distance={dispensary.distance}
          offers={dispensary.offers}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-y-auto pb-24 no-scrollbar">
      <BrandDirectory
        brands={DISPENSARY_DIRECTORY.map((dispensary) => ({
          id: dispensary.id,
          name: dispensary.name,
          brand: dispensary.brand,
          featuredProduct: dispensary.featuredProduct,
          distance: dispensary.distance,
          offers: dispensary.offers.map((offer) => ({ id: offer.id, title: offer.title })),
        }))}
      />
    </div>
  );
}
