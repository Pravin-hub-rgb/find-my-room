import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['react-leaflet'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bphkdzqmnldjzohtctrz.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
