/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    pageExtensions: ['page.tsx', 'page.ts'],
    swcMinify: true,
    reactStrictMode: true,
    images: { remotePatterns: [{ hostname: 'localhost' }, { hostname: 'vendure-dev.aexol.com' }] },
};

module.exports = nextConfig;
