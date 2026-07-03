/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // HTML documents (everything except Next's static assets and the API):
        // always revalidate so a user never sees a stale page — e.g. an old
        // login screen — even though the WebView now keeps its cache. The heavy
        // hashed assets under /_next/static keep their immutable long-cache
        // (Next.js sets that automatically), so repeat loads stay fast.
        source: "/:path((?!_next/|api/).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
