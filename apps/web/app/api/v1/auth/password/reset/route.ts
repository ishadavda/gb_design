import {
  errorResponse,
  isValidPassword,
  resetPasswordWithTokens,
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

  const accessToken =
    typeof body?.access_token === "string" ? body.access_token.trim() : "";
  const refreshToken =
    typeof body?.refresh_token === "string" ? body.refresh_token.trim() : "";
  const password = body?.password;

  if (!accessToken || !refreshToken) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  if (!isValidPassword(password)) {
    return errorResponse("INVALID_PASSWORD", 422);
  }

  const { error } = await resetPasswordWithTokens(
    accessToken,
    refreshToken,
    password,
  );

  if (error) {
    return errorResponse("UNAUTHORIZED", 401);
  }

  return successResponse({ message: "Password updated successfully." });
}

