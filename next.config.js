/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/alpha",
  images: {
    domains: ["localhost", "images.unsplash.com", "api.mapbox.com"],
  },
};

module.exports = nextConfig;
