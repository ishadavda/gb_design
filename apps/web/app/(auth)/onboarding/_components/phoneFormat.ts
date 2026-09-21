/**
 * How a US number is shown on the two screens that display one.
 *
 * modules/auth/schema.ts requires E.164 and is deliberately international
 * (7-14 digits), so it cannot be what enforces "ten digits" - a seven-digit
 * number would pass it. That rule belongs here, next to the +1 the screens
 * commit to, and the conversion between the two forms belongs here with it.
 */

export const US_NUMBER_LENGTH = 10;

/** "(312) 555-0192", built up as the digits arrive. */
export function formatUsNumber(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Keeps only what a US subscriber number can be: ten digits.
 *
 * A pasted "+1 (312) 555-0192" or "1-312-555-0192" carries the country code the
 * +1 prefix already shows, so it is dropped rather than folded into the number -
 * otherwise it silently becomes +113125550192, which the schema accepts and the
 * carrier does not.
 */
export function toSubscriberDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode =
    digits.length > US_NUMBER_LENGTH && digits.startsWith("1") ? digits.slice(1) : digits;

  return withoutCountryCode.slice(0, US_NUMBER_LENGTH);
}
