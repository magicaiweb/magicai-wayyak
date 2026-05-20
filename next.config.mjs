/** @type {import('next').NextConfig} */
const staticExport = process.env.STATIC_EXPORT !== 'false'

const nextConfig = {
  ...(staticExport ? {
    output: 'export',
    basePath: '/websites/wayyak',
    assetPrefix: '/websites/wayyak',
    trailingSlash: true,
  } : {}),
  images: { unoptimized: true },
}

export default nextConfig
