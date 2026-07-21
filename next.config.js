/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: [
        '192.168.0.85', '127.0.0.1'
    ],
    images: {
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '192.168.0.85',
                port: '8000',
                pathname: '/storage/**',
            },
            {
                protocol: "https",
                hostname: "api.mossim.net",
                pathname: "/storage/**",
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/storage/**',
            },
        ],
    },
}

module.exports = nextConfig