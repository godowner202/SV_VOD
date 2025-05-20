/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration for next/image
  images: {
    domains: [
      'image.tmdb.org',  // TMDB image CDN
      'avatars.dicebear.com', // Fallback avatar API
      'supabase.co', // For Supabase storage
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/movies',
        destination: '/browse',
        permanent: true,
      },
      {
        source: '/watch/:id',
        destination: '/player/:id',
        permanent: true,
      },
    ];
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        // Cache static assets for better performance
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Environment variable configuration
  env: {
    APP_VERSION: '1.0.0',
  },
  
  // Webpack configuration (optional)
  webpack(config) {
    // SVG loader configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    return config;
  },
};

module.exports = nextConfig;