import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Add polyfills for Node.js modules required by Plotly.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        url: require.resolve('url'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        vm: require.resolve('vm-browserify'),
        zlib: require.resolve('browserify-zlib'),
        fs: false,
        net: false,
        tls: false,
      };

      // Provide global Buffer for browser environment
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    return config;
  },
};

export default nextConfig;
