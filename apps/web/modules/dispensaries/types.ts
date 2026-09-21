/**
 * A licensed store in the retail directory.
 *
 * Distinct from `modules/offers`' Dispensary, which is a brand's nearby pickup
 * point with offers attached. This is the postal registry the product page's
 * second tab lists and searches - name and address, no deals.
 */
export interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
  county: string;
  country: string;
}
