import type { Store } from "./types";

/**
 * The twenty licensed stores the approved product page lists, verbatim.
 *
 * In memory for the same reason as the offers: there is no table behind this yet,
 * and inventing one is a schema decision rather than a UI one.
 */
export const STORE_DIRECTORY: Store[] = [
  { id: 1, name: "The Cannaisseur - Wood River", address: "40 E Ferguson Ave", city: "Wood River", zip: "62095", county: "Madison", country: "USA" },
  { id: 2, name: "Here and Now - Des Plaines", address: "1587 Lee St.", city: "Des Plaines", zip: "60018", county: "Cook", country: "USA" },
  { id: 3, name: "Pekin Local Dispensary & Supply", address: "359 Court St.", city: "Pekin", zip: "61554", county: "Tazewell", country: "USA" },
  { id: 4, name: "Jane & Bud's - Elgin", address: "205 S Randall Rd", city: "Elgin", zip: "60123", county: "Kane", country: "USA" },
  { id: 5, name: "Mint Cannabis - Villa Park", address: "310 E North Ave", city: "Villa Park", zip: "60181", county: "DuPage", country: "USA" },
  { id: 6, name: "Mint Cannabis - Forest Park", address: "7207 Roosevelt Rd", city: "Forest Park", zip: "60130", county: "Cook", country: "USA" },
  { id: 7, name: "Bisa Lina Joliet", address: "2121 W Jefferson St", city: "Joliet", zip: "60435", county: "Will", country: "USA" },
  { id: 8, name: "Bud & Rita's - The Loop", address: "105 W Madison St", city: "Chicago", zip: "60602", county: "Cook", country: "USA" },
  { id: 9, name: "Cannect Dispensary", address: "3147 Mannheim Rd", city: "Franklin Park", zip: "60131", county: "Cook", country: "USA" },
  { id: 10, name: "Dutchess Cannabis - Batavia", address: "144 S Randall Rd", city: "Batavia", zip: "60510", county: "Kane", country: "USA" },
  { id: 11, name: "Lakeshore Cannabis Club", address: "1335 Lakeside Dr Unit 4", city: "Romeoville", zip: "60446", county: "Will", country: "USA" },
  { id: 12, name: "Terrabis - Mundelein", address: "3210 W Il Route 60", city: "Mundelein", zip: "60060", county: "Lake", country: "USA" },
  { id: 13, name: "Tree Haus - Diamond", address: "2910 E. Division St", city: "Diamond", zip: "60416", county: "Will", country: "USA" },
  { id: 14, name: "Aces Dispensary - Plainfield", address: "12627 S Route 59", city: "Plainfield", zip: "60585", county: "Will", country: "USA" },
  { id: 15, name: "Supergood Store", address: "660 N. Wolf Rd.", city: "Des Plaines", zip: "60016", county: "Cook", country: "USA" },
  { id: 16, name: "Bloc Dispensary - Antioch", address: "417 E Il Route 173 Unit 106", city: "Antioch", zip: "60002", county: "Lake", country: "USA" },
  { id: 17, name: "Starbuds - Summit", address: "5436 S Harlem Ave", city: "Summit", zip: "60501", county: "Cook", country: "USA" },
  { id: 18, name: "Bloc Dispensary - Mattoon", address: "511 Lake Land Blvd", city: "Mattoon", zip: "61938", county: "Coles", country: "USA" },
  { id: 19, name: "Cloud 9 Cannabis - Schaumburg", address: "1823 W Wise Rd.", city: "Schaumburg", zip: "60193", county: "Cook", country: "USA" },
  { id: 20, name: "The Carbondale Dispensary", address: "613 E Main St.", city: "Carbondale", zip: "62901", county: "Jackson", country: "USA" },
];
