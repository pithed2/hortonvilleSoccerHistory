/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development"

const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  outputFileTracingIncludes: {
    "/coachs-corner/player-cards": ["./data/player-card-examples/og-andy/*.jpg"],
    "/coachs-corner/weekly-review/*/download": ["./data/coachs-corner/weekly-reviews/*.docx"],
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
      "frame-src 'none'",
      "connect-src 'self'",
      ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
    ].join("; ")

    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }]
  },
}

export default nextConfig
