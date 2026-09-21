export type ApiErrorCode =
  | "INVALID_PHONE"
  | "INVALID_ONBOARDING_PHONE"
  | "INVALID_OTP"
  | "OTP_RATE_LIMITED"
  | "INVALID_REQUEST"
  | "INVALID_EMAIL"
  | "INVALID_PASSWORD"
  | "INVALID_DOB"
  | "INVALID_FIRST_NAME"
  | "DATA_CONSENT_REQUIRED"
  | "UNDERAGE"
  | "PROFILE_WRITE_FAILED"
  | "UNAUTHORIZED"
  | "CONSENT_REQUIRED"
  | "CONSENT_WRITE_FAILED"
  | "SERVER_ERROR";

export type PhoneValidationResult =
  | { ok: true; phone: string }
  | { ok: false };

export type RateLimitStore = {
  check: (key: string) => Promise<boolean>;
};

// Phase I operates on single-layer platform consent only (PRD v4.3 §4.2.1).
// Data processing and functional SMS are mandatory to complete registration;
// marketing is an optional opt-in.
export type ConsentGrantInput = {
  dataProcessingGranted?: unknown;
  smsGranted?: unknown;
  marketingGranted?: unknown;
};

export type ConsentValidationResult =
  | {
      ok: true;
      dataProcessingGranted: true;
      smsGranted: true;
      marketingGranted: boolean;
    }
  | { ok: false };

// Row shape persisted to public.consent_records.
export type ConsentRecordRow = {
  anonymized_user_id: string;
  scope: "platform";
  data_processing_granted: true;
  sms_granted: true;
  marketing_granted: boolean;
  granted_timestamp: string;
};

export type ConsentWriteResult = {
  data: ConsentRecordRow | null;
  error: { message: string } | null;
};

export type ConsentWriter = (
  accessToken: string,
  record: ConsentRecordRow,
) => Promise<ConsentWriteResult>;

