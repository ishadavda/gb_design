import { createClient } from "@supabase/supabase-js";
import { env } from "@/infra/config/env";

import type {
  ConsentGrantInput,
  ConsentRecordRow,
  ConsentValidationResult,
  ConsentWriter,
} from "./types";

// Mandatory Phase I grants. When the client omits them we default to the
// required value; an explicit non-true value blocks registration because the
// database CHECK constraints forbid persisting a false mandatory grant.
function parseMandatoryGrant(value: unknown): true | null {
  if (value === undefined || value === true) {
    return true;
  }

  return null;
}

// Optional marketing opt-in. Absent means not granted; only an explicit
// boolean is accepted so compliance evidence is never coerced from junk input.
function parseOptionalGrant(value: unknown): boolean | null {
  if (value === undefined) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return null;
}

export function normalizeConsentGrants(
  input: ConsentGrantInput | null | undefined,
): ConsentValidationResult {
  const dataProcessingGranted = parseMandatoryGrant(
    input?.dataProcessingGranted,
  );
  const smsGranted = parseMandatoryGrant(input?.smsGranted);
  const marketingGranted = parseOptionalGrant(input?.marketingGranted);

  if (
    dataProcessingGranted === null ||
    smsGranted === null ||
    marketingGranted === null
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    dataProcessingGranted,
    smsGranted,
    marketingGranted,
  };
}

let writerForTest: ConsentWriter | null = null;

function createConsentWriter(): ConsentWriter {
  return async (accessToken, record) => {
    // Insert with the freshly issued session token so the write is scoped by
    // RLS to the authenticated user (anonymized_user_id = auth.uid()).
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await client
      .from("consent_records")
      .insert(record)
      .select()
      .single();

    return {
      data: (data as ConsentRecordRow | null) ?? null,
      error: error ? { message: error.message } : null,
    };
  };
}

export async function writePlatformConsent(accessToken: string, record: ConsentRecordRow) {
  const writer = writerForTest ?? createConsentWriter();
  return writer(accessToken, record);
}

export function setConsentWriterForTest(writer: ConsentWriter | null) {
  writerForTest = writer;
}

