/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'illprovit.vercel.app'] },
  },
  // Vercel multi-zone: /retail proxies to the ProveIt foodservice landing
  // page + ROI calculator, a separate Vercel project/repo built to run
  // under this exact prefix (VITE_BASE_PATH=/retail — see its README).
  // Keep the prefix on both sides of the rewrite so that project's own
  // asset/route links (also built under /retail) resolve correctly.
  async rewrites() {
    return [
      {
        source: '/retail',
        destination: 'https://provit-shauns.vercel.app/retail',
      },
      {
        source: '/retail/:path*',
        destination: 'https://provit-shauns.vercel.app/retail/:path*',
      },
    ]
  },
}

module.exports = nextConfig
