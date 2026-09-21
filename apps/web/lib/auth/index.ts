import { NextResponse } from "next/server";

import type { ApiErrorCode } from "./types";

export * from "./consent";
export * from "./profile";
export * from "./schema";
export * from "./service";
export * from "./session";
export * from "./types";

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_PHONE: "Enter a valid US mobile phone number.",
  INVALID_ONBOARDING_PHONE: "Please enter a valid phone number!",
  INVALID_OTP: "The verification code is invalid or expired.",
  OTP_RATE_LIMITED:
    "Too many verification code requests. Please try again later.",
  INVALID_REQUEST: "Invalid request.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_PASSWORD: "Enter a valid password.",
  INVALID_DOB: "Please select your date of birth!",
  INVALID_FIRST_NAME: "Please enter a personalization name.",
  DATA_CONSENT_REQUIRED:
    "You must accept the Data Controller agreement to verify cash rewards.",
  UNDERAGE: "Must be 21+ to access!",
  PROFILE_WRITE_FAILED:
    "Unable to complete onboarding. Please try again later.",
  UNAUTHORIZED: "Authentication required.",
  CONSENT_REQUIRED:
    "Data processing and functional SMS consent are required to continue.",
  CONSENT_WRITE_FAILED:
    "Unable to record your consent choices. Please try again later.",
  SERVER_ERROR: "Unable to process the request. Please try again later.",
};

export function successResponse<T extends object>(body: T, status = 200) {
  return NextResponse.json({ success: true, ...body }, { status });
}

export function errorResponse(code: ApiErrorCode, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: ERROR_MESSAGES[code],
      },
    },
    { status },
  );
}

