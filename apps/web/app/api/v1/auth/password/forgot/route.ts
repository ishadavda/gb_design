import {
  errorResponse,
  normalizeEmail,
  sendPasswordResetEmail,
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
  const emailResult = normalizeEmail(body?.email);

  if (!emailResult.ok) {
    return errorResponse("INVALID_EMAIL", 422);
  }

  const redirectTo =
    typeof body?.redirectTo === "string" ? body.redirectTo.trim() : undefined;

  try {
    // Avoid account enumeration: always return 200 if the request is syntactically valid.
    await sendPasswordResetEmail(emailResult.email, redirectTo || undefined);
  } catch {
    return errorResponse("SERVER_ERROR", 500);
  }

  return successResponse({
    message: "If an account exists for that email, a reset link has been sent.",
  });
}

