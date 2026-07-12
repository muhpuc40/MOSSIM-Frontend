/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    allowedDevOrigins: [
        '192.168.1.81',
    ],
    images: {
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '192.168.1.81',
                port: '8000',
                pathname: '/storage/**',
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