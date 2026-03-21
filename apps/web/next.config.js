/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tasksuite/ui", "@tasksuite/types"],
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    // Fallback to Railway production URL when NEXT_PUBLIC_API_URL is not explicitly set in Vercel
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://tasksuite-api-production.up.railway.app"
        : "http://localhost:3001"),
  },
};

module.exports = nextConfig;
