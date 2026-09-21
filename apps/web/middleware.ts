import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/infra/config/env";

/**
 * Runs before every matched request.
 *
 * Refreshes the Supabase session cookie. Server Components cannot write cookies,
 * so without this the session expires and reads start failing - see the comment
 * in infra/supabase/server.ts.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ---------------------------------------------------------------------------
  // API bearer-token auth & refresh (mobile / PWA / external consumers).
  // ---------------------------------------------------------------------------
  if (pathname.startsWith("/api/v1/")) {
    // Let CORS preflights through; handlers can decide what to return.
    if (request.method === "OPTIONS") {
      return NextResponse.next();
    }

    // Auth endpoints must remain public (OTP, password reset, etc).
    if (pathname.startsWith("/api/v1/auth/")) {
      return NextResponse.next();
    }

    function jsonError(status: number, code: string, message: string) {
      return NextResponse.json(
        {
          success: false,
          error: { code, message },
        },
        { status },
      );
    }

    function getBearerToken(req: NextRequest) {
      const header = req.headers.get("authorization") ?? "";
      const match = /^Bearer\s+(.+)$/i.exec(header);
      return match?.[1]?.trim() || null;
    }

    function getRefreshToken(req: NextRequest) {
      return req.headers.get("x-refresh-token") ?? req.headers.get("x-supabase-refresh-token");
    }

    async function fetchSupabaseUser(accessToken: string) {
      const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: env.supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return { ok: false as const, status: response.status };
      }

      const user = (await response.json()) as { id: string };
      return { ok: true as const, userId: user.id };
    }

    async function refreshSupabaseSession(refreshToken: string) {
      const response = await fetch(
        `${env.supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: {
            apikey: env.supabaseAnonKey,
            Authorization: `Bearer ${env.supabaseAnonKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );

      if (!response.ok) {
        return { ok: false as const };
      }

      const data = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
        user?: { id?: string };
      };

      if (!data.access_token) {
        return { ok: false as const };
      }

      return {
        ok: true as const,
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? refreshToken,
        expiresIn: data.expires_in ?? null,
        tokenType: data.token_type ?? "bearer",
        userId: data.user?.id ?? null,
      };
    }

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonError(401, "UNAUTHORIZED", "Authentication required.");
    }

    const user = await fetchSupabaseUser(accessToken);
    if (user.ok) {
      const headers = new Headers(request.headers);
      headers.set("x-auth-user-id", user.userId);
      return NextResponse.next({ request: { headers } });
    }

    // If the access token is invalid/expired, attempt an automatic refresh if the
    // client supplied a refresh token. This provides seamless session continuity
    // without forcing a re-login.
    const refreshToken = getRefreshToken(request);
    if (!refreshToken) {
      return jsonError(401, "UNAUTHORIZED", "Session expired. Please sign in again.");
    }

    const refreshed = await refreshSupabaseSession(refreshToken);
    if (!refreshed.ok) {
      return jsonError(401, "UNAUTHORIZED", "Session expired. Please sign in again.");
    }

    const headers = new Headers(request.headers);
    headers.set("authorization", `Bearer ${refreshed.accessToken}`);
    headers.set("x-refresh-token", refreshed.refreshToken);
    if (refreshed.userId) {
      headers.set("x-auth-user-id", refreshed.userId);
    }

    const response = NextResponse.next({ request: { headers } });
    response.headers.set("x-access-token", refreshed.accessToken);
    response.headers.set("x-refresh-token", refreshed.refreshToken);
    response.headers.set("x-token-type", refreshed.tokenType);
    if (refreshed.expiresIn !== null) {
      response.headers.set("x-expires-in", String(refreshed.expiresIn));
    }
    response.headers.set("cache-control", "no-store");

    return response;
  }

  // ---------------------------------------------------------------------------
  // Default web middleware: refresh Supabase SSR cookies for the Next app.
  // ---------------------------------------------------------------------------
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session as a side effect. Do not remove.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Vercel's multi-service rewrite setup (root vercel.json) doesn't support
  // Edge Functions, only Node.js serverless ones - run middleware on Node.
  runtime: "nodejs",
  matcher: [
    // Everything except static assets, images, and the PWA service worker.
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|workbox-.*\\.js).*)",
  ],
};
