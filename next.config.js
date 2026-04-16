/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'chartjs-node-canvas', 'canvas'],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      puppeteer: 'commonjs puppeteer',
      canvas: 'commonjs canvas',
    });
    return config;
  },
};

module.exports = nextConfig;
