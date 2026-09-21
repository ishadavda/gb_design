/**
 * The person the approved screens depict.
 *
 * Claire appears on four of them - the home greeting, the account details, the
 * cash-out header, the referral link - and until there is a session to read an
 * account from, she is typed in one place rather than four.
 *
 * Same standing as the stubs under `modules/`: content, not logic, and the first
 * thing to delete when `modules/accounts` can answer instead.
 */
export const DEMO_PROFILE = {
  firstName: "Claire",
  lastName: "Henderson",
  /** As the form holds it: national digits, with the +1 shown beside the field. */
  phone: "(312) 555-0192",
  email: "claire@example.com",
  /** ISO, because the edit sheet uses a date input. Printed as "June 15, 1998". */
  dob: "1998-06-15",
  zip: "60601",
  city: "Chicago, IL",
  joined: "Joined July 2024",
  tier: "Gold VIP Member",
  passId: "GB-60601-CLAIRE-892",
  referralLink: "https://app.greenbackcash.com/join?ref=CLAIRE2026",
  bank: {
    name: "Chase Premier Checking",
    mask: "•••• 4892",
  },
} as const;
