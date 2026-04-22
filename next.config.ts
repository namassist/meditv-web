import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https://pub-78a60da0218547c9a4f7c101e80b9234.r2.dev https://*.firebasestorage.googleapis.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasestorage.googleapis.com wss://*.firebaseio.com https://medibook.medital.id https://devkss.idempiereonline.com https://ksslive.idempiereonline.com",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
  ],
};

export default nextConfig;
