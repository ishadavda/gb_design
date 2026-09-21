const withPWA = require('next-pwa')({
  dest: 'public',
  // A previously installed production worker must not control local Next.js
  // development navigations or RSC requests.
  register: process.env.NODE_ENV === 'production',
  skipWaiting: true,
  // Never cache aggressively in dev - avoids serving stale HMR bundles.
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // App shell / static assets: stale-while-revalidate.
      urlPattern: /^https?.*\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-assets' },
    },
    {
      // Data-dependent routes (balances, receipt status): network-first,
      // so a stale cached response is never shown as if it were current.
      urlPattern: /^https?.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
      },
    },
  ],
});

/**
 * Sent on every response.
 *
 * These live here rather than in vercel.json on purpose: Next emits them itself,
 * so they hold under `next start` and on any host, not only on Vercel. A header
 * that only exists in production is a header nobody ever tests.
 */
const securityHeaders = [
  // Stop the browser second-guessing our Content-Type. Without it a user-uploaded
  // receipt image served as image/* can be sniffed into something executable.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Receipt scanning needs the camera on our own origin. Nothing here needs the
  // rest, and an empty allowlist also denies it to any embedded third-party frame.
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // Vercel terminates TLS and redirects to HTTPS anyway; this closes the gap on
  // the very first request. `preload` is deliberately omitted - submitting to the
  // preload list is a commitment for every subdomain and is painful to undo.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // The service worker must be revalidated on every load. Cached, a client
        // pins itself to the worker it first saw and never picks up a deploy.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Workbox content-hashes this filename, so a change always changes the
        // URL - safe to cache permanently.
        source: '/workbox-:hash.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
