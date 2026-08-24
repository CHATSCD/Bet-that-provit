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
  // The /retail rewrite target's own root route naturally redirects bare
  // "/retail" to "/retail/" when hit directly. Without this, Next's default
  // trailing-slash normalization (which strips slashes) fights that the
  // opposite way once the request is proxied, producing an infinite
  // /retail <-> /retail/ loop. This only stops Next from injecting its own
  // trailing-slash redirects — it doesn't change any existing route's
  // behavior, since none of this app's pages are linked with a trailing
  // slash. The explicit redirect below replaces what Next would have done
  // automatically, but scoped to just this one path.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: '/retail',
        destination: '/retail/',
        permanent: false,
      },
    ]
  },
  // Vercel multi-zone: /retail proxies to the ProveIt foodservice landing
  // page + ROI calculator, a separate Vercel project/repo built to run
  // under this exact prefix (VITE_BASE_PATH=/retail — see its README).
  // Only the trailing-slash form is rewritten — the bare form is handled by
  // the redirect above, so the rewrite target's own root route is never
  // asked to redirect (that's what looped in the first place).
  async rewrites() {
    return [
      {
        source: '/retail/:path*',
        destination: 'https://provit-shauns.vercel.app/retail/:path*',
      },
    ]
  },
}

module.exports = nextConfig
