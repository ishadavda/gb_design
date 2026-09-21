import {
  errorResponse,
  isTwentyOneOrOlder,
  normalizeUsPhone,
  parseDateOfBirth,
  successResponse,
  writeCustomerProfile,
} from "@/lib/auth";

export const runtime = "nodejs";

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function readBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || null;
}

export async function POST(request: Request) {
  const accessToken = readBearerToken(request);
  const userId = request.headers.get("x-auth-user-id");

  if (!accessToken || !userId) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  const body = await readJson(request);

  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";

  if (!firstName) {
    return errorResponse("INVALID_FIRST_NAME", 422);
  }

  const phoneResult = normalizeUsPhone(body?.phone);
  if (!phoneResult.ok) {
    return errorResponse("INVALID_ONBOARDING_PHONE", 422);
  }

  const dobResult = parseDateOfBirth(body?.dateOfBirth);
  if (!dobResult.ok) {
    return errorResponse("INVALID_DOB", 422);
  }

  // Match the HTML age gate behavior (year-based).
  const birthYear = dobResult.date.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  if (currentYear - birthYear < 21 || !isTwentyOneOrOlder(dobResult.date)) {
    return errorResponse("UNDERAGE", 422);
  }

  const consent = body?.consent;
  const dataConsent =
    consent?.dataConsent === undefined ? true : consent?.dataConsent;
  const isDataConsentBoolean = typeof dataConsent === "boolean";

  if (!isDataConsentBoolean || dataConsent !== true) {
    return errorResponse("DATA_CONSENT_REQUIRED", 422);
  }

  const { data, error } = await writeCustomerProfile(accessToken, {
    user_id: userId,
    first_name: firstName,
    phone: phoneResult.phone,
    date_of_birth: dobResult.ymd,
  });

  if (error || !data) {
    return errorResponse("PROFILE_WRITE_FAILED", 500);
  }

  return successResponse(
    {
      profile: {
        user_id: data.user_id,
        first_name: data.first_name,
        phone: data.phone,
        date_of_birth: data.date_of_birth,
      },
    },
    201,
  );
}

