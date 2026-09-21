/**
 * Sent on every response. Same reasoning as apps/web: Next emits these itself,
 * so they hold under `next start` and on any host, not only on Vercel.
 *
 * This service has no browser UI worth framing and no device APIs to hand out,
 * so the policy is stricter than the consumer app's.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Health and OCR results are per-request. A cached 200 here would let a
        // dead instance keep reporting itself healthy.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;
