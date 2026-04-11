const path = require('path');

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  experimental: {
    esmExternals: false,
    //jsconfigPaths: true,
  },
  webpack: (config, { isServer }) => {
    // Add custom alias for apexcharts
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision'),
    };

    // Handle `fs` module issue for client-side rendering
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: false,
      };
    }

    return config;
  },
};
