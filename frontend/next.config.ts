/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_S3_DOMAIN
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_PUBLIC_S3_DOMAIN.replace(
                "https://",
                "",
              ),
            },
          ]
        : []),
    ],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    return [
      {
        source: "/images/:slug*",
        destination: `${process.env.NEXT_PUBLIC_S3_DOMAIN}/images/:slug*`,
      },
    ];
  },
};

module.exports = nextConfig;
