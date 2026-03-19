/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent firebase-admin from being bundled on the client
    config.externals = [...(config.externals || []), 'firebase-admin']

    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    config.output.webassemblyModuleFilename =
      isServer ? '../static/wasm/[name].[hash].wasm' : 'static/wasm/[name].[hash].wasm'

    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        process: false,
        stream: false,
        util: false,
        crypto: false,
        os: false,
      }
    }

    return config
  },
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // לכתובות שמגיעות מה-Admin SDK
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // לכתובות שמגיעות מה-Client SDK
      }
    ]
  }

}

module.exports = nextConfig
