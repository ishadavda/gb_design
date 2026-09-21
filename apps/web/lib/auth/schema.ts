import type { PhoneValidationResult } from "./types";

export function normalizeUsPhone(input: unknown): PhoneValidationResult {
  if (typeof input !== "string") {
    return { ok: false };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false };
  }

  // Accept either a 10-digit US number ("3125550123") or E.164 "+1XXXXXXXXXX".
  const digitsOnly = trimmed.replace(/[^\d]/g, "");

  if (/^\d{10}$/.test(digitsOnly)) {
    return { ok: true, phone: `+1${digitsOnly}` };
  }

  if (/^\+1\d{10}$/.test(trimmed)) {
    return { ok: true, phone: trimmed };
  }

  // Also accept 11 digits starting with 1 ("13125550123").
  if (/^1\d{10}$/.test(digitsOnly)) {
    return { ok: true, phone: `+${digitsOnly}` };
  }

  return { ok: false };
}

export function isValidOtpCode(input: unknown): input is string {
  return typeof input === "string" && /^\d{6}$/.test(input);
}

export function normalizeEmail(input: unknown) {
  if (typeof input !== "string") {
    return { ok: false as const };
  }

  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false as const };
  }

  // Pragmatic: good enough for API validation without trying to fully implement RFC 5322.
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!isValid) {
    return { ok: false as const };
  }

  return { ok: true as const, email: trimmed };
}

export function isValidPassword(input: unknown): input is string {
  if (typeof input !== "string") {
    return false;
  }

  const password = input.trim();
  if (password.length < 8 || password.length > 72) {
    return false;
  }

  // Require at least one letter and one digit.
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return false;
  }

  return true;
}

export function parseDateOfBirth(input: unknown) {
  if (typeof input !== "string") {
    return { ok: false as const };
  }

  const raw = input.trim();
  if (!raw) {
    return { ok: false as const };
  }

  // Accept YYYY-MM-DD or ISO timestamps; normalize to YYYY-MM-DD.
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  let date: Date | null = null;
  let ymd: string | null = null;

  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    ymd = `${y}-${m}-${d}`;
    // Parse at midnight UTC so the date is stable across environments.
    date = new Date(`${ymd}T00:00:00.000Z`);
  } else {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
      const y = parsed.getUTCFullYear();
      const m = String(parsed.getUTCMonth() + 1).padStart(2, "0");
      const d = String(parsed.getUTCDate()).padStart(2, "0");
      ymd = `${y}-${m}-${d}`;
    }
  }

  if (!date || !ymd || Number.isNaN(date.getTime())) {
    return { ok: false as const };
  }

  return { ok: true as const, ymd, date };
}

export function isTwentyOneOrOlder(dob: Date, now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  let age = year - dob.getUTCFullYear();
  const hasHadBirthdayThisYear =
    month > dob.getUTCMonth() ||
    (month === dob.getUTCMonth() && day >= dob.getUTCDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 21;
}

