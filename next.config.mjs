/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === "true";
const basePath = isGhPages ? "/RGmotors" : "";

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      "**/*": [
        "public/**/*",
        "public/cars/**/*",
        "public/cars/inventory/**/*",
        "public/cars/uploads/**/*",
        "public/cars/spin/**/*"
      ],
    },
  },
  // Permite HMR cuando Playwright abre el origen por 127.0.0.1
  allowedDevOrigins: ["127.0.0.1"],
  ...(isGhPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
      }
    : {
        images: {
          remotePatterns: [
            { protocol: "https", hostname: "drive.google.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
          ],
        },
      }),
  // Módulos nativos que no deben empaquetarse: se cargan directo en el server.
  serverExternalPackages: [
    "@napi-rs/canvas",
    "@imgly/background-removal-node",
    "onnxruntime-node",
    "sharp",
  ],
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
