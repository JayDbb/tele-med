import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle CommonJS modules in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    // Add alias for packages directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/contexts': __dirname + '/src/contexts',
      '@/types': __dirname + '/../../packages/types',
      '@/utils': __dirname + '/../../packages/utils',
    };
    return config;
  },
};

export default nextConfig;