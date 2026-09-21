import {
  errorResponse,
  isValidOtpCode,
  normalizeConsentGrants,
  normalizeUsPhone,
  successResponse,
  verifyPhoneOtp,
  writePlatformConsent,
} from "@/lib/auth";

export const runtime = "nodejs";

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const phoneResult = normalizeUsPhone(body?.phone);

  if (!phoneResult.ok) {
    return errorResponse("INVALID_PHONE", 422);
  }

  if (!isValidOtpCode(body?.code)) {
    return errorResponse("INVALID_OTP", 422);
  }

  // Validate the Phase I platform consent choices before touching Supabase so
  // registration cannot complete without the mandatory grants.
  const consentResult = normalizeConsentGrants(body?.consent);

  if (!consentResult.ok) {
    return errorResponse("CONSENT_REQUIRED", 422);
  }

  const { data, error } = await verifyPhoneOtp(phoneResult.phone, body.code);

  if (error || !data.session || !data.user) {
    return errorResponse("INVALID_OTP", 401);
  }

  // Capture the exact double opt-in instant in ISO-8601 UTC and persist the
  // immutable consent audit row. Tokens are only returned once the consent
  // record is durably written, giving atomic auth + consent semantics.
  const grantedTimestamp = new Date().toISOString();

  const { data: consentRecord, error: consentError } = await writePlatformConsent(
    data.session.access_token,
    {
      anonymized_user_id: data.user.id,
      scope: "platform",
      data_processing_granted: true,
      sms_granted: true,
      marketing_granted: consentResult.marketingGranted,
      granted_timestamp: grantedTimestamp,
    },
  );

  if (consentError || !consentRecord) {
    return errorResponse("CONSENT_WRITE_FAILED", 500);
  }

  return successResponse({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
    },
    user: {
      id: data.user.id,
      phone: data.user.phone,
    },
    consent: {
      scope: consentRecord.scope,
      data_processing_granted: consentRecord.data_processing_granted,
      sms_granted: consentRecord.sms_granted,
      marketing_granted: consentRecord.marketing_granted,
      granted_timestamp: consentRecord.granted_timestamp,
    },
  });
}

