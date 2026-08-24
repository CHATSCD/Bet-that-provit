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
  // Stops Next injecting its own automatic trailing-slash redirect ahead of
  // the rewrite below — doesn't change any existing route's behavior, since
  // none of this app's pages are linked with a trailing slash.
  skipTrailingSlashRedirect: true,
  // Vercel multi-zone: /retail proxies to the ProveIt foodservice landing
  // page + ROI calculator, a separate Vercel project/repo built to run
  // under this exact prefix (VITE_BASE_PATH=/retail — see its README).
  //
  // One rule, deliberately not two: Next's redirect/rewrite `source`
  // matching is trailing-slash-*insensitive* (a `source: '/retail'` rule
  // matches "/retail/" too), so an earlier version of this that split bare
  // "/retail" (redirect) from "/retail/:path*" (rewrite) into separate
  // rules had the redirect rule catching its own already-slashed output and
  // looping forever. A single `:path*` rule sidesteps that entirely — the
  // trailing `*` makes the preceding slash optional, so it matches "/retail"
  // and "/retail/foo" alike, and always proxies straight to the target's
  // already-slashed root — no redirect, no ambiguity, nothing to loop.
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
