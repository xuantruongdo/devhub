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
    const s3 = process.env.NEXT_PUBLIC_S3_DOMAIN;

    return s3
      ? [
          {
            source: "/images/:slug*",
            destination: `${s3}/images/:slug*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
