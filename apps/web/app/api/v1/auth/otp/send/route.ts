import {
  checkOtpDispatchRateLimit,
  errorResponse,
  normalizeUsPhone,
  sendPhoneOtp,
  successResponse,
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

  const isAllowed = await checkOtpDispatchRateLimit(phoneResult.phone);

  if (!isAllowed) {
    return errorResponse("OTP_RATE_LIMITED", 429);
  }

  const { error } = await sendPhoneOtp(phoneResult.phone);

  if (error) {
    return errorResponse("SERVER_ERROR", 500);
  }

  return successResponse({ message: "Verification code sent" });
}

