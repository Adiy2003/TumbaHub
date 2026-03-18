"use strict";

// next.config.js
var nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals = [...config.externals || [], "firebase-admin"];
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async"
    });
    config.output.webassemblyModuleFilename = isServer ? "../static/wasm/[name].[hash].wasm" : "static/wasm/[name].[hash].wasm";
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        process: false,
        stream: false,
        util: false,
        crypto: false,
        os: false
      };
    }
    return config;
  },
  output: "standalone"
};
module.exports = nextConfig;
