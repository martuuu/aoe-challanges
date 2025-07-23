/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido output: 'export' para soportar API routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
