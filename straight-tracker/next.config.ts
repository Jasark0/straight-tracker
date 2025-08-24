import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Only configure turbopack in development
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      rules: codeInspectorPlugin({
        bundler: 'turbopack',
        hideDomPathAttr: true,
        behavior: {
          copy: true,
          locate: true,
        },
      }),
    },
  }),
};

export default nextConfig;