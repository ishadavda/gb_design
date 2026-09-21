import { NextResponse } from "next/server";

// Never prerender: a health check baked at build time reports the build, not
// the running instance.
export const dynamic = "force-dynamic";

/**
 * Liveness probe.
 *
 * The deployment fields come from Vercel's system environment variables and are
 * here so you can tell *which* deployment answered - the whole point of running
 * two apps off one repo is being able to prove they deploy independently.
 * Everything returned is already public in the response headers or the URL; no
 * secrets belong in this payload.
 */
export function GET() {
  return NextResponse.json({
    service: "ocr",
    status: "ok",
    timestamp: new Date().toISOString(),
    deployment: {
      environment: process.env.VERCEL_ENV ?? "local",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
      region: process.env.VERCEL_REGION ?? "local",
    },
  });
}
