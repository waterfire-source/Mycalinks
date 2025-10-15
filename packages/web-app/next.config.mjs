/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    // キャッシュを無効化
    config.cache = false;
    // config.optimization.minimize = false;
    return config;
  },
  eslint: {
    // eslintのlint checkをbuild時にoff
    ignoreDuringBuilds: true,
  },
  typescript: {
    // type checkをbuild時にoff
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*', //非会員フォームの件があるため全部OKにする
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'MycaToken, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Myca-Admin-Token',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
