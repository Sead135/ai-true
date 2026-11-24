import type { NextConfig } from "next";

/** Origin Nest API without trailing slash. Rewrites strip the `/api` prefix. */
const apiOrigin = (process.env.API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@ii/shared"],
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
