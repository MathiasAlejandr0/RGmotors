/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === "true";
const basePath = isGhPages ? "/RGmotors" : "";

const nextConfig = {
  reactStrictMode: true,
  ...(isGhPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
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
