import { createHash } from "node:crypto";

import type { RateLimitStore } from "./types";

const WINDOW_SECONDS = 10 * 60;
const WINDOW_MS = WINDOW_SECONDS * 1000;
const MAX_REQUESTS = 3;

let storeForTest: RateLimitStore | null = null;
const localRequests = new Map<string, number[]>();

function getRateLimitKey(phone: string) {
  return `otp:send:${phone}`;
}

function checkLocalLimit(phone: string, now: number) {
  const key = getRateLimitKey(phone);
  const windowStart = now - WINDOW_MS;
  const recentRequests = (localRequests.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    localRequests.set(key, recentRequests);
    return false;
  }

  recentRequests.push(now);
  localRequests.set(key, recentRequests);

  return true;
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function checkSupabaseLimit(phone: string): Promise<boolean | null> {
  if (process.env.OTP_RATE_LIMIT_BACKEND !== "supabase") {
    return null;
  }

  const salt = process.env.OTP_RATE_LIMIT_SALT ?? "";
  const phoneHash = sha256Hex(`${phone}:${salt}`);

  // Dynamic import so unit tests don't require service-role env vars unless this
  // backend is explicitly enabled.
  const { createAdminClient } = await import("@/infra/supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("check_otp_dispatch_rate_limit", {
    phone_hash: phoneHash,
  });

  if (error) {
    return null;
  }

  return Boolean(data);
}

export async function checkOtpDispatchRateLimit(phone: string) {
  if (storeForTest) {
    return storeForTest.check(phone);
  }

  const supabaseResult = await checkSupabaseLimit(phone);
  if (supabaseResult !== null) {
    return supabaseResult;
  }

  const now = Date.now();
  return checkLocalLimit(phone, now);
}

export function setOtpRateLimitStoreForTest(store: RateLimitStore | null) {
  storeForTest = store;
}

export function resetLocalOtpRateLimitForTest() {
  localRequests.clear();
}

