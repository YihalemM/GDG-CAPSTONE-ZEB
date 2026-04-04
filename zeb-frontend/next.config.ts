import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'zeb-1.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
  // experimental: {
  //   turbo: {
  //     noTurbo: true,
  //   },
  // },

};

export default nextConfig;
