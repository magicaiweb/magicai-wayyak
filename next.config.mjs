/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/websites/wayyak',
  assetPrefix: '/websites/wayyak',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
