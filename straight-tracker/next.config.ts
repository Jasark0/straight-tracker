// next.config.js
import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';

const nextConfig: NextConfig = {
  // Configure for both webpack and turbopack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.plugins.push(
        codeInspectorPlugin({
          bundler: 'webpack',
        })
      );
    }
    return config;
  },
  
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
    }),
  },
};

export default nextConfig;