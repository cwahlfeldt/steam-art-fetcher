/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        largePageDataBytes: 16 * 10000000,
    },
}

module.exports = nextConfig
