/** @type {import('next').NextConfig} */
const nextConfig = {
  // Admin profile photos are up to 5MB; leave room for the form overhead.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
